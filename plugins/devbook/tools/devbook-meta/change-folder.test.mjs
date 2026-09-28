// Exercises the change folder: `openspec/changes/<name>/` as a folder kind the
// graph build indexes, `proposal.md` as a `type: change` file, and the delta
// merge in delta.mjs — `--check` resolving every delta to a target file and
// heading, `--apply` merging heading by heading one level up, stamping
// `change` on every chapter it touched, and moving the folder to `archive/`.
//
// One fixture change is written to a temporary repository and run through
// both, then broken one way at a time.
//
// Run: `node change-folder.test.mjs`
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { changePathParts, folderKindForPath, validateDocument, CHANGES_ROOT } from "./metadata.mjs";
import { buildGraph, discoverLayout } from "./graph.mjs";
import { applyChange, checkChange, mergeDelta, parseDelta } from "./delta.mjs";

let failed = 0;
const check = (ok, name, detail) => {
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `\n        ${detail}`}`);
};
const errorsOf = (issues) => issues.filter((i) => i.severity === "error");
const fence = (body) => "```meta\n" + body + "```\n";
const exists = async (p) => stat(p).then(() => true, () => false);

// -- Paths ------------------------------------------------------------------

check(folderKindForPath(`${CHANGES_ROOT}/add-cache/proposal.md`) === "changes", "a proposal is in the change folder");
check(
    changePathParts(`${CHANGES_ROOT}/add-cache/devbook-delta/arc42/09-decisions.md`)?.target === ".devbook/arc42/09-decisions.md",
    "a delta's target is its path under devbook-delta/, re-rooted at .devbook/"
);
check(folderKindForPath(`${CHANGES_ROOT}/archive/2026-09-01-old/proposal.md`) === null, "archive/ is outside every folder kind");
check(folderKindForPath(".devbook/.changes/x/proposal.md") === null, "a dotted folder under .devbook/ is not the change folder");

// -- The fixture ------------------------------------------------------------

const DECISIONS = ".devbook/arc42/09-decisions.md";
const decisions =
    `# Decisions\n\n${fence("")}\n` +
    `## Caching\n\n${fence("status: proposed\n")}\nUse a cache.\n\n` +
    `### Consequences\n\n${fence("")}\nReads get faster.\n\n` +
    `### Open questions\n\n${fence("")}\nWhich cache?\n\n` +
    `## Logging\n\n${fence("")}\nLog everything.\n`;

const proposal =
    `# Add a cache\n\n${fence("type: change\nstatus: proposed\ncategory: feature\n")}\n` +
    `## Why\n\nReads are slow.\n\n## Scope\n\nThe read path.\n\n## Chapters touched\n\n- ${DECISIONS}#caching\n`;

const modified =
    fence("change: add-cache\ndelta: modified\n") +
    `\n## Caching\n\n### MODIFIED\n\n${fence(`related: ["${DECISIONS}#logging"]\n`)}\n` +
    `#### Consequences\n\n${fence("")}\nReads get faster; writes invalidate.\n\n` +
    "```text\n# not a heading\n```\n\n" +
    `### ADDED\n\n#### Invalidation\n\n${fence("")}\nWrites evict the key.\n\n` +
    `### REMOVED\n\n#### Open questions\n`;

const added =
    fence("change: add-cache\ndelta: added\n") +
    `\n# Quality\n\n${fence("")}\nHow good it has to be.\n\n## ADDED\n\n### Latency\n\n${fence("")}\nA read answers in 50 ms.\n`;

async function fixture(extra = {}) {
    const root = await mkdtemp(path.join(tmpdir(), "devbook-change-"));
    const files = {
        [DECISIONS]: decisions,
        [`${CHANGES_ROOT}/add-cache/proposal.md`]: proposal,
        [`${CHANGES_ROOT}/add-cache/solution.md`]: "# Solution\n\nLoad the ADR on storage.\n",
        [`${CHANGES_ROOT}/add-cache/tasks.md`]: "# Tasks\n\n## Step 1 — Cache reads\n\ndelivers: devbook-delta/arc42/09-decisions.md#caching\n",
        [`${CHANGES_ROOT}/add-cache/devbook-delta/arc42/09-decisions.md`]: modified,
        [`${CHANGES_ROOT}/add-cache/devbook-delta/arc42/10-quality.md`]: added,
        [`${CHANGES_ROOT}/archive/2026-09-01-old/proposal.md`]: "# broken, and never read\n",
        ...extra,
    };
    for (const [rel, text] of Object.entries(files)) {
        await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
        await writeFile(path.join(root, rel), text, "utf8");
    }
    return root;
}

// -- The generator indexes it ------------------------------------------------

{
    const root = await fixture();
    const layout = await discoverLayout(root);
    check(layout.changes === CHANGES_ROOT, "the change folder is discovered by existing");
    const graph = await buildGraph(root);
    const ids = new Set(graph.nodes.map((n) => n.id));
    const proposalNode = graph.nodes.find((n) => n.id === `${CHANGES_ROOT}/add-cache/proposal.md`);
    check(proposalNode?.kind === "change" && proposalNode.folder === "changes" && proposalNode.category === "feature", "the proposal is indexed as a `change`", JSON.stringify(proposalNode));
    const deltaNode = graph.nodes.find((n) => n.id === `${CHANGES_ROOT}/add-cache/devbook-delta/arc42/09-decisions.md`);
    check(deltaNode?.delta === "modified" && deltaNode.target === DECISIONS && deltaNode.change === "add-cache", "a delta is indexed with its kind and target", JSON.stringify(deltaNode));
    check(![...ids].some((id) => id.includes("solution.md") || id.includes("tasks.md")), "solution.md and tasks.md are not indexed");
    check(![...ids].some((id) => id.includes("/archive/")), "archive/ is never indexed");
    check(errorsOf(graph.problems).length === 0, "the fixture change indexes with no error", JSON.stringify(errorsOf(graph.problems)));
    await rm(root, { recursive: true, force: true });
}

// -- --check and --apply -----------------------------------------------------

{
    const root = await fixture();
    const report = await checkChange(root, "add-cache");
    const all = [...report.problems, ...report.deltas.flatMap((d) => d.issues)];
    check(report.deltas.length === 2 && errorsOf(all).length === 0, "--check resolves every delta of the fixture", JSON.stringify(errorsOf(all)));

    const result = await applyChange(root, "add-cache", { date: "2026-09-28" });
    check(result.applied, "--apply merges the fixture", JSON.stringify(errorsOf([...result.report.problems, ...result.report.deltas.flatMap((d) => d.issues)])));
    const merged = await readFile(path.join(root, DECISIONS), "utf8");
    check(merged.includes("### Consequences") && merged.includes("writes invalidate") && !merged.includes("Reads get faster.\n"), "a MODIFIED entry replaces its section whole, one level up");
    check(merged.includes("```text\n# not a heading\n```"), "a `#` line inside fenced code is carried, not raised");
    check(/### Invalidation\n\n```meta\nchange: add-cache\n```/.test(merged), "an ADDED entry lands one level up, stamped with its change", merged);
    check(!merged.includes("Open questions"), "a REMOVED entry is gone, by heading");
    check(/## Caching\n\n```meta\nstatus: proposed\nrelated: \[".devbook\/arc42\/09-decisions.md#logging"\]\nchange: add-cache\n```/.test(merged), "MODIFIED fields are set, others kept, and the chapter carries `change`", merged);
    check(merged.indexOf("### Invalidation") < merged.indexOf("## Logging"), "an ADDED entry lands inside its chapter, before the next one");
    check(/## Logging\n\n```meta\n```/.test(merged), "an untouched chapter is not stamped");
    check(errorsOf(validateDocument(DECISIONS, merged)).length === 0, "the merged chapter validates");

    const quality = await readFile(path.join(root, ".devbook/arc42/10-quality.md"), "utf8");
    check(quality.startsWith("# Quality\n\n```meta\nchange: add-cache\n```") && quality.includes("## Latency"), "an added file is created, its entries one level up", quality);

    check(await exists(path.join(root, CHANGES_ROOT, "archive/2026-09-28-add-cache/proposal.md")), "the change folder moves to archive/<date>-<name>/");
    check(!(await exists(path.join(root, CHANGES_ROOT, "add-cache"))), "nothing of the change is left open");
    const after = await buildGraph(root);
    check(errorsOf(after.problems).length === 0, "the repository indexes clean after the merge", JSON.stringify(errorsOf(after.problems)));
    await rm(root, { recursive: true, force: true });
}

// -- What --check refuses ----------------------------------------------------

const refusals = [
    {
        name: "a delta naming a chapter the target lacks",
        delta: fence("change: add-cache\ndelta: modified\n") + "\n## Storage\n\n### ADDED\n\n#### Tier\n\nHot and cold.\n",
        expect: /no level-2 heading/,
    },
    {
        name: "a section that is not ADDED, MODIFIED, or REMOVED",
        delta: fence("change: add-cache\ndelta: modified\n") + "\n## Caching\n\n### CHANGED\n\n#### Consequences\n\nNone.\n",
        expect: /is not one of ADDED, MODIFIED, REMOVED/,
    },
    {
        name: "a header naming another change",
        delta: fence("change: other\ndelta: modified\n") + "\n## Caching\n\n### REMOVED\n\n#### Open questions\n",
        expect: /sits in the change folder `add-cache`/,
    },
    {
        name: "a header carrying a status",
        delta: fence("change: add-cache\ndelta: modified\nstatus: proposed\n") + "\n## Caching\n\n### REMOVED\n\n#### Open questions\n",
        expect: /holds only `change` and `delta`/,
    },
    {
        name: "adding a chapter the target already has",
        delta: fence("change: add-cache\ndelta: added\n") + "\n## Caching\n\nAgain.\n",
        expect: /already has/,
    },
    {
        name: "replacing a section the chapter lacks",
        delta: fence("change: add-cache\ndelta: modified\n") + "\n## Caching\n\n### MODIFIED\n\n#### Risks\n\nNone.\n",
        expect: /no such section — use ADDED/,
    },
    {
        name: "a merge that would leave the target invalid",
        delta: fence("change: add-cache\ndelta: modified\n") + "\n## Caching\n\n### MODIFIED\n\n" + fence("status: approved\n"),
        expect: /would leave .* invalid/,
    },
];
for (const c of refusals) {
    const root = await fixture({ [`${CHANGES_ROOT}/add-cache/devbook-delta/arc42/09-decisions.md`]: c.delta });
    const report = await checkChange(root, "add-cache");
    const messages = errorsOf(report.deltas.flatMap((d) => d.issues)).map((i) => i.message);
    check(messages.some((m) => c.expect.test(m)), `--check refuses ${c.name}`, JSON.stringify(messages));
    const result = await applyChange(root, "add-cache", { date: "2026-09-28" });
    check(!result.applied && (await readFile(path.join(root, DECISIONS), "utf8")) === decisions, `--apply writes nothing for ${c.name}`);
    await rm(root, { recursive: true, force: true });
}

{
    const root = await fixture();
    await rm(path.join(root, CHANGES_ROOT, "add-cache/devbook-delta"), { recursive: true });
    const report = await checkChange(root, "add-cache");
    check(errorsOf(report.problems).some((i) => /no delta/.test(i.message)), "--check refuses a change with no delta at all");
    await rm(root, { recursive: true, force: true });
}

// -- Merge shapes, in memory ---------------------------------------------------

{
    const run = (delta, original) => mergeDelta(parseDelta(delta), original, "add-cache");
    const addedChapter = run(fence("change: add-cache\ndelta: added\n") + `\n## Metrics\n\n${fence("")}\nCount hits.\n`, decisions);
    check(addedChapter.issues.length === 0 && addedChapter.merged.trimEnd().endsWith("## Metrics\n\n```meta\nchange: add-cache\n```\n\nCount hits."), "an added `##` chapter lands at the end of its file, stamped", addedChapter.merged);
    const removed = run(fence("change: add-cache\ndelta: removed\n") + "\n## Logging\n", decisions);
    check(removed.issues.length === 0 && !removed.merged.includes("## Logging") && removed.merged.includes("## Caching"), "a removed chapter goes whole, its siblings stay");
    const removedFile = run(fence("change: add-cache\ndelta: removed\n") + "\n# Decisions\n", decisions);
    check(removedFile.issues.length === 0 && removedFile.merged === null, "removing the `#` chapter removes the file");
    const deep = run(fence("change: add-cache\ndelta: added\n") + "\n### Orphan\n\nNo parent.\n", decisions);
    check(errorsOf(deep.issues).some((i) => /no parent/.test(i.message)), "an added chapter below `##` is refused: it is an ADDED entry of its parent");
    const placeholder = run(fence("change: add-cache\ndelta: modified\n"), decisions);
    check(placeholder.placeholder && placeholder.merged === decisions, "a delta naming no chapter is a placeholder and merges nothing");
}

// -- The proposal ------------------------------------------------------------

{
    const at = `${CHANGES_ROOT}/add-cache/proposal.md`;
    check(errorsOf(validateDocument(at, proposal)).length === 0, "the fixture proposal validates");
    const noCategory = proposal.replace("category: feature\n", "");
    check(errorsOf(validateDocument(at, noCategory)).some((i) => /missing required `category`/.test(i.message)), "a proposal names its category");
    const badCategory = proposal.replace("category: feature", "category: chore");
    check(errorsOf(validateDocument(at, badCategory)).some((i) => /`category` "chore"/.test(i.message)), "the category is one of three");
    const approved = proposal.replace("status: proposed", "status: approved");
    check(errorsOf(validateDocument(at, approved)).length === 1, "`proposed` is the only rung a proposal holds here");
    const wrongType = proposal.replace("type: change", "type: feature");
    check(errorsOf(validateDocument(at, wrongType)).length === 1, "a proposal is `type: change`");
    check(errorsOf(validateDocument(DECISIONS, decisions.replace("status: proposed", "status: proposed\nchange: Add Cache"))).length === 1, "`change` on a chapter is one change name");
}

console.log(failed ? `\n${failed} case(s) failed.` : "\nAll cases passed.");
process.exit(failed ? 1 : 0);
