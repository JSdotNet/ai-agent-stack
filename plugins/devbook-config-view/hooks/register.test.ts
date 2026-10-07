import type { FsEntry, On } from 'claude-code'
import { type Engine, expect, test } from 'claude-code/testing'

import type { Rollout } from '../types'

const PROFILE = 'C:/Users/dev/.claude'
const ROOT = 'D:/Repos/devbook/.claude/worktrees/rollout-1a2b3c'
const MARKET = `${PROFILE}/plugins/marketplaces/jsdotnet-devbook`

const slashed = (path: string) => path.replace(/\\/g, '/')
const dir = (name: string): FsEntry => ({ name, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })
const file = (name: string): FsEntry => ({ name, kind: 'file', size: 1, mtimeMs: 1, isLink: false })

const catalog = JSON.stringify({
  plugins: [
    { name: 'devbook', version: '1.20.1' },
    { name: 'delivery', version: '1.20.1' },
    { name: 'delivery-schedule', version: '1.20.1' },
  ],
})

const config = (body: object) => JSON.stringify({ id: 'x', ...body })

/**
 * A machine holding `files` (path → content), this session in a worktree at ROOT; every write is
 * recorded. `$.state` is stubbed so a test can read it back, unless `isDrawn`: a drawing redraws
 * only on the engine's own state.
 */
function machine(on: On, files: Record<string, string>, isDrawn = false) {
  on('env.get', ($, e) => ({ value: e.name === 'CLAUDE_CONFIG_DIR' ? PROFILE : undefined }))
  on('session.root', () => ({ value: ROOT }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('clock.now', () => ({ value: 1 }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))

  const seen = { written: [] as string[], filled: [] as string[] }
  on('fs.write', ($, e) => {
    seen.written.push(slashed(e.path))
    return { value: undefined as any }
  })
  on('prompt.fill', ($, e) => {
    seen.filled.push(e.text)
    return { isFilled: true }
  })

  const paths = Object.keys(files)
  on('fs.exists', ($, e) => ({ value: paths.some(p => p === slashed(e.path) || p.startsWith(`${slashed(e.path)}/`)) }))
  on('fs.read', ($, e) => ({ value: files[slashed(e.path)] ?? '' }))
  on('fs.list', ($, e) => {
    const path = slashed(e.path)
    const children = new Map<string, FsEntry>()
    for (const p of paths.filter(p => p.startsWith(`${path}/`))) {
      const [name = '', ...rest] = p.slice(path.length + 1).split('/')
      children.set(name, rest.length > 0 ? dir(name) : file(name))
    }
    return { value: [...children.values()] }
  })

  const state = new Map<string, unknown>()
  if (isDrawn) return { seen, rollout: () => state.get('rollout') as Rollout }
  on('state.set', ($, e) => {
    state.set(e.key, e.value)
    return { value: { isSet: true as const, version: state.size } }
  })
  on('state.get', ($, e) => ({ value: { value: state.get(e.key) as any, version: 0 } }))
  return { seen, rollout: () => state.get('rollout') as Rollout }
}

/** `/rollout` as the person types it. */
const ROLLOUT = { command: 'rollout', args: '', origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }

const open = async ($: Engine) => {
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  return $.command.run(ROLLOUT)
}

const FILES = {
  [`${MARKET}/.claude-plugin/marketplace.json`]: catalog,
  'D:/Repos/Backlog/.devbook/config.json': config({
    components: {
      devbook: { pluginVersion: '1.20.1', adopted: ['arc42', 'domain'], procedures: { adopted: ['run', 'capture'] } },
      delivery: { pluginVersion: '1.20.1' },
    },
  }),
  'D:/Repos/spec-manager/.devbook/config.json': config({
    extensions: { implement: 'csharp-coding' },
    bindings: { 'delivery.roles': {}, 'delivery.tracker': { provider: 'github' } },
    components: {
      devbook: { pluginVersion: '1.13.0' },
      'devbook-procedures': { pluginVersion: '1.13.0', adopted: ['run', 'show'] },
      schedule: { pluginVersion: '0.9.0' },
    },
  }),
  'D:/Repos/devbook/.devbook/config.json': config({}),
  'D:/Repos/devbook/.claude/worktrees/rollout-1a2b3c/.devbook/config.json': config({}),
  'D:/Repos/plain/README.md': '',
}

test("finds every repository beside the main checkout, never a worktree, and grades each stamp against the marketplace", async ($, on) => {
  const { rollout } = machine(on, FILES)

  await open($)

  const { repos, roots, newest } = rollout()
  expect(roots).toEqual(['D:/Repos'])
  expect(newest).toEqual({ devbook: '1.20.1', delivery: '1.20.1', schedule: '1.20.1' })
  expect(repos.map(r => r.name)).toEqual(['Backlog', 'devbook', 'spec-manager'])
  const [backlog, , spec] = repos
  expect(backlog!.stamps.devbook).toEqual({ version: '1.20.1', distance: 'current' })
  expect([backlog!.folders, backlog!.procedures]).toEqual([['arc42', 'domain'], ['run', 'capture']])
  expect(spec!.stamps.devbook!.distance).toBe('minor')
  expect(spec!.stamps.schedule!.distance).toBe('major')
  expect(spec!.procedures).toEqual(['run', 'show'])
})

test('flags every retired key a config still carries', async ($, on) => {
  const { rollout } = machine(on, FILES)

  await open($)

  const spec = rollout().repos.find(r => r.name === 'spec-manager')!
  expect(spec.retired).toEqual(['extensions', 'bindings["delivery.roles"]', 'components.devbook-procedures'])
  expect(rollout().repos.find(r => r.name === 'Backlog')!.retired).toEqual([])
})

test('reads each phase the way the flow-runner resolves it', async ($, on) => {
  const { rollout } = machine(on, {
    ...FILES,
    'D:/Repos/Backlog/.devbook/config.json': config({
      phases: {
        'flow-code': {
          'phase-update-base': { before: ['devbook:validate'] },
          'phase-scope': {},
          'phase-implement': { agent: 'csharp-coding:coding' },
          'phase-review': { agent: null },
          'phase-build-test': { model: 'inherit' },
          'phase-verify': { effort: 'high', mcp: null },
        },
      },
      gates: [{ at: 'create-pr', when: 'before', purpose: 'approval' }],
      policy: { 'qa.depth': 'full' },
    }),
  })

  await open($)

  const backlog = rollout().repos.find(r => r.name === 'Backlog')!
  const modes = backlog.flows[0]!.phases.map(p => [p.phase, p.mode, p.isConfigured])
  expect(modes).toEqual([
    ['phase-update-base', 'inline', false],
    ['phase-scope', 'fork', false],
    ['phase-implement', 'delegate', true],
    ['phase-review', 'inline', true],
    ['phase-build-test', 'delegate', false],
    ['phase-verify', 'delegate', true],
  ])
  expect(backlog.flows[0]!.phases[5]!.mcp).toEqual([])
  expect(backlog.gates).toEqual([{ at: 'create-pr', when: 'before', purpose: 'approval', unattended: 'block' }])
  expect(backlog.policy).toEqual([['qa.depth', 'full']])
})

test('reads only the default root when no roots are configured, and writes nothing anywhere', async ($, on) => {
  const { seen, rollout } = machine(on, { ...FILES, 'E:/Work/api/.devbook/config.json': config({}) })

  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  await $.command.run(ROLLOUT)
  expect(rollout().repos.length).toBe(3)
  expect(seen.written).toEqual([])
})

test('the roots option replaces the default root', { options: { roots: 'E:/Work' } }, async ($, on) => {
  const { rollout } = machine(on, { ...FILES, 'E:/Work/api/.devbook/config.json': config({}) })

  await open($)

  expect(rollout().roots).toEqual(['E:/Work'])
  expect(rollout().repos.map(r => r.name)).toEqual(['api'])
})

test("a row's buttons fill the prompt for that repository and never send it", async ($, on) => {
  const { seen } = machine(on, FILES)
  on('prompt.submit', () => {
    throw new Error('the view must never submit a prompt')
  })

  await open($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'devbook-config-view', surface, component: 'Pane', requestId: 'devbook-config-view', props: { bodyColumns: 120 } as any })
    await ui.press({ key: 'doctor-2' })
    await ui.press({ key: 'update-0' })
    await ui.unmount()
  }

  expect(seen.filled).toEqual([
    '/devbook-config:doctor for the repository at D:\\Repos\\spec-manager',
    '/devbook-config:update for the repository at D:\\Repos\\Backlog',
    '/devbook-config:doctor for the repository at D:\\Repos\\spec-manager',
    '/devbook-config:update for the repository at D:\\Repos\\Backlog',
  ])
})

test("draws phase-verify's app provider, and none for an app set to null", async ($, on) => {
  const { rollout } = machine(on, {
    ...FILES,
    'D:/Repos/Backlog/.devbook/config.json': config({
      phases: { 'flow-code': { 'phase-verify': { app: { provider: 'repo:run', host: 'aspire' } } }, 'flow-spec': { 'phase-verify': { app: null } } },
    }),
  })

  await open($)

  const [code, spec] = rollout().repos.find(r => r.name === 'Backlog')!.flows
  expect([code!.phases[0]!.app, spec!.phases[0]!.app]).toEqual(['repo:run', 'none'])
})

test('the config map draws both flows on every surface, wide and narrow', async ($, on) => {
  machine(on, {
    ...FILES,
    'D:/Repos/Backlog/.devbook/config.json': config({
      phases: { 'flow-code': { 'phase-scope': {} }, 'flow-spec': { 'phase-scope': {} } },
    }),
  }, true)

  await open($)
  for (const surface of ['terminal', 'desktop'] as const) {
    for (const bodyColumns of [80, 140]) {
      const ui = await $.ui.mount({ plugin: 'devbook-config-view', surface, component: 'Pane', requestId: 'devbook-config-view', props: { bodyColumns } as any })
      await ui.press({ key: 'map-0' })
      expect(await ui.find({ type: 'Text', text: /flow-code/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /flow-spec/ })).toBeDefined()
      await ui.press({ key: 'matrix' })
      await ui.unmount()
    }
  }
})
