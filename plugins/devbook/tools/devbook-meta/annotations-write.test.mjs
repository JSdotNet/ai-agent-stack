// Exercises the four write operations against a throwaway fixture repository:
// where `add` lands a note, that `reply` and `resolve` splice into the fence
// already there rather than reserializing it, and that a swept note leaves no
// trace behind. Every case re-lints the written file, because a writer that
// produces something `--check` rejects is the failure that matters.
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { add, reply, resolve, list } from "./annotations.mjs";
import { validateDocument } from "./metadata.mjs";

const FENCE = "```";
const REL = ".arc42/05-building-block-view.md";
const ADDRESS = `${REL}#devbook-meta`;

const SOURCE = [
    "# Building Block View",
    "",
    FENCE + "meta",
    "status: draft",
    FENCE,
    "",
    "## Devbook Meta",
    "",
    FENCE + "meta",
    "status: draft",
    FENCE,
    "",
    "The outline is one indexed range read.",
    "",
    FENCE + "annotation",
    "kind: question",
    "author: jobsc",
    "date: 2026-09-02",
    "quote: one indexed range read",
    "body: An existing thread.",
    "ext:",
    "  backlog:",
    "    entry: 8f31c2",
    FENCE,
    "",
].join("\n");

let failed = 0;
const check = (ok, name, detail) => {
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `\n        ${detail}`}`);
};

async function fixture() {
    const root = await mkdtemp(path.join(tmpdir(), "devbook-annotations-"));
    await mkdir(path.join(root, ".arc42"), { recursive: true });
    await writeFile(path.join(root, REL), SOURCE, "utf8");
    return root;
}

async function lint(root) {
    const markdown = await readFile(path.join(root, REL), "utf8");
    return validateDocument(REL, markdown).filter((issue) => issue.severity === "error");
}

async function run(name, body) {
    const root = await fixture();
    try {
        await body(root);
        const errors = await lint(root);
        check(errors.length === 0, `${name}: the written file still lints clean`, errors.map((e) => e.message).join(" | "));
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

await run("add --after", async (root) => {
    await add(root, ADDRESS, {
        after: "one indexed range read",
        author: "claude",
        date: "2026-09-03",
        body: "A second thread on the same passage.",
    });
    const threads = await list(root, ADDRESS);
    check(threads.length === 2, "add --after: the chapter now has two threads", String(threads.length));
    check(
        threads[1].body === "A second thread on the same passage.",
        "add --after: it lands under the notes already on that block, not above them",
        threads[1].body
    );
    check(threads[1].target === "block", "add --after: it annotates the passage", threads[1].target);
});

await run("add chapter-level", async (root) => {
    await add(root, ADDRESS, { author: "jobsc", date: "2026-09-03", body: "Whole-chapter note." });
    const threads = await list(root, ADDRESS);
    check(threads[0].target === "chapter", "add: with no --after it annotates the chapter", threads[0].target);
    check(threads[0].index === 1, "add: chapter-level lands first in document order", String(threads[0].index));
});

await run("add --after with no match", async (root) => {
    let threw = false;
    try {
        await add(root, ADDRESS, { after: "a phrase that is not there", author: "a", body: "b" });
    } catch {
        threw = true;
    }
    check(threw, "add: an unmatched --after refuses rather than guessing a position");
});

await run("reply", async (root) => {
    await reply(root, ADDRESS, 1, { author: "claude", date: "2026-09-03", body: "An answer." });
    const [thread] = await list(root, ADDRESS);
    check(thread.replies?.length === 1, "reply: the thread gained one reply", JSON.stringify(thread.replies));
    check(
        thread.ext?.backlog?.entry === "8f31c2",
        "reply: splicing left the ext namespace untouched",
        JSON.stringify(thread.ext)
    );
    const markdown = await readFile(path.join(root, REL), "utf8");
    check(
        markdown.indexOf("replies:") < markdown.indexOf("ext:"),
        "reply: a new replies list goes above ext, not after it"
    );
});

await run("reply twice", async (root) => {
    await reply(root, ADDRESS, 1, { author: "a", date: "2026-09-03", body: "First." });
    await reply(root, ADDRESS, 1, { author: "b", date: "2026-09-03", body: "Second." });
    const [thread] = await list(root, ADDRESS);
    check(
        thread.replies?.length === 2 && thread.replies[1].body === "Second.",
        "reply: a second reply appends to the existing list in order",
        JSON.stringify(thread.replies)
    );
});

await run("reply with a multi-line body", async (root) => {
    await reply(root, ADDRESS, 1, { author: "a", date: "2026-09-03", body: "One.\nTwo." });
    const [thread] = await list(root, ADDRESS);
    check(
        thread.replies?.[0].body === "One.\nTwo.",
        "reply: a multi-line reply body round-trips as a block scalar",
        JSON.stringify(thread.replies?.[0].body)
    );
});

await run("resolve", async (root) => {
    await resolve(root, ADDRESS, 1);
    const [thread] = await list(root, ADDRESS);
    check(thread.status === "resolved", "resolve: the thread is resolved", thread.status);
    check(thread.kind === "question", "resolve: it left every other field alone", thread.kind);
    const open = await list(root, ADDRESS, { status: "open" });
    check(open.length === 0, "resolve: it drops out of the open list", String(open.length));
});

await run("resolve --delete", async (root) => {
    await resolve(root, ADDRESS, 1, { delete: true });
    const threads = await list(root, ADDRESS);
    check(threads.length === 0, "sweep: the note is gone", String(threads.length));
    const markdown = await readFile(path.join(root, REL), "utf8");
    check(!markdown.includes("annotation"), "sweep: no fence left behind");
    check(
        markdown.trimEnd().endsWith("The outline is one indexed range read."),
        "sweep: it took the blank line that separated the note from its passage",
        JSON.stringify(markdown.slice(-60))
    );
});

await run("resolve a missing index", async (root) => {
    let threw = false;
    try {
        await resolve(root, ADDRESS, 9);
    } catch {
        threw = true;
    }
    check(threw, "resolve: an index that is not there refuses rather than editing something else");
});

console.log(failed ? `\n${failed} case(s) failed.` : "\nAll cases passed.");
process.exit(failed ? 1 : 0);
