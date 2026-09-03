// Idle-run detection for delivery-collector runs.
//
// A run only leaves `in_progress` when `finish_run` is called. A human gate can sit before
// that by design — the driving agent hands control back and waits — and when the user never
// answers, the run stays `in_progress` forever. Left alone such a run keeps accruing wall-clock
// elapsed time and gets silently re-adopted by the next `start_run` for the same skill.
//
// Idleness is **derived, never stored as a status**. A resumed session that calls
// `update_stage` / `set_run_context` refreshes `updatedAt` and clears the stamp, and the
// run is simply live again — no state machine to unwind. Two signals feed it:
//
//   1. `updatedAt` older than the threshold — nothing has advanced the run for hours.
//      This is the only signal a headless collector has: it observes no session events, so
//      an ended session and a walked-away one look the same to it.
//   2. An `idleSince` stamp on the run, if something wrote one. Nothing here does; it is
//      read so that a run file this collector shares with a surface that does stamp it is
//      not read back as live.

// A gate legitimately waits on a human, so the threshold has to be longer
// than a lunch break and shorter than a night. SessionEnd covers the common case exactly;
// this is the backstop for a session left open.
export const DEFAULT_IDLE_AFTER_MS = 4 * 60 * 60 * 1000;

export function idleAfterMs() {
    const minutes = Number(process.env.DELIVERY_COLLECTOR_IDLE_AFTER_MINUTES);
    if (Number.isFinite(minutes) && minutes > 0) return minutes * 60 * 1000;
    return DEFAULT_IDLE_AFTER_MS;
}

// Timestamp (ms) at which the run stopped progressing, or null while it is live or
// already finished.
export function idleSinceMs(run, now = Date.now()) {
    if (!run || run.status !== "in_progress") return null;
    const stamped = run.idleSince ? new Date(run.idleSince).getTime() : NaN;
    if (Number.isFinite(stamped)) return stamped;
    const updated = run.updatedAt ? new Date(run.updatedAt).getTime() : NaN;
    if (!Number.isFinite(updated)) return null;
    return now - updated >= idleAfterMs() ? updated : null;
}

export function isIdle(run, now = Date.now()) {
    return idleSinceMs(run, now) !== null;
}

// The moment a run's clock should stop: `now` while it is live, the idle point once it is
// not, and `updatedAt` once it has finished. Callers use this instead of `Date.now()` so
// an abandoned gate does not report hours of waiting as elapsed run time.
export function effectiveEndedAtMs(run, now = Date.now()) {
    if (!run) return null;
    if (run.status === "in_progress") return idleSinceMs(run, now) ?? now;
    const updated = run.updatedAt ? new Date(run.updatedAt).getTime() : NaN;
    return Number.isFinite(updated) ? updated : null;
}

// Called wherever a run is written after real progress. Clearing the stamp is what makes
// a resumed run live again without any explicit "unpause" step.
export function clearIdle(run) {
    if (run && run.idleSince) delete run.idleSince;
    return run;
}

// A **handoff** is the deliberate counterpart to idleness: the owner session ended on
// purpose, at a context threshold, with the intent that another session pick the run up
// from where it stopped.
//
// Both look identical to `isIdle` — session ended, nothing advancing — so the marker is
// what separates "waiting to be continued" from "abandoned at a gate". Without it,
// `start_run` would refuse the reattach and the next session would open a duplicate run,
// which is the one outcome a handoff exists to avoid.
export function isHandoffPending(run) {
    return Boolean(run && run.status === "in_progress" && run.handoff && run.handoff.pending);
}

export function markHandoff(run, { note, stage, at = new Date().toISOString() } = {}) {
    if (!run) return run;
    run.handoff = {
        pending: true,
        note: typeof note === "string" && note ? note : (run.handoff && run.handoff.note) || "",
        stage: stage || (run.handoff && run.handoff.stage) || null,
        at,
    };
    return run;
}

// Called on reattach, not on resume-in-place: the note is kept so the run file still shows
// where the previous session stopped, but the run is live again.
export function clearHandoff(run) {
    if (run && run.handoff && run.handoff.pending) {
        run.handoff = { ...run.handoff, pending: false, resumedAt: new Date().toISOString() };
    }
    return run;
}
