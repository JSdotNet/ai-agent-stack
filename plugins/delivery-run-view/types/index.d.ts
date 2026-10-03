/** How a phase runs: in the main thread, handed to a sub-agent, or as a `context: fork` skill. */
export type FlowMode = 'inline' | 'delegate' | 'fork' | 'gate'

export type FlowWorker = {
  name: string
  model: string
  durationMs: number | null
  tokens: number | null
  toolCalls: number | null
  isFailed: boolean
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
