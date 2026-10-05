import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'migrate.mjs');

function run(config) {
    const root = mkdtempSync(join(tmpdir(), 'start-binding-'));
    mkdirSync(join(root, '.devbook'));
    writeFileSync(join(root, '.devbook', 'config.json'), JSON.stringify(config, null, 2) + '\n');
    execFileSync(process.execPath, [SCRIPT, '--root', root]);
    return JSON.parse(readFileSync(join(root, '.devbook', 'config.json'), 'utf8'));
}

test('repo:start with options moves to the run recipe, never to a retired skill', () => {
    const out = run({ extensions: { 'app.start': { provider: 'repo:start', host: 'aspire' } } });
    assert.deepEqual(out.extensions['app.start'], { provider: 'repo:run', host: 'aspire' });
});

test('repo:start alone goes, and extensions with it once empty', () => {
    assert.deepEqual(run({ id: 'x', extensions: { 'app.start': 'repo:start' } }), { id: 'x' });
});
