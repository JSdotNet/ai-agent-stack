import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkStackConfig } from '../../tools/stack-config/check.mjs';
import { idResolver, migrateConfig, needsMigration } from './migrate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(HERE, '..', '..', 'resources', 'config.schema.json'), 'utf8'));

/** A fake plugin tree: `{ plugin: { agents: [...], skills: [...] } }`. */
function plugins(tree) {
    const root = mkdtempSync(join(tmpdir(), 'phase-maps-'));
    for (const [name, { agents = [], skills = [] }] of Object.entries(tree)) {
        for (const agent of agents) {
            mkdirSync(join(root, name, 'agents'), { recursive: true });
            writeFileSync(join(root, name, 'agents', `${agent}.agent.md`), '');
        }
        for (const skill of skills) {
            mkdirSync(join(root, name, 'skills', skill), { recursive: true });
            writeFileSync(join(root, name, 'skills', skill, 'SKILL.md'), '');
        }
    }
    return idResolver({ root: null, locate: (name) => (tree[name] ? join(root, name) : null) });
}

const resolve = plugins({
    architecture: { agents: ['architect'] },
    qa: { agents: ['qa', 'qa-monitor'], skills: ['playwright-validation'] },
    'csharp-coding': { agents: ['coding'] },
    'domain-design': { agents: ['domain-architect'] },
    devbook: { skills: ['verify-change', 'validate'] },
    'devbook-openspec': { skills: ['spec'] },
});

const old = {
    id: 'backlog',
    bindings: {
        'delivery.tracker': { provider: 'backlog' },
        'delivery.roles': { architecture: 'architecture', qa: 'qa', domain: 'domain-design', product: null, security: 'security' },
        'delivery.mcp': { spec: ['backlog'], deliver: ['backlog'] },
    },
    extensions: {
        'session.start': ['devbook:validate'],
        implement: 'csharp-coding:coding',
        verify: 'devbook:verify-change',
        spec: 'devbook-openspec:spec',
        'qa.run': 'qa:playwright-validation',
        'app.start': null,
        'flow.end': ['devbook:update'],
    },
    policy: { 'qa.ceiling': 'full' },
    gates: [
        { at: 'spec', when: 'after', purpose: 'approval' },
        { at: 'verify', when: 'after', purpose: 'risk' },
    ],
    components: { delivery: { pluginVersion: '1.13.0' } },
};

test('the committed file comes out complete, valid, and in the mapping table', () => {
    const { config, notes, changed } = migrateConfig(old, { resolve });
    assert.equal(changed, true);
    assert.deepEqual(checkStackConfig(config, schema), []);
    assert.equal('extensions' in config, false);
    assert.deepEqual(config.bindings, { 'delivery.tracker': { provider: 'backlog' } });

    const code = config.phases['flow-code'];
    const spec = config.phases['flow-spec'];
    assert.deepEqual(code['phase-update-base'], { before: ['devbook:validate'] });
    assert.deepEqual(spec['phase-update-base'], { before: ['devbook:validate'] });
    assert.deepEqual(code['phase-scope'], { skill: 'devbook-openspec:spec', agent: 'architecture:architect', mcp: ['backlog'] });
    assert.deepEqual(code['phase-plan'], { agent: 'architecture:architect' });
    assert.deepEqual(code['phase-implement'], { agent: 'csharp-coding:coding' });
    assert.deepEqual(code['phase-verify'], { skill: 'qa:playwright-validation', app: null });
    assert.deepEqual(code['phase-spec-check'], { skill: 'devbook:verify-change' });
    assert.deepEqual(code['phase-create-pr'], { mcp: ['backlog'] });
    assert.deepEqual(code['phase-summary'], { after: ['devbook:update'] });
    assert.deepEqual(code['phase-review'], {});
    assert.deepEqual(spec['phase-drafting:arc42'], { agent: 'architecture:architect' });
    assert.deepEqual(spec['phase-drafting:domain'], { agent: 'domain-design:domain-architect' });
    assert.deepEqual(spec['phase-drafting:design'], {});
    assert.deepEqual(config.gates.map((g) => g.at), ['scope', 'spec-check']);

    assert.ok(notes.some((n) => n.includes('qa ships 2 agents')), 'a bare plugin with two agents is reported');
    assert.ok(notes.some((n) => n.includes('security role')), 'a dropped role is reported');
    assert.deepEqual(Object.keys(config), ['id', 'bindings', 'phases', 'policy', 'gates', 'components']);
});

test('a second run changes nothing', () => {
    const once = migrateConfig(old, { resolve }).config;
    assert.equal(needsMigration(once), false);
    assert.deepEqual(migrateConfig(once, { resolve }), { config: once, notes: [], changed: false });
});

test('a gate on verify alone is the 1.14.0 phase, and is left alone', () => {
    const config = { phases: {}, gates: [{ at: 'verify', when: 'before', purpose: 'cost' }] };
    assert.equal(needsMigration(config), false);
});

test('an overlay stays partial', () => {
    const { config } = migrateConfig({ bindings: { 'delivery.roles': { qa: 'qa:qa' } } }, { overlay: true, resolve });
    assert.deepEqual(config, { phases: { 'flow-code': { 'phase-verify': { agent: 'qa:qa' } } } });
    assert.deepEqual(checkStackConfig(config, schema, { overlay: true }), []);
});

test('a map under a retired flow moves into flow-code, and flow-code wins', () => {
    const input = {
        phases: {
            'flow-code': { 'phase-implement': { model: 'opus' } },
            'flow-update-packages': { 'phase-implement': { model: 'sonnet', effort: 'low' }, 'phase-drafting': {} },
        },
    };
    const { config, notes } = migrateConfig(input, { resolve });
    assert.deepEqual(config.phases['flow-code']['phase-implement'], { model: 'opus', effort: 'low' });
    assert.equal('flow-update-packages' in config.phases, false);
    assert.ok(notes.some((n) => n.includes('flow-code has no phase-drafting')));
    assert.deepEqual(checkStackConfig(config, schema), []);
    assert.deepEqual(input.phases['flow-code'], { 'phase-implement': { model: 'opus' } }, 'the input is not mutated');
});

test('a null implement forces the phase inline', () => {
    const { config } = migrateConfig({ extensions: { implement: null, verify: null } }, { resolve });
    assert.deepEqual(config.phases['flow-code']['phase-implement'], { agent: null });
    assert.deepEqual(config.phases['flow-code']['phase-spec-check'], {});
});
