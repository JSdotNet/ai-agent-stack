The claude-desktop host profile binds the delivery engine's host slots for this session. A shared skill names a slot and never a host's own file; these are what the names resolve to here, and nothing else in this plugin changes how a flow runs.

- repo-instructions -> CLAUDE.md at the repository root, and AGENTS.md when there is no CLAUDE.md.
- repo-flow-context -> .claude/flow-context.md at the repository root.
- model-override -> the path in CLAUDE_FLOW_MODEL_SELECTION_PATH when that variable is set, otherwise %USERPROFILE%\.claude\flow\model-selection.md on Windows and ~/.claude/flow/model-selection.md on macOS and Linux. Model choice is personal: never read a model from the repository.
- stage-delegation -> sub-agents are available, so a stage that declares a delegation hint is delegated rather than run inline.
- surface -> prefer delivery-dashboard, then whichever other surface answers the capability, resolved by pattern from the live tool list rather than by a literal tool name. No surface bound is a normal outcome that never blocks a stage.
- pr-lane -> the gh CLI when it is on PATH; without it, deliver produces file artifacts only.

Two skills here belong to the host rather than to the engine. Use start to bring this repository's application up and open it, reading the repository's own startup instruction rather than a command guessed per session. Use session-handoff to package this session's state into a brief the next session continues from; run it when the context gauge crosses 85%, and never start the next session yourself.
