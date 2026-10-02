// Exercises a demo delta: a `*.demo.html` under a change's `devbook-delta/` is
// the one non-Markdown file allowed there. `--check` runs demo.mjs's rules
// over it, `--apply` replaces the target whole, the change's fingerprint
// covers it, and the graph does not index it. Any other file is an error.
//
// Run: `node demo-delta.test.mjs`
import { mkdtemp, mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { CHANGES_ROOT } from "./metadata.mjs";
import { buildGraph } from "./graph.mjs";
import { applyChange, changeFingerprint, checkChange } from "./delta.mjs";
import { DEMO_SIZE_TARGET, demoFileIssues, isDemoPath } from "./demo.mjs";

let failed = 0;
const check = (ok, name, detail) => {
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `\n        ${detail}`}`);
};
const errorsOf = (issues) => issues.filter((i) => i.severity === "error");
const fence = (body) => "```meta\n" + body + "```\n";
const exists = async (p) => stat(p).then(() => true, () => false);

const demo = ({ head = "", app = "<section data-screen=\"cart\" id=\"cart\"><p>Cart</p></section>", region = true, meta = { question: "Does checkout fit one screen?" }, model = { screens: ["cart"] } } = {}) =>
    `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${head}` +
    (region ? `<!-- template:begin hash=sha256:abcd1234 -->\n<style>body{margin:0}</style>\n<script>window.addEventListener("message",()=>{});</script>\n<!-- template:end -->\n` : "") +
    `</head>\n<body>\n<main data-demo-app>${app}</main>\n` +
    (model ? `<script type="application/json" id="demo-model">${JSON.stringify(model)}</script>\n` : "") +
    (meta ? `<script type="application/json" id="demo-meta">${JSON.stringify(meta)}</script>\n` : "") +
    `</body>\n</html>\n`;

const AT = ".devbook/domain/ordering/features.demo.html";
const has = (issues, pattern) => errorsOf(issues).some((i) => pattern.test(i.message));

// -- The demo rules ---------------------------------------------------------

check(isDemoPath(".devbook/domain/ordering/demo.html"), "a context's demo.html is a demo path");
check(isDemoPath(AT), "a page-named demo is a demo path");
check(!isDemoPath(".devbook/design/features.demo.html"), "a demo outside domain/ is not a demo path");
check(!isDemoPath(".devbook/domain/ordering/sub/features.demo.html"), "a demo below a context folder is not a demo path");

check(!errorsOf(demoFileIssues(AT, demo())).length, "a demo on the template passes", JSON.stringify(demoFileIssues(AT, demo())));
check(has(demoFileIssues(".devbook/design/x.demo.html", demo()), /not where a demo lives/), "a demo landing outside domain/<context>/ is an error");
check(has(demoFileIssues(AT, "<p>not a document</p>"), /not an HTML document/), "a fragment is not a demo");
check(has(demoFileIssues(AT, demo({ region: false })), /no template managed region/), "a demo with no managed region is an error");
check(
    has(demoFileIssues(AT, demo({ app: "<script>alert(1)</script>" })), /outside the template's managed region/),
    "a script outside the managed region is an error"
);
check(
    !has(demoFileIssues(AT, demo()), /outside the template's managed region/),
    "the template's own script and demo-model and demo-meta are allowed"
);
for (const [what, head] of [
    ["a script src", `<script src="https://cdn.example/x.js"></script>`],
    ["a stylesheet link", `<link rel="stylesheet" href="styles.css">`],
    ["a CSS url()", `<style>.a{background:url("https://x.test/a.png")}</style>`],
    ["an @import", `<style>@import "x.css";</style>`],
]) {
    check(has(demoFileIssues(AT, demo({ head })), /fetches/), `${what} is fetched, an error`);
}
check(has(demoFileIssues(AT, demo({ app: `<img src="photo.jpg" alt="">` })), /fetches/), "a relative image is fetched, an error");
check(
    !has(demoFileIssues(AT, demo({ app: `<img src="data:image/png;base64,AAAA" alt=""><svg><use href="#i"/><rect fill="url(#g)"/></svg><a href="https://x.test">x</a>` })), /fetches/),
    "a data: URI, a fragment, and a link a person follows are not fetched"
);
check(
    has(demoFileIssues(AT, demo({ region: false, head: `<!-- template:begin hash=x --><script>fetch("/api")</script><!-- template:end -->` })), /fetches fetch\(\)/),
    "a network call in a script is an error"
);
check(has(demoFileIssues(AT, demo({ model: null })), /no `<script type="application\/json" id="demo-model">`/), "a demo with no demo-model is an error");
check(has(demoFileIssues(AT, demo().replace(/(id="demo-model">)[^<]*/, "$1{not json")), /demo-model` that is not JSON/), "a demo-model that is not JSON is an error");
check(has(demoFileIssues(AT, demo({ meta: null })), /no `<script type="application\/json" id="demo-meta">`/), "a demo with no demo-meta is an error");
check(has(demoFileIssues(AT, demo({ meta: { question: " " } })), /no `question`/), "a demo-meta with no question is an error");
check(
    has(demoFileIssues(AT, demo({ meta: { question: "Q?", status: "approved", verdict: "yes" } })), /`status`, `verdict` in its `demo-meta`/),
    "a demo-meta naming a status or verdict is an error"
);
check(
    has(demoFileIssues(AT, demo({ head: `<!-- template:begin hash=x --><!-- template:end -->` })), /more than one template managed region/),
    "a demo with two managed regions is an error"
);
{
    // The shipped sample demo, built on the real template, whose script names the marker in a regex.
    const sample = new URL("../../../devbook-procedures/assets/demo-sample/features.demo.html", import.meta.url);
    const html = await readFile(sample, "utf8").catch(() => null);
    if (html !== null) check(!errorsOf(demoFileIssues(AT, html)).length, "the sample demo on the shipped template passes the demo rules", JSON.stringify(demoFileIssues(AT, html)));
}
{
    const big = demo({ app: `<p>${"x".repeat(DEMO_SIZE_TARGET)}</p>` });
    const issues = demoFileIssues(AT, big);
    check(issues.some((i) => i.severity === "warning" && /over the 500 KB/.test(i.message)) && !errorsOf(issues).length, "a demo over 500 KB is a warning, never an error");
}

// -- The fixture ------------------------------------------------------------

const FEATURES = ".devbook/domain/ordering/features.md";
const BASE = `${CHANGES_ROOT}/show-checkout`;
const proposal =
    `# Show checkout\n\n${fence("type: change\nstatus: proposed\ncategory: feature\n")}\n` +
    `## Why\n\nCheckout was agreed on a screen.\n\n## Scope\n\nThe checkout screen.\n\n## Chapters touched\n\n- ${FEATURES}\n`;
const placeholder = fence("change: show-checkout\ndelta: modified\n");

async function fixture(extra = {}) {
    const root = await mkdtemp(path.join(tmpdir(), "devbook-demo-delta-"));
    const files = {
        [FEATURES]: `# Features\n\n${fence("")}\nWhat ordering does.\n`,
        [AT]: demo({ app: "<section data-screen=\"old\" id=\"old\"></section>" }),
        [`${BASE}/proposal.md`]: proposal,
        [`${BASE}/devbook-delta/domain/ordering/features.md`]: placeholder,
        [`${BASE}/devbook-delta/domain/ordering/features.demo.html`]: demo(),
        ...extra,
    };
    for (const [rel, text] of Object.entries(files)) {
        if (text === null) continue;
        await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
        await writeFile(path.join(root, rel), text, "utf8");
    }
    return root;
}

async function decide(root) {
    const hash = await changeFingerprint(root, "show-checkout");
    const at = path.join(root, `${BASE}/proposal.md`);
    const block =
        `status: accepted\napproved-by: @amy\napproved-at: 2026-09-20\napproved-hash: ${hash}\n` +
        `accepted-by: @sam\naccepted-at: 2026-09-27\naccepted-hash: ${hash}\n`;
    await writeFile(at, (await readFile(at, "utf8")).replace("status: proposed\n", block), "utf8");
    return hash;
}

// -- --check ----------------------------------------------------------------

{
    const root = await fixture();
    const report = await checkChange(root, "show-checkout");
    const entry = report.deltas.find((d) => d.path.endsWith(".demo.html"));
    check(!!entry && entry.target === AT, "--check resolves a demo delta to the file it lands as");
    check(!errorsOf([...report.problems, ...report.deltas.flatMap((d) => d.issues)]).length, "--check passes a change carrying a valid demo", JSON.stringify(report.problems));
}
{
    const root = await fixture({ [`${BASE}/devbook-delta/domain/ordering/features.demo.html`]: demo({ app: "<script>x()</script>" }) });
    const report = await checkChange(root, "show-checkout");
    check(report.deltas.some((d) => d.path.endsWith(".demo.html") && has(d.issues, /outside the template's managed region/)), "--check runs the demo rules over a demo delta");
}
{
    const root = await fixture({ [`${BASE}/devbook-delta/design/checkout.demo.html`]: demo() });
    const report = await checkChange(root, "show-checkout");
    check(report.deltas.some((d) => d.path.includes("/design/") && has(d.issues, /not where a demo lives/)), "--check refuses a demo delta that lands outside domain/");
}
{
    const root = await fixture({ [`${BASE}/devbook-delta/domain/ordering/sketch.png`]: "png" });
    const report = await checkChange(root, "show-checkout");
    check(has(report.problems, /sketch\.png is neither a Markdown delta nor a `\*\.demo\.html`/), "--check refuses any other non-Markdown file under devbook-delta/");
}
{
    const root = await fixture({ [`${BASE}/devbook-delta/domain/ordering/features.md`]: null });
    const report = await checkChange(root, "show-checkout");
    check(has(report.problems, /has no delta under devbook-delta/), "a demo alone does not stand in for the placeholder delta");
}

// -- The fingerprint and the graph -------------------------------------------

{
    const root = await fixture();
    const before = await changeFingerprint(root, "show-checkout");
    await writeFile(path.join(root, `${BASE}/devbook-delta/domain/ordering/features.demo.html`), demo({ meta: { question: "Another?" } }), "utf8");
    check((await changeFingerprint(root, "show-checkout")) !== before, "the change's fingerprint covers its demo, so editing it lapses the decision");
}
{
    const root = await fixture();
    const graph = await buildGraph(root);
    const ids = graph.nodes.map((n) => n.id);
    check(!ids.some((id) => id.endsWith(".demo.html")), "the graph does not index a demo delta");
    const changeErrors = errorsOf(graph.problems).filter((p) => String(p.path).startsWith(CHANGES_ROOT));
    check(!changeErrors.length, "a change carrying a demo indexes with no error", JSON.stringify(changeErrors));
}

// -- --apply ----------------------------------------------------------------

{
    const root = await fixture();
    await decide(root);
    const result = await applyChange(root, "show-checkout", { date: "2026-09-28" });
    check(result.applied, "--apply merges an accepted change carrying a demo", JSON.stringify(result.report.problems));
    check((await readFile(path.join(root, AT), "utf8")) === demo(), "--apply replaces the target demo whole, byte for byte");
    check(result.written.includes(`replaced ${AT}`), "--apply reports the demo as replaced");
    check(await exists(path.join(root, `${CHANGES_ROOT}/archive/2026-09-28-show-checkout/devbook-delta/domain/ordering/features.demo.html`)), "the demo moves to archive/ with its change");
}
{
    const root = await fixture({ [AT]: null });
    await decide(root);
    const result = await applyChange(root, "show-checkout", { date: "2026-09-28", move: false });
    check(result.applied && (await readFile(path.join(root, AT), "utf8")) === demo(), "--apply creates a demo the target folder did not have");
}
{
    const root = await fixture();
    await decide(root);
    await writeFile(path.join(root, `${BASE}/devbook-delta/domain/ordering/features.demo.html`), demo({ meta: { question: "Edited after?" } }), "utf8");
    const result = await applyChange(root, "show-checkout", { date: "2026-09-28" });
    check(!result.applied, "--apply refuses a change whose demo was edited after the decision");
}

console.log(failed ? `\n${failed} case(s) failed.` : "\nAll cases passed.");
process.exit(failed ? 1 : 0);
