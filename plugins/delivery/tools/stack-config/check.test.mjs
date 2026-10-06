import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    checkLocalOverlay,
    checkStackConfig,
    mergeStackConfig,
    overlayPaths,
    resolveStackConfig,
    userConfigDir,
} from './check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
    readFileSync(join(HERE, '..', '..', 'resources', 'config.schema.json'), 'utf8'),
);

const check = (config) => checkStackConfig(config, schema);

const FLOWS = schema.properties.phases['x-flows'];
const completeMap = (flow) => Object.fromEntries(FLOWS[flow].phases.map((phase) => [phase, {}]));
const codeMap = () => completeMap('flow-code');
const specMap = () => completeMap('flow-spec');
const chore = (list, where = 'phase-summary', key = 'after') => ({
    phases: { 'flow-code': { ...codeMap(), [where]: { [key]: list } } },
});

test('an empty config is valid', () => {
    assert.deepEqual(check({}), []);
});

test('a component entry is left to its own component', () => {
    assert.deepEqual(check({ components: { devbook: { anything: true } } }), []);
});

test('a top-level key that is neither engine-owned nor a component is rejected by name', () => {
    const errors = check({ polciy: { 'qa.depth': 'targeted' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown top-level key "polciy"/);
});

test('a stray top-level key is caught even when everything owned is valid', () => {
    const errors = check({ policy: { 'qa.depth': 'targeted' }, extenions: { spec: null } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown top-level key "extenions"/);
});

test('a JSON annotation belongs to nobody and is neither owned nor unknown', () => {
    assert.deepEqual(check({ $schema: './config.schema.json', $comment: 'ours' }), []);
});

test('id is a folder name: lowercase, digits, single hyphens', () => {
    assert.deepEqual(check({ id: 'jsdotnet-devbook' }), []);
    assert.deepEqual(check({ id: 'app2' }), []);
    for (const bad of ['JSdotNet/devbook', 'My Repo', '-lead', 'trail-', 'a--b', '']) {
        assert.ok(check({ id: bad }).length, bad);
    }
    assert.match(check({ id: 'My Repo' })[0], /is not a repository id/);
});

test('the shipped template validates as it stands', () => {
    const template = JSON.parse(
        readFileSync(join(HERE, '..', '..', 'resources', 'config-template.json'), 'utf8'),
    );
    assert.deepEqual(check(template), []);
});

test('the shipped template carries both complete maps', () => {
    const template = JSON.parse(
        readFileSync(join(HERE, '..', '..', 'resources', 'config-template.json'), 'utf8'),
    );
    assert.deepEqual(Object.keys(template.phases), ['flow-code', 'flow-spec']);
    for (const local of [false, true]) {
        const file = local ? 'config.local-template.json' : 'config-template.json';
        const { phases } = JSON.parse(readFileSync(join(HERE, '..', '..', 'resources', file), 'utf8'));
        assert.deepEqual(checkStackConfig({ phases }, schema), [], file);
    }
});

test('the shipped templates keep the fork phases forked', () => {
    // Any of agent, model, or effort delegates a phase (resources/phase-resolution.md).
    for (const file of ['config-template.json', 'config.local-template.json']) {
        const { phases } = JSON.parse(readFileSync(join(HERE, '..', '..', 'resources', file), 'utf8'));
        for (const phase of ['phase-scope', 'phase-implement', 'phase-review']) {
            const entry = phases['flow-code'][phase];
            assert.deepEqual(['agent', 'model', 'effort'].filter((k) => k in entry), [], `${file} › ${phase}`);
        }
    }
});

test('pr.base takes a git ref name and refuses prose', () => {
    assert.deepEqual(check({ policy: { 'pr.base': 'main' } }), []);
    assert.deepEqual(check({ policy: { 'pr.base': 'release/2.0' } }), []);
    for (const bad of ['the default branch', 'feature..old', 'main.lock', '/main', 'main/', '']) {
        assert.ok(check({ policy: { 'pr.base': bad } }).length, bad);
    }
    assert.match(
        check({ policy: { 'pr.base': 'the default branch' } })[0],
        /is not a well-formed git ref name/,
    );
});

test('the worked example from the surface contract validates', () => {
    assert.deepEqual(
        check({
            bindings: { 'delivery.tracker': { provider: 'github' } },
            phases: {
                'flow-code': {
                    ...codeMap(),
                    'phase-update-base': { before: ['devbook:validate'] },
                    'phase-scope': { skill: 'your-architecture-plugin:draft-spec', mcp: ['your-guidelines-server'] },
                    'phase-implement': { agent: 'csharp-coding:coding', model: 'opus', effort: 'high' },
                    'phase-verify': {
                        agent: 'qa:qa',
                        app: { provider: 'your-qa-plugin:qa', host: 'aspire' },
                        before: [{ run: 'repo:seed-test-data', 'on-failure': 'required' }],
                    },
                },
            },
            policy: { 'qa.depth': 'targeted', 'review.retryBudget': 1, 'pr.base': 'main' },
            gates: [
                {
                    at: 'scope',
                    when: 'after',
                    purpose: 'approval',
                    show: 'artifact',
                    unattended: 'block',
                },
            ],
        }),
        [],
    );
});

test('an unknown policy key is rejected, not ignored', () => {
    const errors = check({ policy: { 'qa.dept': 'targeted' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown key "qa\.dept"/);
});

test('a phase outside its flow is rejected by name', () => {
    const errors = check({ phases: { 'flow-code': { ...codeMap(), 'phase-drafting:arc42': {} } } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^phases\.flow-code: unknown phase "phase-drafting" — flow-code has phase-update-base/);
    assert.match(check({ phases: { 'flow-spec': { ...specMap(), 'phase-deploy': {} } } })[0], /unknown phase "phase-deploy"/);
});

test('the spec check is a phase with a skill, and takes no retry budget of its own', () => {
    assert.deepEqual(
        check({
            phases: { 'flow-code': { ...codeMap(), 'phase-spec-check': { skill: 'devbook:verify-change' } } },
            policy: { 'review.retryBudget': 1, 'ready.retryBudget': 2 },
            gates: [{ at: 'spec-check', when: 'after', purpose: 'risk' }],
        }),
        [],
    );
    const errors = check({ policy: { 'verify.retryBudget': 2 } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown key "verify\.retryBudget"/);
});

test('an out-of-enum policy value is rejected', () => {
    const errors = check({ policy: { 'qa.depth': 'thorough' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /not one of full, targeted, startup-only, skipped/);
});

test('openspec.scenarios takes advisory or linked and nothing else', () => {
    assert.deepEqual(check({ policy: { 'openspec.scenarios': 'advisory' } }), []);
    assert.deepEqual(check({ policy: { 'openspec.scenarios': 'linked' } }), []);
    assert.equal(check({ policy: { 'openspec.scenarios': 'required' } }).length, 1);
});

test('personalValidation may only say required', () => {
    assert.deepEqual(check({ policy: { 'gate.personalValidation': 'required' } }), []);
    assert.equal(check({ policy: { 'gate.personalValidation': 'optional' } }).length, 1);
});

test('commit.at takes gate or manual and nothing else', () => {
    assert.deepEqual(check({ policy: { 'commit.at': 'gate' } }), []);
    assert.deepEqual(check({ policy: { 'commit.at': 'manual' } }), []);
    assert.equal(check({ policy: { 'commit.at': 'every-stage' } }).length, 1);
});

test('a gate needs at, when, and purpose', () => {
    const errors = check({ gates: [{ at: 'scope' }] });
    assert.equal(errors.length, 2);
    assert.match(errors.join(' '), /missing required key "when"/);
    assert.match(errors.join(' '), /missing required key "purpose"/);
});

test('a gate may not attach to a phase the engine does not declare', () => {
    const errors = check({ gates: [{ at: 'deploy', when: 'before', purpose: 'risk' }] });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /"deploy" is not one of/);
    for (const at of ['personal-validation', 'ready']) {
        assert.equal(check({ gates: [{ at, when: 'before', purpose: 'risk' }] }).length, 1, at);
    }
});

test('a negative budget is rejected', () => {
    assert.equal(check({ policy: { 'gate.reviseBudget': -1 } }).length, 1);
});

test('a chore list takes a list, not a bare provider', () => {
    assert.deepEqual(check(chore(['delivery:capture-improvement'])), []);
    assert.equal(check(chore('delivery:capture-improvement')).length, 1);
});

test('a chore on-failure value is a closed enum', () => {
    const errors = check(chore([{ run: 'repo:docs', 'on-failure': 'maybe' }]));
    assert.equal(errors.length, 1);
});

test('a chore may carry --flag arguments after its id, in either form', () => {
    assert.deepEqual(
        check(
            chore(
                ['repo:replan --dry-run', { run: 'your-plugin:status --replan', 'on-failure': 'required' }],
                'phase-scope',
            ),
        ),
        [],
    );
});

test('a chore argument is a --flag, never free text or a bare word', () => {
    for (const run of ['your-plugin:status replan', 'your-plugin:status --Replan', 'your-plugin:status --replan; rm -rf /']) {
        assert.equal(check(chore([{ run }], 'phase-scope')).length, 1, run);
    }
});

test("a phase's skill takes no arguments", () => {
    assert.equal(check({ phases: { 'flow-code': { ...codeMap(), 'phase-scope': { skill: 'your-plugin:spec --replan' } } } }).length, 1);
});

test('null agent runs a phase inline deliberately, which is not the same as absent', () => {
    const withAgent = (agent) => check({ phases: { 'flow-code': { ...codeMap(), 'phase-verify': { agent, model: 'sonnet' } } } });
    assert.deepEqual(withAgent(null), []);
    assert.deepEqual(withAgent('qa'), []);
    assert.deepEqual(withAgent('qa:qa'), []);
    assert.deepEqual(withAgent('repo:reviewer'), []);
    assert.equal(withAgent(42).length, 1);
    assert.equal(withAgent('QA:qa').length, 1);
});

test('the tracker provider set is closed', () => {
    assert.deepEqual(check({ bindings: { 'delivery.tracker': { provider: 'jira', project: 'FIN' } } }), []);
    assert.deepEqual(check({ bindings: { 'delivery.tracker': { provider: 'markdown', folder: 'work' } } }), []);
    assert.equal(check({ bindings: { 'delivery.tracker': { provider: 'trello' } } }).length, 1);
});

test('a tracker may be a plugin:skill provider in provider-id shape', () => {
    assert.deepEqual(check({ bindings: { 'delivery.tracker': { provider: 'your-tracker:work-items' } } }), []);
    assert.equal(check({ bindings: { 'delivery.tracker': { provider: 'Your:Skill' } } }).length, 1);
});

test('the grill binding takes one provider id or null, never a list', () => {
    assert.deepEqual(check({ bindings: { 'openspec.grill': 'your-agents:grill-me' } }), []);
    assert.deepEqual(check({ bindings: { 'openspec.grill': null } }), []);
    assert.equal(check({ bindings: { 'openspec.grill': ['your-agents:grill-me'] } }).length, 1);
    assert.equal(check({ bindings: { 'openspec.gril': 'your-agents:grill-me' } }).length, 1);
});

test('a surface preference is an ordered list of delivery-surface-* server names', () => {
    assert.deepEqual(check({ bindings: { 'delivery.surface': ['delivery-surface-backlog', 'delivery-surface-dashboard'] } }), []);
    assert.deepEqual(check({ bindings: { 'delivery.surface': [] } }), []);
});

test('a surface preference names only delivery-surface-* servers', () => {
    const errors = check({ bindings: { 'delivery.surface': ['delivery-surface-dashboard', 'backlog'] } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /\[1\]: "backlog" is not a surface server name/);
});

test('a surface preference is a list, never a single name', () => {
    const errors = check({ bindings: { 'delivery.surface': 'delivery-surface-dashboard' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /expected array, got string/);
});

test('a machine may set its own surface preference in an overlay', () => {
    const overlay = { bindings: { 'delivery.surface': ['delivery-surface-collector'] } };
    assert.deepEqual(checkLocalOverlay(overlay), []);
    assert.deepEqual(checkStackConfig(overlay, schema, { overlay: true }), []);
    const merged = mergeStackConfig({ bindings: { 'delivery.surface': ['delivery-surface-dashboard', 'delivery-surface-backlog'] } }, overlay);
    assert.deepEqual(merged.bindings['delivery.surface'], ['delivery-surface-collector']);
});

test("a phase's MCP servers are a list of server ids", () => {
    const mcp = (value) => check({ phases: { 'flow-code': { ...codeMap(), 'phase-implement': { mcp: value } } } });
    assert.deepEqual(mcp(['microsoft-learn']), []);
    assert.equal(mcp('your-guidelines-server').length, 1);
    assert.equal(mcp(['mcp__plugin x']).length, 1);
});

test("a phase's mcp may be null for deliberately none", () => {
    assert.deepEqual(check({ phases: { 'flow-code': { ...codeMap(), 'phase-scope': { mcp: null } } } }), []);
});

test('a model and an effort are phase fields, and nowhere else', () => {
    const entry = (fields) => check({ phases: { 'flow-code': { ...codeMap(), 'phase-review': fields } } });
    for (const model of ['opus', 'sonnet', 'haiku', 'fable', 'inherit', 'claude-opus-5-5', 'claude-sonnet-5-5[1m]', 'us.anthropic.claude-opus-5-5-v1:0']) {
        assert.deepEqual(entry({ model }), [], model);
    }
    for (const effort of ['low', 'medium', 'high', 'xhigh', 'max', 'inherit']) {
        assert.deepEqual(entry({ effort }), [], effort);
    }
    assert.match(entry({ model: 'the strong one' })[0], /is not a model alias/);
    assert.equal(entry({ effort: 'extreme' }).length, 1);
    assert.equal(check({ policy: { model: 'opus' } }).length, 1);
    assert.equal(check({ bindings: { 'delivery.model': 'opus' } }).length, 1);
});

// The phases map — one complete map per engine flow in the committed file, partial in an
// overlay, and the keys it replaced refused by name with a pointer to delivery:update.

test('both complete maps validate, and {} is a complete entry', () => {
    assert.deepEqual(check({ phases: { 'flow-code': codeMap(), 'flow-spec': specMap() } }), []);
});

test('a committed map missing a phase is rejected, naming the phase', () => {
    const map = codeMap();
    delete map['phase-review'];
    const errors = check({ phases: { 'flow-code': map } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^phases\.flow-code: missing "phase-review"/);
});

test('an overlay names only what it changes', () => {
    const overlay = { phases: { 'flow-code': { 'phase-review': { model: 'sonnet' } } } };
    assert.deepEqual(checkStackConfig(overlay, schema, { overlay: true }), []);
    assert.deepEqual(checkLocalOverlay(overlay), []);
});

test('an overlay still may not name a phase its flow lacks', () => {
    const errors = checkStackConfig({ phases: { 'flow-spec': { 'phase-implement': {} } } }, schema, { overlay: true });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown phase "phase-implement" — flow-spec has/);
});

test('Personal Validation and the ready check are refused by name in any map and any layer', () => {
    for (const phase of ['phase-personal-validation', 'phase-ready']) {
        for (const flow of ['flow-code', 'flow-spec', 'flow-release']) {
            const base = flow === 'flow-code' ? codeMap() : flow === 'flow-spec' ? specMap() : {};
            const errors = check({ phases: { [flow]: { ...base, [phase]: {} } } });
            assert.equal(errors.length, 1, `${flow} ${phase}`);
            assert.match(errors[0], new RegExp(`^phases\\.${flow}\\.${phase}: ${phase} `));
            assert.equal(checkStackConfig({ phases: { [flow]: { [phase]: {} } } }, schema, { overlay: true }).length, 1);
        }
    }
    assert.match(check({ phases: { 'flow-code': { ...codeMap(), 'phase-personal-validation': { model: 'opus' } } } })[0], /refuses every field/);
});

test('an unknown flow is rejected by name', () => {
    const errors = check({ phases: { code: codeMap() } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^phases: unknown flow "code" — a map is keyed by a flow's skill name: flow-code, flow-spec, or a repo-native flow-\*/);
});

test('a retired flow is refused with a pointer to delivery:update', () => {
    for (const flow of ['flow-update-packages', 'flow-project']) {
        const errors = check({ phases: { [flow]: { 'phase-implement': {} } } });
        assert.equal(errors.length, 1, flow);
        assert.match(errors[0], new RegExp(`^phases\\.${flow}: removed in 1\\.14\\.0 — .*flow-code.*Run delivery:update`));
    }
});

test('a repo-native flow takes a map of its own phase ids, checked for shape but not completeness', () => {
    // Called with no repository to look in, the flow's name is checked for shape alone.
    assert.deepEqual(check({ phases: { 'flow-release': { 'phase-tag': { model: 'haiku' }, 'phase-implement': {} } } }), []);
    assert.match(check({ phases: { 'flow-release': { tag: {} } } })[0], /"tag" is not a phase key/);
    assert.match(check({ phases: { 'flow-release': { 'phase-tag': { modle: 'haiku' } } } })[0], /unknown key "modle"/);
});

test("drafting is complete with its bare entry or one entry per folder, and refuses a folder flow-spec lacks", () => {
    const { 'phase-drafting': _, ...rest } = specMap();
    const folders = Object.fromEntries(['arc42', 'domain', 'tech', 'design', 'ai'].map((f) => [`phase-drafting:${f}`, {}]));
    assert.deepEqual(check({ phases: { 'flow-spec': { ...rest, ...folders } } }), []);
    assert.deepEqual(check({ phases: { 'flow-spec': { ...specMap(), 'phase-drafting:design': { model: 'sonnet' } } } }), []);

    const { 'phase-drafting:ai': __, ...partial } = folders;
    assert.match(check({ phases: { 'flow-spec': { ...rest, ...partial } } })[0], /missing "phase-drafting"/);
    assert.match(
        check({ phases: { 'flow-spec': { ...specMap(), 'phase-drafting:docs': {} } } })[0],
        /"phase-drafting:docs" — phase-drafting in flow-spec is qualified by a folder: arc42, domain, tech, design, ai/,
    );
});

test('a qualifier on a phase that takes none is rejected', () => {
    assert.match(
        check({ phases: { 'flow-code': { ...codeMap(), 'phase-review:frontend': {} } } })[0],
        /"phase-review:frontend" — phase-review takes no qualifier in flow-code/,
    );
});

test('implement is qualified by frontend and backend, or by the areas the config declares', () => {
    assert.deepEqual(check({ phases: { 'flow-code': { ...codeMap(), 'phase-implement:frontend': { model: 'sonnet' } } } }), []);
    assert.match(check({ phases: { 'flow-code': { ...codeMap(), 'phase-implement:api': {} } } })[0], /qualified by an area: frontend, backend/);

    const areas = { api: ['src/Api/**'], web: ['src/Web/**'] };
    assert.deepEqual(check({ areas, phases: { 'flow-code': { ...codeMap(), 'phase-implement:api': {} } } }), []);
    assert.match(check({ areas, phases: { 'flow-code': { ...codeMap(), 'phase-implement:frontend': {} } } })[0], /qualified by an area: api, web/);
});

test("an overlay's area qualifier is settled against the merge, where the committed areas are", () => {
    const committed = { areas: { api: ['src/Api/**'] }, phases: { 'flow-code': codeMap() } };
    const overlay = { phases: { 'flow-code': { 'phase-implement:api': { model: 'sonnet' } } } };
    assert.deepEqual(checkStackConfig(overlay, schema, { overlay: true }), []);
    assert.deepEqual(checkStackConfig(mergeStackConfig(committed, overlay), schema, { overlay: true, merged: true }), []);

    const stray = { phases: { 'flow-code': { 'phase-implement:mobile': {} } } };
    assert.deepEqual(checkStackConfig(stray, schema, { overlay: true }), []);
    assert.equal(checkStackConfig(mergeStackConfig(committed, stray), schema, { overlay: true, merged: true }).length, 1);
});

test('areas are path globs per area, and an area name is a qualifier', () => {
    assert.deepEqual(check({ areas: { frontend: ['src/**/*.UI/**'], backend: ['src/**'] } }), []);
    assert.equal(check({ areas: { frontend: 'src/**' } }).length, 1);
    assert.equal(check({ areas: { frontend: [''] } }).length, 1);
    assert.match(check({ areas: { Front_End: ['src/**'] } })[0], /"Front_End" is not an area name/);
});

test('app belongs to phase-verify and targets to phase-report-back, and nowhere else', () => {
    const map = (extra) => check({ phases: { 'flow-code': { ...codeMap(), ...extra } } });
    assert.deepEqual(map({ 'phase-verify': { app: null } }), []);
    assert.deepEqual(map({ 'phase-verify': { app: 'repo:run' } }), []);
    assert.deepEqual(map({ 'phase-report-back': { targets: ['origin', 'linked', 'your-chat:post-result'] } }), []);
    assert.match(map({ 'phase-build-test': { app: null } })[0], /phase-build-test: unknown key "app"/);
    assert.match(map({ 'phase-summary': { targets: ['origin'] } })[0], /phase-summary: unknown key "targets"/);
    assert.equal(map({ 'phase-report-back': { targets: ['everyone'] } }).length, 1);
    assert.equal(map({ 'phase-report-back': { targets: 'origin' } }).length, 1);
});

test('extensions, delivery.roles, and delivery.mcp are refused by name with a pointer to delivery:update', () => {
    const errors = check({
        bindings: { 'delivery.roles': { qa: null }, 'delivery.mcp': { spec: null }, 'delivery.tracker': null },
        extensions: { verify: 'devbook:verify-change' },
    });
    assert.equal(errors.length, 3);
    assert.match(errors[0], /^extensions: removed in 1\.14\.0 — .*Run delivery:update/);
    assert.match(errors[1], /^bindings\["delivery\.roles"\]: removed in 1\.14\.0 — .*Run delivery:update/);
    assert.match(errors[2], /^bindings\["delivery\.mcp"\]: removed in 1\.14\.0 — .*Run delivery:update/);
    assert.equal(checkStackConfig({ extensions: {} }, schema, { overlay: true }).length, 1);
});

test('a gate on a retired extension point is refused with a pointer to delivery:update', () => {
    const errors = check({ gates: [{ at: 'deliver', when: 'before', purpose: 'approval' }] });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^gates\[0\]\.at: removed in 1\.14\.0 — "deliver" was an extension point.*Run delivery:update/);
});

test('the review and ready budgets are non-negative integers, and review may be switched off', () => {
    assert.deepEqual(check({ policy: { 'review.retryBudget': 0, 'ready.retryBudget': 3, 'phases.review': false } }), []);
    assert.equal(check({ policy: { 'ready.retryBudget': -1 } }).length, 1);
    assert.equal(check({ policy: { 'review.retryBudget': 1.5 } }).length, 1);
    assert.equal(check({ policy: { 'phases.review': 'off' } }).length, 1);
});

test('resolve prints the phase maps with every layer merged in, field by field', () => {
    const { target, options } = scratch(
        { id: 'r', phases: { 'flow-code': { ...codeMap(), 'phase-review': { agent: 'repo:reviewer', model: 'opus' } } } },
        { user: { phases: { 'flow-code': { 'phase-review': { model: 'sonnet' } } } } },
    );
    const { merged, errors } = resolveStackConfig(target, schema, options);
    assert.deepEqual(errors, []);
    assert.deepEqual(merged.phases['flow-code']['phase-review'], { agent: 'repo:reviewer', model: 'sonnet' });
});

test('resolve refuses a committed map that is not complete', () => {
    const { target, options } = scratch({ id: 'r', phases: { 'flow-code': { 'phase-scope': {} } } });
    const { errors } = resolveStackConfig(target, schema, options);
    assert.equal(errors.length, 1);
    assert.match(errors[0].errors[0], /missing "phase-update-base"/);
});

test('a repo-native flow is accepted only when the repository ships that skill', () => {
    const ships = (name) => name === 'flow-release';
    const strict = (config) => checkStackConfig(config, schema, { skillExists: ships });
    assert.deepEqual(strict({ phases: { 'flow-release': { 'phase-tag': {} } } }), []);
    const errors = strict({ phases: { 'flow-cod': { 'phase-implement': {} } } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^phases: unknown flow "flow-cod" — .*a repo-native flow-\* skill this repository ships/);
    assert.deepEqual(strict({ phases: { 'flow-code': codeMap() } }), [], 'an engine flow needs no skill of the repository');
});

test('resolve finds a repo-native flow by its skill folder beside the config', () => {
    const { target, options } = scratch({ id: 'r', phases: { 'flow-release': { 'phase-tag': {} } } });
    assert.match(resolveStackConfig(target, schema, options).errors[0].errors[0], /unknown flow "flow-release"/);
    mkdirSync(join(dirname(target), '.agents', 'skills', 'flow-release'), { recursive: true });
    writeFileSync(join(dirname(target), '.agents', 'skills', 'flow-release', 'SKILL.md'), '');
    assert.deepEqual(resolveStackConfig(target, schema, options).errors, []);
});

test('a retired or renamed policy key is refused by name with a pointer to delivery:update', () => {
    for (const [key, hint] of [['validate.retryBudget', /nothing read it/], ['phases.verification', /phases\.specCheck/], ['phases.workItemUpdate', /phases\.reportBack/]]) {
        const errors = check({ policy: { [key]: key.startsWith('phases') ? true : 2 } });
        assert.equal(errors.length, 1, key);
        assert.ok(errors[0].startsWith(`policy["${key}"]: removed in 1.14.0 — `), errors[0]);
        assert.match(errors[0], hint);
        assert.match(errors[0], /Run delivery:update/);
    }
    assert.deepEqual(check({ policy: { 'phases.specCheck': false, 'phases.reportBack': true } }), []);
});

test('a gate that skips its point unattended is refused by name; skip-phase is the spelling', () => {
    const errors = check({ gates: [{ at: 'verify', when: 'before', purpose: 'cost', unattended: 'skip-point' }] });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^gates\[0\]\.unattended: removed in 1\.14\.0 — "skip-point" — it is skip-phase.*Run delivery:update/);
    assert.deepEqual(check({ gates: [{ at: 'verify', when: 'before', purpose: 'cost', unattended: 'skip-phase' }] }), []);
});

// The overlay — config.local.json under the user's devbook config directory, one machine's own.

test('the overlay wins key by key and leaves its siblings standing', () => {
    const merged = mergeStackConfig(
        { policy: { 'qa.depth': 'targeted', 'review.retryBudget': 2 } },
        { policy: { 'qa.depth': 'startup-only' } },
    );
    assert.deepEqual(merged.policy, { 'qa.depth': 'startup-only', 'review.retryBudget': 2 });
});

test('a phase entry merges field by field, later layers winning', () => {
    const committed = { phases: { 'flow-code': { ...codeMap(), 'phase-implement': { agent: 'csharp-coding:coding', model: 'opus', effort: 'high' } } } };
    const user = { phases: { 'flow-code': { 'phase-implement': { model: 'sonnet' } } } };
    const repo = { phases: { 'flow-code': { 'phase-implement': { effort: 'medium' } } } };
    const merged = [user, repo].reduce(mergeStackConfig, committed);
    assert.deepEqual(merged.phases['flow-code']['phase-implement'], {
        agent: 'csharp-coding:coding',
        model: 'sonnet',
        effort: 'medium',
    });
    assert.deepEqual(merged.phases['flow-code']['phase-review'], {});
    assert.deepEqual(checkStackConfig(merged, schema, { overlay: true, merged: true }), []);
});

test('an array replaces rather than concatenating — half a chore list runs nothing sane', () => {
    const merged = mergeStackConfig(
        { phases: { 'flow-code': { 'phase-update-base': { before: ['devbook:validate', 'repo:a'] } } } },
        { phases: { 'flow-code': { 'phase-update-base': { before: ['repo:b'] } } } },
    );
    assert.deepEqual(merged.phases['flow-code']['phase-update-base'].before, ['repo:b']);
});

test('gates append, so an overlay can add a checkpoint and cannot spell removing one', () => {
    const base = { gates: [{ at: 'scope', when: 'after', purpose: 'approval' }] };
    const merged = mergeStackConfig(base, {
        gates: [{ at: 'verify', when: 'before', purpose: 'resource' }],
    });
    assert.equal(merged.gates.length, 2);
    assert.equal(merged.gates[0].at, 'scope');

    // The one that matters: an overlay naming an empty list still keeps every base gate.
    assert.deepEqual(mergeStackConfig(base, { gates: [] }).gates, base.gates);
});

test('null in the overlay is deliberately unbound, never a delete', () => {
    const merged = mergeStackConfig(
        { bindings: { 'delivery.tracker': { provider: 'github' } } },
        { bindings: { 'delivery.tracker': null } },
    );
    assert.equal(merged.bindings['delivery.tracker'], null);
});

test('the overlay never carries a component stamp', () => {
    const errors = checkLocalOverlay({ components: { devbook: { pluginVersion: '2.0.0' } } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /repo-scope/);
});

test('the overlay never carries an id — the id is what found it', () => {
    const errors = checkLocalOverlay({ id: 'other' });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /found this overlay/);
});

test('the overlay may not touch what the repository produces', () => {
    for (const key of ['pr.required', 'qa.ceiling', 'gate.personalValidation', 'openspec.scenarios']) {
        const errors = checkLocalOverlay({ policy: { [key]: key === 'pr.required' ? false : 'full' } });
        assert.equal(errors.length, 1, key);
        assert.match(errors[0], /locked/);
    }
});

test('an ordinary overlay is refused nothing', () => {
    assert.deepEqual(
        checkLocalOverlay({
            policy: { 'qa.depth': 'startup-only', 'review.retryBudget': 0 },
            phases: { 'flow-code': { 'phase-verify': { agent: null, model: 'sonnet' } } },
            gates: [{ at: 'implement', when: 'before', purpose: 'cost' }],
        }),
        [],
    );
});

test('an overlay is still schema-checked, so a typo in it is rejected by name', () => {
    const errors = check({ policy: { 'qa.dpeth': 'full' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown key "qa.dpeth"/);
});

// `ext` — a plugin's machine-scope state, `ext.<plugin>.<key>`, the overlay-side
// counterpart of `components`: refused in the committed file, opaque in an overlay.

const checkOverlay = (config) => checkStackConfig(config, schema, { overlay: true });

test('ext is refused in the committed config and pointed at the overlay', () => {
    const errors = check({ ext: { schedule: { environment: 'cloud' } } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^ext: machine-scope/);
});

test('ext in an overlay is carried through opaque: the engine reads none of its keys', () => {
    assert.deepEqual(checkOverlay({ ext: { schedule: { environment: 'cloud', model: 'sonnet' } } }), []);
    assert.deepEqual(checkOverlay({ ext: {} }), []);
    assert.deepEqual(checkLocalOverlay({ ext: { schedule: { model: 'opus' } } }), []);
});

test('ext is only shape-checked as far as it takes to be addressable', () => {
    assert.match(checkOverlay({ ext: 'cloud' })[0], /^ext: expected an object keyed by plugin/);
    assert.match(checkOverlay({ ext: { schedule: 'cloud' } })[0], /^ext\.schedule: expected an object/);
});

test('the shipped overlay template validates as an overlay and is refused as the committed file', () => {
    const template = JSON.parse(
        readFileSync(join(HERE, '..', '..', 'resources', 'config.local-template.json'), 'utf8'),
    );
    assert.deepEqual([...checkLocalOverlay(template), ...checkOverlay(template)], []);
    assert.equal(check(template).length, 1);
});

test('ext survives the merge, later layers winning key by key', () => {
    const merged = [
        { ext: { schedule: { environment: 'cloud', model: 'sonnet' } } },
        { ext: { schedule: { model: 'opus' } } },
    ].reduce(mergeStackConfig, { policy: { 'qa.depth': 'full' } });
    assert.deepEqual(merged.ext, { schedule: { environment: 'cloud', model: 'opus' } });
    assert.deepEqual(checkOverlay(merged), []);
});

// Where the overlays are found — two layers, outermost first, both under the user's config
// directory and neither in any clone: the repository one keyed on the committed id.

const unixHome = { env: {}, platform: 'linux', home: '/home/me' };

test('XDG_CONFIG_HOME wins on every platform when it is set', () => {
    for (const platform of ['linux', 'darwin', 'win32']) {
        const dir = userConfigDir({ env: { XDG_CONFIG_HOME: '/xdg', APPDATA: 'C:\\AppData' }, platform, home: '/h' });
        assert.equal(dir, join('/xdg', 'devbook'), platform);
    }
});

test('without it, Windows uses APPDATA and everything else ~/.config', () => {
    assert.equal(
        userConfigDir({ env: { APPDATA: 'C:\\Users\\me\\AppData\\Roaming' }, platform: 'win32', home: 'C:\\Users\\me' }),
        join('C:\\Users\\me\\AppData\\Roaming', 'devbook'),
    );
    assert.equal(userConfigDir(unixHome), join('/home/me', '.config', 'devbook'));
});

test('two layers, outermost first, when the config carries an id', () => {
    const layers = overlayPaths('my-repo', unixHome);
    assert.deepEqual(
        layers.map((l) => l.scope),
        ['user', 'repository'],
    );
    assert.equal(layers[0].path, join('/home/me/.config/devbook', 'config.local.json'));
    assert.equal(layers[1].path, join('/home/me/.config/devbook', 'repos', 'my-repo', 'config.local.json'));
});

test('no id, no repository layer — a machine cannot key on a name the repo never chose', () => {
    const layers = overlayPaths(null, unixHome);
    assert.deepEqual(
        layers.map((l) => l.scope),
        ['user'],
    );
});

test('no layer is ever inside the clone', () => {
    for (const layer of overlayPaths('my-repo', unixHome)) {
        assert.ok(layer.path.startsWith(join('/home/me/.config/devbook')), layer.path);
    }
});

test('layers merge in order: the later wins per key, and every layer keeps its gates', () => {
    const base = {
        policy: { 'qa.depth': 'full', 'review.retryBudget': 2 },
        gates: [{ at: 'scope', when: 'after', purpose: 'approval' }],
    };
    const user = { policy: { 'review.retryBudget': 0 }, gates: [] };
    const repo = {
        policy: { 'qa.depth': 'targeted' },
        gates: [{ at: 'implement', when: 'before', purpose: 'cost' }],
    };
    const merged = [user, repo].reduce(mergeStackConfig, base);
    assert.deepEqual(merged.policy, { 'qa.depth': 'targeted', 'review.retryBudget': 0 });
    assert.deepEqual(
        merged.gates.map((g) => g.at),
        ['scope', 'implement'],
    );
});

// What --print hands a flow: the committed file with every present overlay merged over it,
// resolved from disk, and nothing at all when a layer is refused.

function scratch(committed, overlays = {}) {
    const root = mkdtempSync(join(tmpdir(), 'stack-config-'));
    const target = join(root, 'config.json');
    if (committed) writeFileSync(target, JSON.stringify(committed));
    const xdg = join(root, 'xdg');
    const id = committed?.id;
    for (const [scope, overlay] of Object.entries(overlays)) {
        const dir = scope === 'user' ? join(xdg, 'devbook') : join(xdg, 'devbook', 'repos', id);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'config.local.json'), JSON.stringify(overlay));
    }
    return { target, options: { env: { XDG_CONFIG_HOME: xdg }, platform: 'linux', home: root } };
}

test('resolve merges every present layer over the committed file and names each layer', () => {
    const { target, options } = scratch(
        { id: 'r', policy: { 'qa.depth': 'full', 'qa.ceiling': 'full' } },
        { user: { policy: { 'qa.depth': 'targeted' }, ext: { schedule: { model: 'sonnet' } } }, repository: { policy: { 'qa.depth': 'startup-only' } } },
    );
    const { merged, layers, errors } = resolveStackConfig(target, schema, options);
    assert.deepEqual(errors, []);
    assert.deepEqual(layers.map((l) => [l.scope, l.present]), [['user', true], ['repository', true]]);
    assert.equal(merged.policy['qa.depth'], 'startup-only');
    assert.equal(merged.policy['qa.ceiling'], 'full');
    assert.deepEqual(merged.ext, { schedule: { model: 'sonnet' } });
});

test('resolve with no overlay is the committed file, and an absent layer is still named', () => {
    const { target, options } = scratch({ id: 'r', policy: { 'qa.depth': 'full' } });
    const { merged, layers } = resolveStackConfig(target, schema, options);
    assert.deepEqual(merged, { id: 'r', policy: { 'qa.depth': 'full' } });
    assert.deepEqual(layers.map((l) => l.present), [false, false]);
});

test('resolve yields no merge when a layer is refused', () => {
    const { target, options } = scratch({ id: 'r' }, { user: { policy: { 'qa.ceiling': 'skipped' } } });
    const { merged, errors } = resolveStackConfig(target, schema, options);
    assert.equal(merged, null);
    assert.equal(errors.length, 1);
    assert.match(errors[0].errors[0], /locked/);
});

test('resolve without a committed file is null config, not an error', () => {
    const { target, options } = scratch(null, {});
    const { merged, config, errors } = resolveStackConfig(target, schema, options);
    assert.equal(config, null);
    assert.equal(merged, null);
    assert.deepEqual(errors, []);
});
