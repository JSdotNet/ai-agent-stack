import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import type { Distance, FlowMap, GateLine, PhaseLink, PhaseMode, RepoRow, Rollout, StampCell } from '../types'

const PANE = 'devbook-config-view'
const TITLE = 'Rollout'

const ROLLOUT = { plugin: 'devbook-config-view', key: 'rollout' } as const
const VIEW = { plugin: 'devbook-config-view', key: 'view' } as const
const SELECTED = { plugin: 'devbook-config-view', key: 'selected' } as const

// ── What the stack defines, repeated from where it is owned ──────────────────
// A hooks module reads no other plugin's code, so these tables mirror their sources and
// change with them: the stamps, folds, and retired keys are devbook-config's
// `scripts/report.mjs`; the default modes are delivery's `resources/engine-contract.md`.

/** Stamp key → the plugin whose marketplace version it is measured against, in reconcile order. */
const COMPONENTS: Record<string, string> = {
  devbook: 'devbook',
  derived: 'devbook-derived',
  openspec: 'devbook-openspec',
  delivery: 'delivery',
  schedule: 'delivery-schedule',
}

/** A stamp whose plugin folded into another; present at all, it is retired. */
const FOLDED_STAMPS = ['devbook-procedures']

const RETIRED_BINDINGS = ['delivery.roles', 'delivery.mcp']
const RETIRED_FLOWS = ['flow-update-packages', 'flow-project']
const RETIRED_POLICY = ['validate.retryBudget', 'phases.verification', 'phases.workItemUpdate']
const RETIRED_UNATTENDED = ['skip-point']
const RETIRED_GATE_POINTS = ['session.start', 'flow.start', 'spec', 'validate', 'data.prepare', 'app.start', 'qa.run', 'deliver', 'flow.end']

const FOLDERS = ['arc42', 'domain', 'tech', 'design', 'ai']
const PROCEDURES = ['run', 'capture', 'diagnose', 'estimate', 'prototype']

/** How a phase runs when its entry sets none of agent, model, effort. */
const DEFAULT_MODE: Record<string, PhaseMode> = {
  'phase-update-base': 'inline',
  'phase-scope': 'fork',
  'phase-plan': 'delegate',
  'phase-implement': 'fork',
  'phase-review': 'fork',
  'phase-build-test': 'delegate',
  'phase-verify': 'delegate',
  'phase-spec-check': 'delegate',
  'phase-drafting': 'delegate',
  'phase-check-review': 'inline',
  'phase-create-pr': 'inline',
  'phase-report-back': 'delegate',
  'phase-summary': 'inline',
}

// ── Reading one config ───────────────────────────────────────────────────────

const parts = (v: string) => v.split(/[.+-]/).slice(0, 3).map(n => Number.parseInt(n, 10) || 0)

function distance(version: string | null | undefined, newest: string | undefined): Distance {
  if (!version || !newest) return 'unknown'
  const [a = 0, b = 0, c = 0] = parts(version)
  const [x = 0, y = 0, z = 0] = parts(newest)
  if (a !== x) return a < x ? 'major' : 'ahead'
  if (b !== y) return b < y ? 'minor' : 'ahead'
  if (c !== z) return c < z ? 'minor' : 'ahead'
  return 'current'
}

/** Every key the stack retired that this config still carries. */
function retiredKeys(config: any): string[] {
  if (!config || typeof config !== 'object') return []
  const gates: any[] = Array.isArray(config.gates) ? config.gates : []
  return [
    ...('extensions' in config ? ['extensions'] : []),
    ...RETIRED_BINDINGS.filter(k => config.bindings && k in config.bindings).map(k => `bindings["${k}"]`),
    ...RETIRED_FLOWS.filter(f => config.phases && f in config.phases).map(f => `phases.${f}`),
    ...RETIRED_POLICY.filter(k => config.policy && k in config.policy).map(k => `policy["${k}"]`),
    ...gates.flatMap((g, i) => [
      RETIRED_GATE_POINTS.includes(g?.at) ? `gates[${i}].at "${g.at}"` : null,
      RETIRED_UNATTENDED.includes(g?.unattended) ? `gates[${i}].unattended "${g.unattended}"` : null,
    ]).filter((k): k is string => k !== null),
    ...FOLDED_STAMPS.filter(k => config.components && k in config.components).map(k => `components.${k}`),
  ]
}

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(x => (typeof x === 'string' ? x : String((x as any)?.skill ?? (x as any)?.id ?? ''))).filter(Boolean) : []

const isSet = (v: unknown) => typeof v === 'string' && v !== 'inherit'

/** One phase entry, read the way the flow-runner resolves it: agent null is inline, any of agent, model, effort delegates. */
function phaseLink(phase: string, entry: any): PhaseLink {
  const e = entry && typeof entry === 'object' ? entry : {}
  const bare = phase.split(':')[0] ?? phase
  const forcedInline = 'agent' in e && e.agent === null
  const delegated = isSet(e.agent) || isSet(e.model) || isSet(e.effort)
  return {
    phase,
    mode: forcedInline ? 'inline' : delegated ? 'delegate' : (DEFAULT_MODE[bare] ?? 'inline'),
    isConfigured: forcedInline || delegated,
    agent: typeof e.agent === 'string' ? e.agent : null,
    skill: typeof e.skill === 'string' ? e.skill : null,
    model: typeof e.model === 'string' ? e.model : null,
    effort: typeof e.effort === 'string' ? e.effort : null,
    mcp: e.mcp === null ? [] : e.mcp === undefined ? null : list(e.mcp),
    app: e.app === null ? 'none' : typeof e.app === 'string' ? e.app : typeof e.app?.provider === 'string' ? e.app.provider : null,
    before: list(e.before),
    after: list(e.after),
  }
}

const show = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))

function repoRow(path: string, text: string, newest: Record<string, string>): RepoRow {
  const name = path.split('/').pop() || path
  const empty: RepoRow = { name, path, id: '', stamps: {}, folders: [], procedures: [], retired: [], flows: [], gates: [], policy: [], bindings: [], error: null }
  let config: any
  try {
    config = JSON.parse(text)
  } catch (err) {
    return { ...empty, error: `does not parse: ${(err as Error).message}` }
  }
  const components = config?.components && typeof config.components === 'object' ? config.components : {}
  const stamps: Record<string, StampCell> = {}
  for (const [key, stamp] of Object.entries<any>(components)) {
    if (typeof stamp?.pluginVersion !== 'string') continue
    stamps[key] = { version: stamp.pluginVersion, distance: distance(stamp.pluginVersion, newest[key]) }
  }
  const devbook = components.devbook ?? {}
  const procedures = list(devbook.procedures?.adopted ?? components['devbook-procedures']?.adopted)
  const phases = config?.phases && typeof config.phases === 'object' ? config.phases : {}
  const flows: FlowMap[] = Object.entries<any>(phases).map(([flow, map]) => ({
    flow,
    phases: Object.entries<any>(map ?? {}).map(([phase, entry]) => phaseLink(phase, entry)),
  }))
  const gates: GateLine[] = (Array.isArray(config?.gates) ? config.gates : []).map((g: any) => ({
    at: String(g?.at ?? '?'),
    when: String(g?.when ?? 'before'),
    purpose: String(g?.purpose ?? 'approval'),
    unattended: String(g?.unattended ?? 'block'),
  }))
  const bindings = Object.entries<any>(config?.bindings ?? {}).map(([k, v]): [string, string] => [
    k,
    v && typeof v === 'object' && 'provider' in v ? show(v.provider) : show(v),
  ])
  return {
    ...empty,
    id: String(config?.id ?? ''),
    stamps,
    folders: list(devbook.adopted),
    procedures,
    retired: retiredKeys(config),
    flows,
    gates,
    policy: Object.entries<any>(config?.policy ?? {}).map(([k, v]): [string, string] => [k, show(v)]),
    bindings,
  }
}

// ── Finding the repositories and the newest versions ─────────────────────────

const slashed = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '')

/** The configured roots, else the folder that holds this repository's main checkout. */
async function rootsOf($: EngineInterface, options: PluginOptions): Promise<string[]> {
  const configured = String(options.roots ?? '').split(/[;\n]/).map(r => slashed(r.trim())).filter(Boolean)
  if (configured.length > 0) return configured
  const root = slashed(await $.session.root())
  const [main = root] = root.split('/.claude/worktrees/')
  const parent = main.slice(0, main.lastIndexOf('/'))
  return [parent || main]
}

/** Each root itself and its direct children that carry `.devbook/config.json`; a worktree is never one. */
async function discover($: EngineInterface, roots: string[]): Promise<string[]> {
  const found: string[] = []
  for (const root of roots) {
    if (!(await $.fs.exists(root))) continue
    const children = (await $.fs.list(root)).filter(e => e.kind === 'dir' && !e.name.startsWith('.')).map(e => `${root}/${e.name}`)
    for (const dir of [root, ...children]) {
      if (dir.includes('/.claude/worktrees/') || found.includes(dir)) continue
      if (await $.fs.exists(`${dir}/.devbook/config.json`)) found.push(dir)
    }
  }
  return found
}

async function readJson($: EngineInterface, path: string): Promise<any> {
  try {
    return (await $.fs.exists(path)) ? JSON.parse(String(await $.fs.read(path))) : null
  } catch {
    return null
  }
}

/** The installed marketplace's folder: where `known_marketplaces.json` says, else its default place. */
async function marketplaceDir($: EngineInterface, name: string): Promise<string> {
  const config = await $.env.get('CLAUDE_CONFIG_DIR')
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? ''
  const profile = slashed(config || `${home}/.claude`)
  const known = await readJson($, `${profile}/plugins/known_marketplaces.json`)
  const at = known?.[name]?.installLocation
  return typeof at === 'string' ? slashed(at) : `${profile}/plugins/marketplaces/${name}`
}

async function load($: EngineInterface, options: PluginOptions): Promise<Rollout> {
  const name = String(options.marketplace || 'jsdotnet-devbook')
  const dir = await marketplaceDir($, name)
  const catalog = await readJson($, `${dir}/.claude-plugin/marketplace.json`)
  const plugins: any[] = Array.isArray(catalog?.plugins) ? catalog.plugins : []
  const newest: Record<string, string> = {}
  for (const [key, plugin] of Object.entries(COMPONENTS)) {
    const version = plugins.find(p => p?.name === plugin)?.version
    if (typeof version === 'string') newest[key] = version
  }

  const roots = await rootsOf($, options)
  const repos: RepoRow[] = []
  for (const path of await discover($, roots)) {
    const file = `${path}/.devbook/config.json`
    let text = ''
    try {
      text = String(await $.fs.read(file))
    } catch (err) {
      repos.push({ ...repoRow(path, '{}', newest), error: `unreadable: ${(err as Error).message}` })
      continue
    }
    repos.push(repoRow(path, text, newest))
  }
  repos.sort((a, b) => a.name.localeCompare(b.name))
  return { repos, newest, marketplace: catalog ? dir : null, roots, loadedAt: await $.clock.now() }
}

// ── Drawing ──────────────────────────────────────────────────────────────────

const DISTANCE_COLOR: Record<Distance, string> = { current: 'green', minor: 'yellow', major: 'red', ahead: 'cyan', unknown: 'gray' }
const MODE_COLOR: Record<PhaseMode, string> = { inline: 'gray', delegate: 'cyan', fork: 'blue' }

const columnsOf = (rollout: Rollout) => {
  const extra = new Set<string>()
  for (const repo of rollout.repos) for (const key of Object.keys(repo.stamps)) if (!(key in COMPONENTS)) extra.add(key)
  return [...Object.keys(COMPONENTS), ...[...extra].sort()]
}

/** The prompt a row's button puts in the box; never sent. */
const promptFor = (skill: 'doctor' | 'update', repo: RepoRow) =>
  `/devbook-config:${skill} for the repository at ${repo.path.replace(/\//g, '\\')}`

const short = (phase: string) => phase.replace(/^phase-/, '')

/** A stamp column is as wide as its name, never narrower than a version. */
const widthOf = (column: string) => Math.max(10, column.length + 2)

async function refresh($: EngineInterface, options: PluginOptions) {
  await $.state.set(ROLLOUT, await load($, options))
}

async function fill($: EngineInterface, text: string) {
  const done = await $.prompt.fill({ text })
  $.ui.toast(done.isFilled ? 'Prompt filled — review it and press Enter to run it.' : 'The prompt box is busy; nothing was filled.')
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'rollout',
      description: 'Show which devbook stack version every repository on this machine is on, and how one is configured',
    })
    return next(e)
  })

  on('command.run', { command: 'rollout' }, async $ => {
    await refresh($, options)
    await $.ui.open({ id: PANE, title: TITLE })
    const { value } = await $.state.get(ROLLOUT)
    return { text: `Rollout pane opened: ${value?.repos.length ?? 0} repositories.` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const { value: rollout } = await $.state.get(ROLLOUT)
    const view = (await $.state.get(VIEW)).value ?? 'matrix'
    const columns = (e.props as any)?.bodyColumns ?? e.viewport?.columns ?? 80
    const isWide = columns >= 100

    const toolbar = (
      <Box flexDirection="row" gap={2} marginBottom={1}>
        <Button key="matrix" plain onPress={() => $.state.set(VIEW, 'matrix')}>
          {view === 'matrix' ? '[matrix]' : 'matrix'}
        </Button>
        <Button key="config" plain onPress={() => $.state.set(VIEW, 'config')}>
          {view === 'config' ? '[config map]' : 'config map'}
        </Button>
        <Button key="refresh" plain onPress={() => refresh($, options)}>
          ↻ refresh
        </Button>
      </Box>
    )

    if (!rollout) {
      return (
        <Box flexDirection="column">
          {toolbar}
          <Text dimColor>Nothing read yet. Press refresh.</Text>
        </Box>
      )
    }
    if (rollout.repos.length === 0) {
      return (
        <Box flexDirection="column">
          {toolbar}
          <Text dimColor>No repository with .devbook/config.json under {rollout.roots.join(', ')}.</Text>
          <Text dimColor>Set the plugin's roots option to look elsewhere.</Text>
        </Box>
      )
    }

    const index = Math.min((await $.state.get(SELECTED)).value ?? 0, rollout.repos.length - 1)
    const newest = Object.entries(rollout.newest).map(([k, v]) => `${k} ${v}`).join(' · ')
    const header = (
      <Text dimColor wrap="truncate-end">
        {rollout.repos.length} repositories under {rollout.roots.join(', ')} ·{' '}
        {rollout.marketplace ? `newest ${newest}` : 'marketplace not found: versions not compared'}
      </Text>
    )

    if (view === 'config') return configView($, Box, Text, Button, toolbar, rollout.repos, index, columns)

    const cols = columnsOf(rollout)
    const dots = (all: string[], have: string[]) =>
      all.map(f => (
        <Text color={have.includes(f) ? 'green' : 'gray'} dimColor={!have.includes(f)}>
          {have.includes(f) ? '●' : '·'}
        </Text>
      ))

    return (
      <Box flexDirection="column">
        {toolbar}
        {header}
        <Box flexDirection="row" gap={2} marginBottom={1}>
          <Text color="green">current</Text>
          <Text color="yellow">minor behind</Text>
          <Text color="red">major behind</Text>
          <Text dimColor>● folders {FOLDERS.join(' ')} · procedures {PROCEDURES.join(' ')}</Text>
        </Box>
        <Box flexDirection="row">
          <Box width={18}>
            <Text bold>repository</Text>
          </Box>
          {cols.map(c => (
            <Box width={widthOf(c)}>
              <Text bold wrap="truncate-end">
                {c}
              </Text>
            </Box>
          ))}
          {isWide && (
            <Box width={16}>
              <Text bold>folders · procs</Text>
            </Box>
          )}
        </Box>
        {rollout.repos.map((repo, i) => {
          const cells = cols.map(c => {
            const cell = repo.stamps[c]
            return (
              <Box width={widthOf(c)}>
                <Text color={cell ? DISTANCE_COLOR[cell.distance] : 'gray'} dimColor={!cell}>
                  {cell?.version ?? '–'}
                </Text>
              </Box>
            )
          })
          const marks = (
            <Box flexDirection="row" width={16}>
              {dots(FOLDERS, repo.folders)}
              <Text> </Text>
              {dots(PROCEDURES, repo.procedures)}
            </Box>
          )
          const actions = (
            <Box flexDirection="row" gap={1}>
              <Button key={`doctor-${i}`} plain onPress={() => fill($, promptFor('doctor', repo))}>
                doctor
              </Button>
              <Button key={`update-${i}`} plain onPress={() => fill($, promptFor('update', repo))}>
                update
              </Button>
              <Button
                key={`map-${i}`}
                plain
                onPress={async () => {
                  await $.state.set(SELECTED, i)
                  await $.state.set(VIEW, 'config')
                }}
              >
                map
              </Button>
            </Box>
          )
          return (
            <Box key={`r${i}`} flexDirection="column">
              <Box flexDirection="row">
                <Box width={18}>
                  <Text color={repo.error || repo.retired.length ? 'red' : undefined} wrap="truncate-end">
                    {repo.name}
                  </Text>
                </Box>
                {cells}
                {isWide && marks}
                {isWide && actions}
              </Box>
              {!isWide && (
                <Box flexDirection="row" gap={2} marginLeft={2}>
                  {marks}
                  {actions}
                </Box>
              )}
              {repo.error && (
                <Text color="red" wrap="truncate-end">
                  {'  '}✗ {repo.error}
                </Text>
              )}
              {repo.retired.length > 0 && (
                <Text color="red" wrap="truncate-end">
                  {'  '}✗ retired: {repo.retired.join(', ')}
                </Text>
              )}
            </Box>
          )
        })}
      </Box>
    )
  })
}

/** One repository's wiring: each flow's phases as a chain, with the gates where they sit, then policy and bindings. */
function configView($: EngineInterface, Box: any, Text: any, Button: any, toolbar: unknown, repos: RepoRow[], index: number, columns: number) {
  // Two flows side by side once each column still fits a phase row; stacked below that.
  const isSideBySide = columns >= 110 && (repos[index]?.flows.length ?? 0) > 1
  const repo = repos[index]!
  const step = (by: number) => $.state.set(SELECTED, (index + by + repos.length) % repos.length)
  const who = (p: PhaseLink) =>
    [p.agent, [p.model, p.effort].filter(Boolean).join('/'), p.skill ? `skill ${p.skill}` : '', p.mcp === null ? '' : `mcp ${p.mcp.join(', ') || 'none'}`, p.app ? `app ${p.app}` : '']
      .filter(Boolean)
      .join(' · ')
  const chores = (p: PhaseLink) =>
    [p.before.length ? `before ${p.before.join(', ')}` : '', p.after.length ? `after ${p.after.join(', ')}` : ''].filter(Boolean).join(' · ')
  const gateAt = (phase: string, when: string) =>
    repo.gates.filter(g => g.at === short(phase.split(':')[0] ?? phase) && g.when === when).map(g => (
      <Text color="magenta" wrap="truncate-end">
        ◆ gate {g.when} {g.at}: {g.purpose} · unattended {g.unattended}
      </Text>
    ))
  const fixed = (name: string, isGate: boolean) => (
    <Text color={isGate ? 'magenta' : 'gray'} wrap="truncate-end">
      {isGate ? '◆' : '○'} {name} <Text dimColor>· always inline, never configured</Text>
    </Text>
  )

  return (
    <Box flexDirection="column">
      {toolbar as any}
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold wrap="truncate-end">
          {repo.name}
          {repo.id && repo.id !== repo.name ? <Text dimColor> · {repo.id}</Text> : ''}
        </Text>
        <Box flexDirection="row" gap={1} flexShrink={0}>
          <Button key="prev" plain onPress={() => step(-1)}>
            ‹
          </Button>
          <Text dimColor>
            {index + 1}/{repos.length}
          </Text>
          <Button key="next" plain onPress={() => step(1)}>
            ›
          </Button>
        </Box>
      </Box>
      <Box flexDirection="row" gap={2} marginBottom={1}>
        <Text color={MODE_COLOR.inline}>○ inline</Text>
        <Text color={MODE_COLOR.delegate}>▶ delegate</Text>
        <Text color={MODE_COLOR.fork}>⑂ fork</Text>
        <Text color="magenta">◆ gate</Text>
        <Text dimColor>dim = the phase's default</Text>
      </Box>
      {repo.retired.length > 0 && (
        <Text color="red" wrap="wrap">
          ✗ retired keys: {repo.retired.join(', ')} — devbook-config:update migrates them
        </Text>
      )}
      {repo.flows.length === 0 && <Text dimColor>No phase maps: the engine is not configured here.</Text>}
      <Box flexDirection={isSideBySide ? 'row' : 'column'} gap={isSideBySide ? 4 : 0}>
      {repo.flows.map(flow => (
        <Box key={flow.flow} flexDirection="column" marginBottom={1} flexShrink={1} width={isSideBySide ? '50%' : undefined}>
          <Text bold>{flow.flow}</Text>
          {flow.phases.map((p, i) => {
            const isLast = i === flow.phases.length - 1
            const extra = chores(p)
            return (
              <Box key={`${flow.flow}-${p.phase}`} flexDirection="column">
                {p.phase === 'phase-create-pr' && fixed('ready', false)}
                {p.phase === 'phase-create-pr' && fixed('personal-validation', true)}
                {gateAt(p.phase, 'before')}
                <Box flexDirection="row" gap={1}>
                  <Text color={MODE_COLOR[p.mode]}>{p.mode === 'inline' ? '○' : p.mode === 'fork' ? '⑂' : '▶'}</Text>
                  <Box width={18}>
                    <Text wrap="truncate-end">{short(p.phase)}</Text>
                  </Box>
                  <Box width={9}>
                    <Text color={MODE_COLOR[p.mode]} dimColor={!p.isConfigured}>
                      {p.mode}
                    </Text>
                  </Box>
                  <Text dimColor wrap="truncate-end">
                    {who(p)}
                  </Text>
                </Box>
                {extra && (
                  <Text dimColor wrap="truncate-end">
                    {isLast ? ' ' : '│'} {'  '}
                    {extra}
                  </Text>
                )}
                {gateAt(p.phase, 'after')}
              </Box>
            )
          })}
        </Box>
      ))}
      </Box>
      {repo.policy.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>policy</Text>
          {repo.policy.map(([k, v]) => (
            <Text wrap="truncate-end">
              <Text dimColor>{k}</Text> {v}
            </Text>
          ))}
        </Box>
      )}
      {repo.bindings.length > 0 && (
        <Box flexDirection="column">
          <Text bold>bindings</Text>
          {repo.bindings.map(([k, v]) => (
            <Text wrap="truncate-end">
              <Text dimColor>{k}</Text> {v}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}
