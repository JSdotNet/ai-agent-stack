import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { projectPaths, resolveInstalled, selectInstall } from './report.mjs';

const REPO = resolve('/repos/stack');
const OTHER = resolve('/repos/stack/.claude/worktrees/other');

const user = { scope: 'user', version: '1.10.0', installPath: '/cache/p/1.10.0' };
const here = { scope: 'project', projectPath: REPO, version: '1.9.0', installPath: '/cache/p/1.9.0' };
const other = { scope: 'project', projectPath: OTHER, version: '1.13.0', installPath: '/cache/p/1.13.0' };

test('another project at a higher version never masks the entry that applies', () => {
    assert.equal(selectInstall([other, here], [REPO]), here);
    assert.equal(selectInstall([other], [REPO]), null);
});

test('a project entry for this repository wins over user scope', () => {
    assert.equal(selectInstall([user, here, other], [REPO]), here);
});

test('local scope wins over project scope for the same repository', () => {
    const local = { ...here, scope: 'local', version: '1.8.0' };
    assert.equal(selectInstall([here, local], [REPO]), local);
});

test('user scope is the fallback when no entry names this repository', () => {
    assert.equal(selectInstall([other, user], [REPO]), user);
});

test('a worktree falls back to the entry its main checkout was installed for', () => {
    const worktree = resolve('/repos/stack/.claude/worktrees/mine');
    assert.equal(selectInstall([user, other, here], [worktree, REPO]), here);
});

test('resolveInstalled reports the applying entry and its installPath', () => {
    const configDir = mkdtempSync(join(tmpdir(), 'report-installed-'));
    mkdirSync(join(configDir, 'plugins'));
    writeFileSync(join(configDir, 'plugins', 'installed_plugins.json'), JSON.stringify({
        version: 2,
        plugins: {
            'devbook-derived@m': [here, other],
            'devbook@m': [user, other],
            'foreign@m': [other],
        },
    }));
    const installed = resolveInstalled(configDir, [REPO]);
    assert.equal(installed.get('devbook-derived@m').version, '1.9.0');
    assert.equal(installed.get('devbook-derived@m').installPath, '/cache/p/1.9.0');
    assert.equal(installed.get('devbook@m').version, '1.10.0');
    assert.equal(installed.has('foreign@m'), false);
});

test('projectPaths names a worktree and then its main checkout', () => {
    const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { stdio: 'ignore' });
    const main = realpathSync(mkdtempSync(join(tmpdir(), 'report-main-')));
    git(main, 'init', '-q');
    git(main, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'x');
    const worktree = join(main, 'wt');
    git(main, 'worktree', 'add', '-q', worktree);

    const [first, second] = projectPaths(worktree);
    assert.equal(selectInstall([{ ...here, projectPath: main }], [first, second]).projectPath, main);
    assert.equal(projectPaths(main).length, 1);
});

test('phaseBindings names every provider a phase entry binds, and unenabledBindings checks them', async () => {
    const { phaseBindings, unenabledBindings } = await import('./report.mjs');
    const phases = {
        'flow-code': {
            'phase-implement': { agent: 'csharp-coding:coding', model: 'opus' },
            'phase-update-base': { before: ['devbook:validate'] },
            'phase-verify': { agent: null, skill: 'repo:show' },
        },
    };
    assert.deepEqual(phaseBindings(phases).map((b) => `${b.where}.${b.key}`), [
        'phases.flow-code.phase-implement.agent',
        'phases.flow-code.phase-update-base.before',
        'phases.flow-code.phase-verify.agent',
        'phases.flow-code.phase-verify.skill',
    ]);
    const missing = unenabledBindings({ phases }, { 'devbook@m': true });
    assert.deepEqual(missing, [{ where: 'phases.flow-code.phase-implement', key: 'agent', plugins: ['csharp-coding'] }]);
});

test('unenabledBindings checks the app provider phase-verify names', async () => {
    const { unenabledBindings } = await import('./report.mjs');
    const phases = { 'flow-code': { 'phase-verify': { app: { provider: 'aspire-run:start', host: 'aspire' } } } };
    assert.deepEqual(unenabledBindings({ phases }, { 'devbook@m': true }), [
        { where: 'phases.flow-code.phase-verify', key: 'app', plugins: ['aspire-run'] },
    ]);
});

test('the stamps table names the procedures devbook adopted and a folded devbook-procedures entry', () => {
    const root = mkdtempSync(join(tmpdir(), 'report-folded-'));
    mkdirSync(join(root, '.devbook'));
    writeFileSync(join(root, '.devbook', 'config.json'), JSON.stringify({
        id: 'x',
        components: {
            devbook: { pluginVersion: '1.16.0', adopted: ['arc42'], procedures: { adopted: ['run', 'capture'] } },
            'devbook-procedures': { pluginVersion: '1.16.0', adopted: ['run'] },
        },
    }));
    const out = execFileSync(process.execPath, [fileURLToPath(new URL('./report.mjs', import.meta.url)), '--root', root], {
        encoding: 'utf8',
        env: { ...process.env, CLAUDE_CONFIG_DIR: join(root, 'no-config') },
    });
    assert.match(out, /\| `devbook` \| 1\.16\.0 \| adopted `arc42`; procedures `run`, `capture` \|/);
    assert.match(out, /\| `devbook-procedures` - folded into `devbook`; `devbook:update` moves it \|/);
});
