/** How far a stamped version is from the newest the installed marketplace lists. */
export type Distance = 'current' | 'minor' | 'major' | 'ahead' | 'unknown'

/** One `components.<name>` stamp, read as the matrix shows it. */
export type StampCell = { version: string | null; distance: Distance }

/** How a phase runs, derived from its map entry the way the flow-runner resolves it. */
export type PhaseMode = 'inline' | 'delegate' | 'fork'

export type PhaseLink = {
  phase: string
  mode: PhaseMode
  /** True when the entry chose the mode; false when it is the phase's default. */
  isConfigured: boolean
  agent: string | null
  skill: string | null
  model: string | null
  effort: string | null
  mcp: string[] | null
  before: string[]
  after: string[]
}

export type FlowMap = { flow: string; phases: PhaseLink[] }

export type GateLine = { at: string; when: string; purpose: string; unattended: string }

export type RepoRow = {
  name: string
  path: string
  id: string
  stamps: Record<string, StampCell>
  folders: string[]
  procedures: string[]
  /** Every key the stack retired that this config still carries, as `extensions` or `bindings["delivery.roles"]`. */
  retired: string[]
  flows: FlowMap[]
  gates: GateLine[]
  policy: [string, string][]
  bindings: [string, string][]
  /** Set when the file does not parse. */
  error: string | null
}

export type Rollout = {
  repos: RepoRow[]
  /** Newest version per stamp key, from the installed marketplace. */
  newest: Record<string, string>
  marketplace: string | null
  roots: string[]
  loadedAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'devbook-config-view': { rollout: Rollout | null; view: 'matrix' | 'config'; selected: number }
  }
}
