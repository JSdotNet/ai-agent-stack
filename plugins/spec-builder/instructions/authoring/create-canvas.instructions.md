---
applyTo: '.github/extensions/**/extension.mjs'
description: Dedicated rules for creating and refining Copilot canvas extensions.
---

# Create Canvas Instructions

## Purpose

- Standardize authoring of canvas extensions that expose interactive side-panel surfaces to the agent.
- Ensure canvas extensions are discoverable, reloadable, and safe to run locally.
- Keep project-wide plugin composition conventions in `create-plugin.instructions.md` instead of duplicating them here.

Over the 60-line budget by design: the Copilot CLI extension API contract below is reference
the author cannot look up in the repository.

## When To Apply

- Apply when a request asks to create or evolve a canvas (an `open_canvas` / `invoke_canvas_action` surface), not a plain tool or hook extension.
- Apply alongside `create-plugin.instructions.md` when a canvas extension is bundled inside a plugin package.

## Host Support

Canvas extensions are **Copilot-only**. The extension API has no Claude Code counterpart, so
a canvas cannot be made dual-host — unlike every other asset type this plugin authors.

- State the limitation explicitly whenever a canvas is proposed, before building it.
- Say so in the plugin README, so a canvas-dependent plugin is never advertised as loadable
  in Claude.
- Never make a plugin's core capability depend on a canvas unless Copilot-only is acceptable.
  Prefer a canvas as an optional enhancement over a required surface.
- The nearest Claude equivalents, if the surface must exist on both hosts, are a published
  Artifact for rendered output and an MCP server for interactive state. Both are rewrites,
  not translations.

## Required Canvas Composition Flow

1. Scaffold the extension with `extensions_manage` (`operation: "scaffold"`, `kind: "canvas"`) rather than hand-writing the skeleton.
2. Define canvas identity:
   - `id` (kebab-case, unique across loaded extensions), `displayName`, `description`.
   - Optional `inputSchema` describing the payload accepted by `open`.
3. Define actions:
   - Each action needs a unique `name`, a `description`, an optional `inputSchema`, and a `handler`.
4. Implement `open`:
   - Return `{ title, url }` (or the renderer contract required by the host).
   - Reuse an existing per-instance server/state when `ctx.instanceId` is already known; do not leak a new server per call.
5. Implement `onClose`:
   - Tear down per-instance resources (servers, timers, file handles) keyed by `ctx.instanceId`.
6. Reload and verify:
   - Call `extensions_reload` after every edit.
   - Verify with `extensions_manage` (`operation: "list"` then `operation: "inspect"`) and confirm the extension is not marked failed.

## Required Files

- `.github/extensions/<canvas-name>/extension.mjs` (project scope) or the user/session extensions directory equivalent.
- Any renderer assets imported from `extension.mjs` (templates, static files) kept alongside the entry point.

## Mandatory Copilot CLI Requirements

- Entry point must be named `extension.mjs` (ES modules only; `.ts` is not supported).
- Import `joinSession` and `createCanvas` from `@github/copilot-sdk/extension`.
- Register the canvas via the `canvases` array passed to `joinSession`.
- Canvas `id` and every action `name` must be unique across all loaded extensions; collisions fail extension load.
- Bind any local HTTP server to loopback (`127.0.0.1`) on an OS-assigned port (`0`); never bind to a public interface.
- Never use `console.log()` inside the extension process; use `session.log()` instead, since stdout is reserved for JSON-RPC.

## Recommended Asset Layout

- Single-file canvases: keep everything in `extension.mjs`.
- Multi-action or stateful canvases: extract action handlers, `open`/`onClose` helpers, and renderer assets into sibling files imported from `extension.mjs`, keeping the entry point focused on wiring.

## Rules

- Use kebab-case for the canvas `id` and for action `name`s.
- Keep `description` fields action-oriented and specific enough for the agent to choose the right action.
- Key all per-instance state (servers, sessions, caches) by `ctx.instanceId`, never by canvas `id` alone.
- Always release resources in `onClose`; do not rely on process exit for cleanup.
- Keep canvas extensions self-contained, depending only on their own assets.
- Follow [spec-conciseness.instructions.md](spec-conciseness.instructions.md) for pruning.
