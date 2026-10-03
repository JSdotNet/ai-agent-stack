// demo-template.test.mjs — every demo's managed region against the repository's
// template: current, stale, and hand-edited under --check, and --refresh
// rewriting the region and nothing else.
//
// Each case writes a small repository to a temporary folder, holding the
// starting template devbook-procedures ships and the sample demo built on it.
//
// Run: node --test plugins/devbook/tools/devbook-meta/demo-template.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TEMPLATE_PATH, readRegion, refreshDemos, regionHash, templateProblems } from "./demo-template.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
// The vendored copy under .devbook/_tools/ runs these tests too, and finds the
// assets through the repository root either way.
const repoRootOf = (dir) => {
    for (let at = dir; ; at = path.dirname(at)) {
        try {
            readFileSync(path.join(at, "plugins/devbook-procedures/assets/demo-template.html"));
            return at;
        } catch {
            if (path.dirname(at) === at) throw new Error("no plugins/devbook-procedures above this test");
        }
    }
};
const assets = path.join(repoRootOf(here), "plugins/devbook-procedures/assets");
const asset = (rel) => readFileSync(path.join(assets, rel), "utf8").replace(/\r\n/g, "\n");
const TEMPLATE = asset("demo-template.html");
const SAMPLE = asset("demo-sample/features.demo.html");

const CONTEXT = ".devbook/domain/ordering";
const DEMO = `${CONTEXT}/features.demo.html`;
const fence = (body) => "```meta\n" + body + "```\n";

/** The template with its region's text changed and its marker re-stamped: a later release. */
function laterTemplate(html = TEMPLATE) {
    const r = readRegion(html);
    const text = r.text.replace("<style>", "<style>\n  /* a later release */");
    const next = html.slice(0, r.start) + `<!-- template:begin hash=${regionHash(text)} -->` + text + "<!-- template:end -->" + html.slice(r.end);
    return next;
}

async function repo({ template = TEMPLATE, demo = SAMPLE } = {}) {
    const root = await mkdtemp(path.join(tmpdir(), "demo-template-"));
    const put = async (rel, text) => {
        await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
        await writeFile(path.join(root, rel), text, "utf8");
    };
    if (template != null) await put(TEMPLATE_PATH, template);
    await put(`${CONTEXT}/context.md`, `# Ordering\n\n${fence("type: context\n")}\nOrders.\n`);
    await put(`${CONTEXT}/features.md`, `# Features\n\n${fence("type: features\n")}\nWhat ordering offers.\n`);
    if (demo != null) await put(DEMO, demo);
    return { root, read: (rel) => readFile(path.join(root, rel), "utf8"), done: () => rm(root, { recursive: true, force: true }) };
}

const FOLDERS = [".devbook/domain", ".devbook/design"];

test("the shipped template is stamped with its own region's hash, and the sample is current against it", async () => {
    const r = readRegion(TEMPLATE);
    assert.equal(r.declared, r.hash);
    const t = await repo();
    try {
        assert.deepEqual(await templateProblems(t.root, FOLDERS), []);
    } finally {
        await t.done();
    }
});

test("a demo on an earlier template version is stale, as a warning", async () => {
    const t = await repo({ template: laterTemplate() });
    try {
        const problems = await templateProblems(t.root, FOLDERS);
        assert.equal(problems.length, 1);
        assert.equal(problems[0].severity, "warning");
        assert.equal(problems[0].path, DEMO);
        assert.match(problems[0].message, /earlier template version/);
    } finally {
        await t.done();
    }
});

test("a demo whose region matches no version is hand-edited, as an error, with or without a template", async () => {
    const edited = SAMPLE.replace("<style>", "<style>\n  body { color: red; }");
    for (const template of [TEMPLATE, laterTemplate(), null]) {
        const t = await repo({ template, demo: edited });
        try {
            const problems = await templateProblems(t.root, FOLDERS);
            const errors = problems.filter((p) => p.severity === "error");
            assert.equal(errors.length, 1, JSON.stringify(problems));
            assert.equal(errors[0].path, DEMO);
            assert.match(errors[0].message, /matching no template version/);
        } finally {
            await t.done();
        }
    }
});

test("a demo with no hash on its marker, or no region at all, is an error", async () => {
    const unstamped = SAMPLE.replace(/<!-- template:begin hash=\S+ -->/, "<!-- template:begin -->");
    const bare = SAMPLE.replace(/<!-- template:begin hash=\S+ -->/, "").replace("<!-- template:end -->", "");
    for (const [demo, pattern] of [[unstamped, /missing hash/], [bare, /no `<!-- template:begin/]]) {
        const t = await repo({ demo });
        try {
            const problems = await templateProblems(t.root, FOLDERS);
            assert.equal(problems.length, 1);
            assert.equal(problems[0].severity, "error");
            assert.match(problems[0].message, pattern);
        } finally {
            await t.done();
        }
    }
});

test("a template whose marker lags its region is an error, and staleness is not judged against it", async () => {
    const lagging = TEMPLATE.replace("<style>", "<style>\n  /* edited through flow-spec */");
    const t = await repo({ template: lagging });
    try {
        const problems = await templateProblems(t.root, FOLDERS);
        assert.equal(problems.length, 1);
        assert.equal(problems[0].path, TEMPLATE_PATH);
        assert.equal(problems[0].severity, "error");
        assert.match(problems[0].message, /--refresh to re-stamp/);
    } finally {
        await t.done();
    }
});

test("demos with no template are a warning, and no demos with no template are nothing", async () => {
    let t = await repo({ template: null });
    try {
        const problems = await templateProblems(t.root, FOLDERS);
        assert.equal(problems.length, 1);
        assert.equal(problems[0].severity, "warning");
        assert.match(problems[0].message, /checked for hand edits only/);
    } finally {
        await t.done();
    }
    t = await repo({ template: null, demo: null });
    try {
        assert.deepEqual(await templateProblems(t.root, FOLDERS), []);
    } finally {
        await t.done();
    }
});

test("--refresh rewrites a stale or hand-edited region and leaves the demo's own parts byte for byte", async () => {
    const later = laterTemplate();
    const outside = (html) => {
        const r = readRegion(html);
        return html.slice(0, r.start) + html.slice(r.end);
    };
    for (const demo of [SAMPLE, SAMPLE.replace("<style>", "<style>\n  body { color: red; }")]) {
        const t = await repo({ template: later, demo });
        try {
            const result = await refreshDemos(t.root, FOLDERS);
            assert.deepEqual(result.written, [DEMO]);
            const next = await t.read(DEMO);
            assert.equal(readRegion(next).text, readRegion(later).text);
            assert.equal(readRegion(next).declared, readRegion(later).hash);
            assert.equal(outside(next), outside(demo));
            assert.deepEqual(await templateProblems(t.root, FOLDERS), []);
            const again = await refreshDemos(t.root, FOLDERS);
            assert.deepEqual([again.written, again.unchanged], [[], [DEMO]]);
        } finally {
            await t.done();
        }
    }
});

test("--refresh re-stamps a lagging template first, and keeps a CRLF demo's line endings", async () => {
    const lagging = TEMPLATE.replace("<style>", "<style>\n  /* edited through flow-spec */");
    const crlf = SAMPLE.replace(/\n/g, "\r\n");
    const t = await repo({ template: lagging, demo: crlf });
    try {
        const result = await refreshDemos(t.root, FOLDERS);
        assert.equal(result.stamped, true);
        const template = await t.read(TEMPLATE_PATH);
        const r = readRegion(template);
        assert.equal(r.declared, r.hash);
        const demo = await t.read(DEMO);
        assert.doesNotMatch(demo.replace(/\r\n/g, ""), /\n/);
        assert.equal(readRegion(demo).declared, r.hash);
        assert.deepEqual(await templateProblems(t.root, FOLDERS), []);
    } finally {
        await t.done();
    }
});

test("--refresh skips a demo with no region, and refuses with no template", async () => {
    const bare = SAMPLE.replace(/<!-- template:begin hash=\S+ -->/, "").replace("<!-- template:end -->", "");
    let t = await repo({ demo: bare });
    try {
        const result = await refreshDemos(t.root, FOLDERS);
        assert.deepEqual(result.written, []);
        assert.equal(result.skipped.length, 1);
        assert.equal(await t.read(DEMO), bare);
    } finally {
        await t.done();
    }
    t = await repo({ template: null });
    try {
        await assert.rejects(refreshDemos(t.root, FOLDERS), /does not exist/);
    } finally {
        await t.done();
    }
});

test("build.mjs --check fails on a hand-edited region and passes on a stale one", async () => {
    const run = (root) => spawnSync(process.execPath, [path.join(here, "build.mjs"), "--check", "--root", root], { encoding: "utf8" });
    let t = await repo({ demo: SAMPLE.replace("<style>", "<style>\n  body { color: red; }") });
    try {
        const result = run(t.root);
        assert.equal(result.status, 1, result.stdout + result.stderr);
        assert.match(result.stdout, /\[error\] .*matching no template version/);
    } finally {
        await t.done();
    }
    t = await repo({ template: laterTemplate() });
    try {
        const result = run(t.root);
        assert.match(result.stdout, /\[warning\] .*earlier template version/);
        assert.doesNotMatch(result.stdout, /\[error\]/, result.stdout);
    } finally {
        await t.done();
    }
});
