import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

import { checkStackConfig } from './check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
    readFileSync(join(HERE, '..', '..', 'resources', 'ai-agent-stack.schema.json'), 'utf8'),
);

const check = (config) => checkStackConfig(config, schema);

test('an empty config is valid', () => {
    assert.deepEqual(check({}), []);
});

test('a component entry is left to its own component', () => {
    assert.deepEqual(check({ components: { devbook: { anything: true } } }), []);
});

test('the worked example from the surface contract validates', () => {
    assert.deepEqual(
        check({
            bindings: {
                'delivery.tracker': { provider: 'github' },
                'delivery.roles': { architecture: 'architecture:architect', ux: null },
            },
            extensions: {
                'session.start': ['devbook:load-context'],
                spec: 'architecture:architect',
                'data.prepare': [{ run: 'repo:seed-test-data', 'on-failure': 'required' }],
                'app.start': { provider: 'qa:qa', host: 'aspire' },
            },
            policy: { 'qa.depth': 'targeted', 'verify.retryBudget': 2, 'pr.base': 'main' },
            gates: [
                {
                    at: 'spec',
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

test('a point outside the closed set is rejected', () => {
    const errors = check({ extensions: { 'deploy.run': 'repo:ship' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /unknown key "deploy\.run"/);
});

test('an out-of-enum policy value is rejected', () => {
    const errors = check({ policy: { 'qa.depth': 'thorough' } });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /not one of full, targeted, startup-only, skipped/);
});

test('personalValidation may only say required', () => {
    assert.deepEqual(check({ policy: { 'gate.personalValidation': 'required' } }), []);
    assert.equal(check({ policy: { 'gate.personalValidation': 'optional' } }).length, 1);
});

test('a gate needs at, when, and purpose', () => {
    const errors = check({ gates: [{ at: 'spec' }] });
    assert.equal(errors.length, 2);
    assert.match(errors.join(' '), /missing required key "when"/);
    assert.match(errors.join(' '), /missing required key "purpose"/);
});

test('a gate may not attach to a point the engine does not declare', () => {
    const errors = check({ gates: [{ at: 'deploy', when: 'before', purpose: 'risk' }] });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /"deploy" is not one of/);
});

test('a negative budget is rejected', () => {
    assert.equal(check({ policy: { 'gate.reviseBudget': -1 } }).length, 1);
});

test('a chore point takes a list, not a bare provider', () => {
    assert.deepEqual(check({ extensions: { 'flow.end': ['delivery:capture-improvement'] } }), []);
    assert.equal(check({ extensions: { 'flow.end': 'delivery:capture-improvement' } }).length, 1);
});

test('a chore on-failure value is a closed enum', () => {
    const errors = check({ extensions: { 'docs.update': [{ run: 'repo:docs', 'on-failure': 'maybe' }] } });
    assert.equal(errors.length, 1);
});

test('null binds a role deliberately, which is not the same as absent', () => {
    assert.deepEqual(check({ bindings: { 'delivery.roles': { security: null } } }), []);
    assert.equal(check({ bindings: { 'delivery.roles': { security: 42 } } }).length, 1);
});

test('the tracker provider set is closed', () => {
    assert.deepEqual(check({ bindings: { 'delivery.tracker': { provider: 'jira', project: 'FIN' } } }), []);
    assert.equal(check({ bindings: { 'delivery.tracker': { provider: 'trello' } } }).length, 1);
});

test('no model key exists anywhere in the engine-owned config', () => {
    assert.equal(check({ policy: { model: 'opus' } }).length, 1);
    assert.equal(check({ bindings: { 'delivery.model': 'opus' } }).length, 1);
});
