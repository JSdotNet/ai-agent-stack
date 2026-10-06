import type { FsEntry, On } from 'claude-code'
import { type Engine, expect, mock, test } from 'claude-code/testing'

const PROFILE = 'C:/Users/dev/.claude'
const SESSION = 'session-1'

/** The engine hands a path over in the platform's spelling; the fake profile keys on forward slashes. */
const slashed = (path: string) => path.replace(/\\/g, '/')

const dir = (name: string): FsEntry => ({ name, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })
const file = (name: string, mtimeMs: number): FsEntry => ({ name, kind: 'file', size: 1, mtimeMs, isLink: false })

const runFile = (id: string, sessionIds: string[]) =>
  JSON.stringify({
    id,
    skillId: 'flow-code',
    title: id,
    status: 'in_progress',
    updatedAt: '2026-10-06T21:00:00.000Z',
    sessionIds,
    stages: [{ name: 'Scope', status: 'in_progress' }],
  })

/** A profile holding `files` (path → content) under the surfaces' folders, a worktree at `root`. */
function machine(on: On, root: string, files: Record<string, string>) {
  mock.env(on, { CLAUDE_CONFIG_DIR: PROFILE })
  on('session.root', () => ({ value: root }))
  on('session.id', () => ({ value: SESSION }))
  on('clock.every', () => ({ value: undefined }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))

  const seen = { read: [] as string[], opened: [] as string[], status: [] as (string | undefined)[] }
  on('ui.status', ($, e) => {
    seen.status.push(e.text)
    return { value: undefined }
  })

  const paths = Object.keys(files)
  on('fs.exists', ($, e) => ({ value: paths.some(p => p === slashed(e.path) || p.startsWith(`${slashed(e.path)}/`)) }))
  on('fs.read', ($, e) => {
    seen.read.push(slashed(e.path))
    return { value: files[slashed(e.path)] ?? '' }
  })
  on('fs.list', ($, e) => {
    const path = slashed(e.path)
    const children = new Map<string, FsEntry>()
    for (const p of paths.filter(p => p.startsWith(`${path}/`))) {
      const [name = '', ...rest] = p.slice(path.length + 1).split('/')
      children.set(name, rest.length > 0 ? dir(name) : file(name, 1))
    }
    return { value: [...children.values()] }
  })

  on('ui.open', ($, e) => {
    seen.opened.push(e.id)
    return { value: { isPlaced: true as const } }
  })
  return seen
}

const start = ($: Engine, cwd: string) =>
  $.session.start({ cwd, surface: 'desktop', isInteractive: true })

test("discovers the worktree's <slug>-<hash> folder and opens the pane for this session's run", async ($, on) => {
  const root = 'D:/Repos/App/.claude/worktrees/fix-pairing-be2949'
  const seen = machine(on, root, {
    [`${PROFILE}/backlog/fix-pairing-be2949-85435863/runs/run-a.json`]: runFile('run-a', [SESSION]),
    [`${PROFILE}/backlog/other-worktree-0123abcd/runs/run-b.json`]: runFile('run-b', [SESSION]),
  })

  await start($, root)

  expect(seen.read).toEqual([`${PROFILE}/backlog/fix-pairing-be2949-85435863/runs/run-a.json`])
  expect(seen.status.at(-1)).toBe('flow-code · Scope')
  expect(seen.opened).toEqual(['delivery-run-view'])
})

test("shows the main checkout's runs in a fresh worktree without opening the pane for them", async ($, on) => {
  const root = 'D:/Repos/App/.claude/worktrees/fresh-c0ffee'
  const seen = machine(on, root, {
    [`${PROFILE}/delivery-surface-dashboard/App-43b9057e/runs/run-m.json`]: runFile('run-m', ['an-older-session']),
  })

  await start($, root)

  expect(seen.read).toEqual([`${PROFILE}/delivery-surface-dashboard/App-43b9057e/runs/run-m.json`])
  expect(seen.status.at(-1)).toBeUndefined()
  expect(seen.opened).toEqual([])
})
