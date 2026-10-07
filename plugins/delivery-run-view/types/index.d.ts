/** How a phase runs: in the main thread, handed to a sub-agent, or as a `context: fork` skill. */
export type FlowMode = 'inline' | 'delegate' | 'fork' | 'gate'

export type FlowWorker = {
  name: string
  model: string
  durationMs: number | null
  tokens: number | null
  toolCalls: number | null
  isFailed: boolean
  /** It ran under the gate: work a revise round reopened, reported on the gate's stage. */
  isRevise: boolean
}

export type FlowScenario = { name: string; status: string }

export type FlowStage = {
  name: string
  status: string
  mode: FlowMode
  /** True when the mode was read from the run, false when this pane inferred it. */
  isModeRecorded: boolean
  agent: string | null
  model: string | null
  effort: string | null
  /** The procedure the phase followed, its MCP servers (`[]` for none, null when unrecorded), and its chores. */
  skill: string | null
  mcp: string[] | null
  before: string[]
  after: string[]
  /** The configured id that did not resolve, so the phase fell back to its built-in procedure. */
  fallback: string | null
  /** What the run's resolved `runContext.phases` entry asked for; null when the run records none. */
  configured: { agent: string | null; model: string | null; effort: string | null } | null
  /** The fields where what ran differs from what was configured. */
  mismatch: string[]
  passes: number
  durationMs: number | null
  outputTokens: number | null
  toolCalls: number
  workers: FlowWorker[]
  scenarios: FlowScenario[]
  links: string[]
  output: string
}

export type FlowRun = {
  id: string
  skillId: string
  title: string
  status: string
  changeKind: string
  approval: string
  updatedAt: string
  startedAt: string
  isThisSession: boolean
  contextPeak: number | null
  contextLimit: number | null
  stages: FlowStage[]
}

declare module 'claude-code' {
  interface PluginState {
    'delivery-run-view': { runs: FlowRun[]; selected: number; focus: number }
  }
}
