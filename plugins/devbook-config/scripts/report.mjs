#!/usr/bin/env node
// Reports the stack as it actually is: which plugins the catalog offers, which are
// installed and at what version, which are enabled, and how one repository has wired
// the delivery engine.
//
//   node report.mjs [--root <repo>] [--marketplace <name>] [--json]
//
// Reads only; writes nothing. Every fact names the file it came from, so a wrong
// answer is traceable to a stale file rather than to this script.
//
// Exit 0 when the report was produced, 1 on a bad argument.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_MARKETPLACE = 'jsdotnet';

// Which plugin owns each `components.<name>` stamp, and what reconciles it. The mapping is
// not derivable — `collaboration` is written by `devbook-collaboration`, `schedule` by
// `delivery-schedule` — and it is needed in the direction a manifest cannot answer: naming
// the plugin behind a stamp whose plugin is not installed here. Hardcoding it is the same
// bargain the rest of this script already takes, recorded at
// 09-architecture-decisions.md#the-guide-names-every-plugin-and-depends-on-none.
const COMPONENTS = {
    devbook: { plugin: 'devbook', install: 'devbook:install' },
    collaboration: { plugin: 'devbook-collaboration', install: 'devbook-collaboration:install' },
    schedule: { plugin: 'delivery-schedule', install: 'delivery-schedule:install' },
};

// The order the reconcile list is run in, and it is not cosmetic: devbook-collaboration's
// install refuses to run until `components.devbook` names an adopted folder, and
// delivery-schedule checks its targets against the plugins this repository enables, so it
// wants the settled state. Anything not named here follows, alphabetically.
const RECONCILE_ORDER = ['devbook', 'devbook-collaboration', 'delivery-schedule'];

// What an update run does with each plugin. The three inputs are orthogonal: installed is a
// fact about this machine, enabled about this checkout, stamped about the repository and
// everyone who shares it.
const SCOPE = {
    reconcile: 'in scope - run its install skill',
    blocked: 'stamped here, not installed on this machine',
    frozen: 'stamped here, not enabled in this checkout',
    adoptable: 'installed and enabled, never adopted here',
    available: 'installed, not enabled, not adopted',
    'out-of-scope': 'not installed and not adopted',
};
const DEVBOOK_FOLDERS = ['arc42', 'domain', 'tech', 'design', 'ai'];
const ENGINE_KEYS = ['bindings', 'extensions', 'policy', 'gates'];
const SERVICES = ['spec', 'implement', 'verify', 'app.start', 'qa.run', 'deliver'];
const CHORES = ['session.start', 'flow.start', 'data.prepare', 'docs.update', 'flow.end'];

const sources = [];

/** Read a JSON file, recording where it was looked for and what came back. */
function load(what, path) {
    if (!path) {
        sources.push({ what, path: '-', status: 'not resolved' });
        return null;
    }
    if (!existsSync(path)) {
        sources.push({ what, path, status: 'absent' });
        return null;
    }
    try {
        const value = JSON.parse(readFileSync(path, 'utf8'));
        sources.push({ what, path, status: 'read' });
        return value;
    } catch (err) {
        sources.push({ what, path, status: `unreadable - ${err.message}` });
        return null;
    }
}

/** Compare two dotted version strings numerically. */
function compareVersions(a, b) {
    const left = String(a).split(/[.-]/);
    const right = String(b).split(/[.-]/);
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const x = Number.parseInt(left[i] ?? '0', 10);
        const y = Number.parseInt(right[i] ?? '0', 10);
        if (Number.isNaN(x) || Number.isNaN(y)) return String(a).localeCompare(String(b));
        if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
}

function gitHead(dir) {
    try {
        return execFileSync('git', ['-C', dir, 'log', '-1', '--format=%h %cs'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch {
        return null;
    }
}

/** The directory the host keeps its plugin state in. */
function hostConfigDir() {
    return process.env.CLAUDE_CONFIG_DIR
        ? resolve(process.env.CLAUDE_CONFIG_DIR)
        : join(homedir(), '.claude');
}

/**
 * Find the marketplace catalog twice over: the working tree when this repository is the
 * marketplace source, and the host's clone. Disagreement between them is itself an
 * answer - it means the clone is stale.
 */
function resolveCatalogs(repoRoot, configDir, name) {
    const found = [];

    const localPath = join(repoRoot, '.claude-plugin', 'marketplace.json');
    const local = load('catalog (working tree)', localPath);
    if (local?.name === name) {
        found.push({ origin: 'working tree', root: repoRoot, path: localPath, catalog: local });
    }

    const known = load('known marketplaces', join(configDir, 'plugins', 'known_marketplaces.json'));
    const cloneRoot = known?.[name]?.installLocation ?? join(configDir, 'plugins', 'marketplaces', name);
    const clonePath = join(cloneRoot, '.claude-plugin', 'marketplace.json');
    const clone = load('catalog (host clone)', clonePath);
    if (clone) {
        found.push({
            origin: 'host clone',
            root: cloneRoot,
            path: clonePath,
            catalog: clone,
            lastUpdated: known?.[name]?.lastUpdated ?? null,
            repo: known?.[name]?.source?.repo ?? null,
        });
    }

    return found;
}

/** Merge the enabled-plugin maps the host layers, nearest file last. */
function resolveEnabled(repoRoot, configDir) {
    const files = [
        ['user settings', join(configDir, 'settings.json')],
        ['project settings', join(repoRoot, '.claude', 'settings.json')],
        ['local settings', join(repoRoot, '.claude', 'settings.local.json')],
    ];
    const merged = {};
    let any = false;
    for (const [what, path] of files) {
        const settings = load(what, path);
        if (!settings) continue;
        any = true;
        Object.assign(merged, settings.enabledPlugins ?? {});
    }
    return any ? merged : null;
}

/** Which versions of which plugins the host has on disk, per `name@marketplace`. */
function resolveInstalled(configDir) {
    const state = load('installed plugins', join(configDir, 'plugins', 'installed_plugins.json'));
    const byKey = new Map();
    for (const [key, entries] of Object.entries(state?.plugins ?? {})) {
        const list = Array.isArray(entries) ? entries : [entries];
        const best = list.slice().sort((a, b) => compareVersions(a.version, b.version)).pop();
        if (best) byKey.set(key, best);
    }
    return byKey;
}

/** The skills a plugin folder actually ships, by directory name. */
function skillNames(pluginRoot) {
    const dir = join(pluginRoot, 'skills');
    if (!existsSync(dir)) return null;
    try {
        return readdirSync(dir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();
    } catch {
        return null;
    }
}

function buildPluginRows(catalogs, installed, enabled, marketplace, components) {
    const latest = new Map();
    const described = new Map();
    for (const found of catalogs) {
        for (const entry of found.catalog.plugins ?? []) {
            const known = latest.get(entry.name);
            if (!known || compareVersions(entry.version, known.version) > 0) {
                latest.set(entry.name, { version: entry.version, origin: found.origin });
            }
            described.set(entry.name, entry.description ?? '');
        }
    }

    const names = new Set(latest.keys());
    for (const key of installed.keys()) {
        const [name, from] = key.split('@');
        if (from === marketplace) names.add(name);
    }

    return [...names].sort().map((name) => {
        const key = `${name}@${marketplace}`;
        const here = installed.get(key) ?? null;
        const there = latest.get(name) ?? null;
        let state;
        if (!here) state = 'not installed';
        else if (!there) state = 'installed, not in the catalog';
        else {
            const diff = compareVersions(here.version, there.version);
            if (diff === 0) state = 'up to date';
            else if (diff < 0) state = `update available (${here.version} -> ${there.version})`;
            else state = `ahead of the catalog (${here.version} > ${there.version})`;
        }
        // A stamp is repo-scope and committed; installed-ness is personal and per-machine.
        // The two never overrule each other, which is why scope reads all three inputs and
        // why nothing here ever proposes removing a stamp.
        const stampName = Object.keys(COMPONENTS).find((c) => COMPONENTS[c].plugin === name);
        const stamp = stampName ? (components?.[stampName] ?? null) : null;
        const isEnabled = enabled ? Boolean(enabled[key]) : null;

        let scope;
        if (!here) scope = stamp ? 'blocked' : 'out-of-scope';
        else if (isEnabled === false) scope = stamp ? 'frozen' : 'available';
        else scope = stamp ? 'reconcile' : 'adoptable';

        return {
            name,
            latest: there?.version ?? '-',
            installed: here?.version ?? '-',
            installPath: here?.installPath ?? null,
            enabled: isEnabled,
            state,
            scope,
            scopeMeans: SCOPE[scope],
            component: stampName ?? null,
            installSkill: stampName ? COMPONENTS[stampName].install : null,
            stampedVersion: stamp?.pluginVersion ?? null,
            description: described.get(name) ?? '',
        };
    });
}

function buildRepository(repoRoot) {
    const path = join(repoRoot, '.devbook', 'config.json');
    const config = load('stack config', path);
    const legacyPath = join(repoRoot, '.github', 'ai-agent-stack.json');
    const legacy = existsSync(legacyPath) ? legacyPath : null;
    const folders = DEVBOOK_FOLDERS.map((folder) => {
        const flat = join(repoRoot, `.${folder}`);
        const nested = join(repoRoot, '.devbook', folder);
        if (existsSync(flat)) return { folder, layout: 'flat', path: `.${folder}/` };
        if (existsSync(nested)) return { folder, layout: 'nested', path: `.devbook/${folder}/` };
        return { folder, layout: null, path: null };
    });

    const overlayPath = join(repoRoot, '.devbook', 'config.local.json');
    const overlay = load('local overlay', overlayPath);

    return {
        path,
        legacyPath: legacy,
        overlayPath: overlay ? overlayPath : null,
        overlayKeys: overlay ? ENGINE_KEYS.filter((key) => key in overlay) : null,
        present: Boolean(config),
        engineKeys: ENGINE_KEYS.filter((key) => config && key in config),
        tracker: config?.bindings?.['delivery.tracker'] ?? null,
        roles: config?.bindings?.['delivery.roles'] ?? null,
        mcp: config?.bindings?.['delivery.mcp'] ?? null,
        extensions: config?.extensions ?? null,
        policy: config?.policy ?? null,
        gates: config?.gates ?? null,
        components: config?.components ?? null,
        folders,
    };
}

function table(headers, rows) {
    const lines = [`| ${headers.join(' | ')} |`, `|${headers.map(() => ' --- ').join('|')}|`];
    for (const row of rows) lines.push(`| ${row.join(' | ')} |`);
    return lines.join('\n');
}

function describeValue(value) {
    if (value === null) return '`null` - deliberately unbound';
    if (value === undefined) return 'unset - engine default';
    if (typeof value === 'object') return `\`${JSON.stringify(value)}\``;
    return `\`${value}\``;
}

function render(model) {
    const out = [];
    out.push(`# Stack report - \`${model.marketplace}\``);
    out.push('');
    out.push(`Repository: \`${model.repoRoot}\``);
    out.push('');

    out.push('## Where every fact came from');
    out.push('');
    out.push(table(['What', 'Path', 'Status'], model.sources.map((s) => [s.what, `\`${s.path}\``, s.status])));
    out.push('');

    for (const found of model.catalogs) {
        const head = gitHead(found.root);
        const parts = [`**Catalog (${found.origin})** - ${found.catalog.plugins?.length ?? 0} plugins`];
        parts.push(`checked out at \`${found.root}\``);
        if (found.repo) parts.push(`from \`${found.repo}\``);
        if (found.lastUpdated) parts.push(`fetched ${found.lastUpdated}`);
        if (head) parts.push(`at commit ${head}`);
        out.push(`${parts.join(', ')}.`);
    }
    if (model.catalogs.length === 0) {
        out.push('**No catalog found.** Nothing can be said about newest versions until the marketplace is added, or until this runs inside the marketplace source.');
    }
    out.push('');

    out.push('## Plugins');
    out.push('');
    out.push(table(
        ['Plugin', 'Newest', 'Installed', 'Enabled', 'State', 'Scope'],
        model.plugins.map((p) => [
            `\`${p.name}\``,
            p.latest,
            p.installed,
            p.enabled === null ? '?' : p.enabled ? 'yes' : 'no',
            p.state,
            p.scope,
        ]),
    ));
    out.push('');
    if (model.plugins.every((p) => p.enabled === null)) {
        out.push('No settings file was readable, so the enabled column says nothing.');
        out.push('');
    }

    out.push('### Scope');
    out.push('');
    out.push('What an update run does with each row. `installed` is a fact about this machine, `enabled` about this checkout, and the `components.<name>` stamp about the repository and everyone who shares it.');
    out.push('');
    const seen = model.plugins.map((p) => p.scope);
    out.push(table(
        ['Scope', 'Means', 'Plugins'],
        Object.entries(SCOPE)
            .filter(([name]) => seen.includes(name))
            .map(([name, means]) => [
                `\`${name}\``,
                means,
                model.plugins.filter((p) => p.scope === name).map((p) => `\`${p.name}\``).join(', '),
            ]),
    ));
    out.push('');

    const rank = (p) => {
        const i = RECONCILE_ORDER.indexOf(p.name);
        return i === -1 ? RECONCILE_ORDER.length : i;
    };
    const reconcile = model.plugins
        .filter((p) => p.scope === 'reconcile')
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    if (reconcile.length) {
        out.push('Run these **in this order** — collaboration needs devbook adopted first, and schedule reads the settled enable state — and let each write its own stamp:');
        out.push('');
        for (const p of reconcile) {
            const drift = p.stampedVersion && p.stampedVersion !== p.installed
                ? ` (stamped ${p.stampedVersion}, installed ${p.installed})`
                : '';
            out.push(`- \`${p.installSkill}\`${drift}`);
        }
        out.push('');
    }

    const blocked = model.plugins.filter((p) => p.scope === 'blocked');
    if (blocked.length) {
        out.push(`**Stamped but not installed here:** ${blocked.map((p) => `\`${p.name}\``).join(', ')}. The repository adopted them and this machine cannot reconcile them. Skip them and leave every stamp exactly as it is — a stamp is committed and shared, so dropping one un-adopts the component for everyone.`);
        out.push('');
    }

    const frozen = model.plugins.filter((p) => p.scope === 'frozen');
    if (frozen.length) {
        out.push(`**Stamped but not enabled in this checkout:** ${frozen.map((p) => `\`${p.name}\``).join(', ')}. Enable them here to reconcile them, or skip them; either way the stamp stands.`);
        out.push('');
    }

    const repo = model.repository;
    out.push('## This repository');
    out.push('');
    if (repo.legacyPath) {
        out.push(`\`${repo.legacyPath}\` is still present. The stack config moved to \`.devbook/config.json\`; nothing reads the old path any more, so move the file before anything else.`);
        out.push('');
    }
    if (repo.overlayPath) {
        out.push(`\`${repo.overlayPath}\` is present and overlays ${repo.overlayKeys.map((k) => `\`${k}\``).join(', ') || 'no engine-owned key'}. It is gitignored and machine-scope, so what it says is true of this checkout and of nobody else's - read the merged values, not the committed file alone.`);
        out.push('');
    }
    if (!repo.present) {
        out.push('No `.devbook/config.json` - every engine setting takes its documented default, and no component has been reconciled here.');
        out.push('');
    } else {
        out.push(`\`.devbook/config.json\` declares ${repo.engineKeys.map((k) => `\`${k}\``).join(', ') || 'no engine-owned key'}${repo.components ? ', plus component stamps' : ''}.`);
        out.push('');
        out.push('### Roles and tracker');
        out.push('');
        out.push(`Tracker: ${describeValue(repo.tracker ?? undefined)}`);
        out.push('');
        out.push(repo.roles
            ? table(['Role', 'Bound to'], Object.entries(repo.roles).map(([k, v]) => [`\`${k}\``, describeValue(v)]))
            : 'No `delivery.roles` binding - a flow consults no specialist by name.');
        out.push('');
        out.push(repo.mcp
            ? table(['Point', 'MCP servers'], Object.entries(repo.mcp).map(([k, v]) => [`\`${k}\``, v === null ? '`null` - deliberately none' : v.map((s) => `\`${s}\``).join(', ')]))
            : 'No `delivery.mcp` binding - every point takes the engine default MCP servers.');
        out.push('');
        out.push('### Extension points');
        out.push('');
        out.push(table(
            ['Point', 'Kind', 'Provider'],
            [
                ...SERVICES.map((p) => [`\`${p}\``, 'service', describeValue(repo.extensions?.[p])]),
                ...CHORES.map((p) => [`\`${p}\``, 'chore', describeValue(repo.extensions?.[p])]),
            ],
        ));
        out.push('');
        out.push('### Policy and gates');
        out.push('');
        out.push(repo.policy
            ? table(['Switch', 'Value'], Object.entries(repo.policy).map(([k, v]) => [`\`${k}\``, describeValue(v)]))
            : 'No `policy` key - every switch takes its engine default.');
        out.push('');
        out.push(repo.gates?.length
            ? table(['At', 'When', 'Purpose', 'Unattended'], repo.gates.map((g) => [`\`${g.at}\``, g.when ?? '-', g.purpose ?? '-', g.unattended ?? '-']))
            : 'No `gates` key - Personal Validation is the only gate, and it is mandatory.');
        out.push('');
        if (repo.components) {
            out.push('### Component stamps');
            out.push('');
            out.push(table(
                ['Component', 'Contract', 'Adopted', 'Ledger entries'],
                Object.entries(repo.components).map(([name, stamp]) => [
                    `\`${name}\``,
                    stamp?.contractVersion ?? stamp?.version ?? '-',
                    Array.isArray(stamp?.adopted) ? stamp.adopted.join(', ') : '-',
                    Array.isArray(stamp?.migrations) ? String(stamp.migrations.length) : '-',
                ]),
            ));
            out.push('');
        }
    }

    out.push('### Devbook folders on disk');
    out.push('');
    out.push(table(
        ['Folder', 'Present as'],
        repo.folders.map((f) => [`\`.${f.folder}\``, f.path ? `\`${f.path}\` (${f.layout})` : 'absent']),
    ));
    out.push('');

    if (model.deliverySkills || model.scheduleSkills) {
        const grouped = { flow: [], phase: [], schedule: [], other: [] };
        for (const skill of model.deliverySkills ?? []) {
            if (skill.startsWith('flow-')) grouped.flow.push(skill);
            else if (skill.startsWith('phase-')) grouped.phase.push(skill);
            else grouped.other.push(skill);
        }
        for (const skill of model.scheduleSkills ?? []) grouped.schedule.push(skill);
        out.push('## Procedures the plugins on disk ship');
        out.push('');
        out.push(table(
            ['Kind', 'Plugin', 'Count', 'Members'],
            [
                ['`flow-*`', '`delivery`', grouped.flow.length, grouped.flow.join(', ') || '-'],
                ['`phase-*`', '`delivery`', grouped.phase.length, grouped.phase.join(', ') || '-'],
                ['other', '`delivery`', grouped.other.length, grouped.other.join(', ') || '-'],
                ['`schedule-*`', '`delivery-schedule`', grouped.schedule.length, grouped.schedule.join(', ') || '-'],
            ],
        ));
        out.push('');
    }

    return out.join('\n');
}

function parseArgs(argv) {
    const options = { root: process.cwd(), marketplace: DEFAULT_MARKETPLACE, json: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--json') {
            options.json = true;
        } else if (arg === '--root' || arg === '--marketplace') {
            const value = argv[++i];
            if (value === undefined) return { error: `${arg} needs a value` };
            if (arg === '--root') options.root = value;
            else options.marketplace = value;
        } else {
            return { error: `unknown argument: ${arg}` };
        }
    }
    options.root = resolve(options.root);
    return { options };
}

function main(argv) {
    const { options, error } = parseArgs(argv);
    if (error) {
        process.stderr.write(`report: ${error}\n`);
        return 1;
    }

    const configDir = hostConfigDir();
    sources.push({
        what: 'host config directory',
        path: configDir,
        status: existsSync(configDir) ? 'read' : 'absent',
    });

    const catalogs = resolveCatalogs(options.root, configDir, options.marketplace);
    const installed = resolveInstalled(configDir);
    const enabled = resolveEnabled(options.root, configDir);
    const repository = buildRepository(options.root);
    const plugins = buildPluginRows(
        catalogs,
        installed,
        enabled,
        options.marketplace,
        repository.components,
    );

    const pluginRoot = (name) => plugins.find((p) => p.name === name)?.installPath
        ?? (catalogs[0] ? join(catalogs[0].root, 'plugins', name) : null);
    const deliveryRoot = pluginRoot('delivery');
    const scheduleRoot = pluginRoot('delivery-schedule');

    const model = {
        marketplace: options.marketplace,
        repoRoot: options.root,
        configDir,
        catalogs,
        plugins,
        repository,
        deliverySkills: deliveryRoot ? skillNames(deliveryRoot) : null,
        scheduleSkills: scheduleRoot ? skillNames(scheduleRoot) : null,
        sources,
    };

    process.stdout.write(options.json ? `${JSON.stringify(model, null, 2)}\n` : `${render(model)}\n`);
    return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    process.exit(main(process.argv.slice(2)));
}

export { compareVersions, buildPluginRows, buildRepository, parseArgs };
