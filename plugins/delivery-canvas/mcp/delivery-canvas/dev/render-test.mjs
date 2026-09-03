// Integration check for the render surface, driving the MCP server over stdio the way a
// host does: the declared tool surface, the two viewers, push/replace navigation, the
// history the Back button walks, and the pages themselves.
//
//   node dev/render-test.mjs

import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "mcp-server.mjs");
const proc = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
proc.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

let buffer = "";
let nextId = 1;
const pending = new Map();
proc.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        let msg;
        try {
            msg = JSON.parse(line);
        } catch {
            continue;
        }
        const waiter = pending.get(msg.id);
        if (waiter) {
            pending.delete(msg.id);
            waiter(msg);
        }
    }
});

function rpc(method, params) {
    const id = nextId++;
    return new Promise((resolve) => {
        pending.set(id, resolve);
        proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
}

async function call(name, args = {}) {
    const res = await rpc("tools/call", { name, arguments: args });
    const text = res.result?.content?.[0]?.text ?? "";
    if (res.result?.isError) throw new Error(text);
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// node:http with no keep-alive rather than fetch: every socket this check opens is closed
// when its response ends, so the process is free to exit the moment the checks are done.
function httpRequest(url, method = "GET") {
    return new Promise((resolve, reject) => {
        const req = http.request(url, { method, agent: false }, (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => resolve({ status: res.statusCode, body }));
        });
        req.on("error", reject);
        req.end();
    });
}

async function httpJson(url, method = "GET") {
    const res = await httpRequest(url, method);
    return JSON.parse(res.body);
}

let failures = 0;
function check(label, ok, detail = "") {
    if (!ok) failures++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

const init = await rpc("initialize", { protocolVersion: "2025-06-18" });
check("the server identifies itself", init.result.serverInfo.name === "delivery-canvas", init.result.serverInfo.name);

const names = (await rpc("tools/list")).result.tools.map((t) => t.name).sort();
check("it declares exactly the render capability", names.join(",") === "render_diagram,render_markdown", names.join(", "));

const resources = (await rpc("resources/list")).result.resources.map((r) => r.uri);
check("both viewers are offered as MCP App resources", resources.length === 2, resources.join(", "));

const first = await call("render_diagram", { title: "Flow", source: "graph TD; A-->B;" });
check("render_diagram renders and returns its viewer URL", /\/mermaid$/.test(first.url), first.url);
check("a first render starts with no history", first.historyDepth === 0);

const pushed = await call("render_diagram", { title: "Detail", source: "graph TD; B-->C;", mode: "push" });
check("push keeps the previous diagram", pushed.historyDepth === 1);
check("breadcrumbs follow the drill-down", pushed.view.breadcrumbs.join(" > ") === "Flow > Detail");

const replaced = await call("render_diagram", { title: "Detail v2", source: "graph TD; B-->D;" });
check("replace is the default and adds no history", replaced.historyDepth === 1);

const origin = first.url.replace(/mermaid$/, "");
const state = await httpJson(`${origin}mermaid/api/state`);
check("the page reads the current view off its own route", state.title === "Detail v2", state.title);

const back = await httpJson(`${origin}mermaid/api/back`, "POST");
check("Back walks the history the push wrote", back.view && back.view.title === "Flow", back.view && back.view.title);

const doc = await call("render_markdown", { title: "Doc", content: "# Title\n\nbody" });
check("render_markdown renders in the document viewer", /\/markdown$/.test(doc.url), doc.url);
check("the two viewers keep separate history", doc.historyDepth === 0);

for (const [label, url] of [["diagram", `${origin}mermaid`], ["document", `${origin}markdown`]]) {
    const res = await httpRequest(url);
    check(`the ${label} page is served`, res.status === 200 && res.body.includes("<html"), `${res.status}, ${res.body.length} bytes`);
}

let rejected = "";
try {
    await call("render_diagram", { title: "Empty" });
} catch (err) {
    rejected = err.message;
}
check("an empty diagram is refused rather than rendered blank", /source is required/.test(rejected), rejected);

const app = (await rpc("resources/read", { uri: "ui://delivery-canvas/diagram.html" })).result.contents[0].text;
check("the app resource carries the bridge and the page", app.includes("__DELIVERY_HTTP_ORIGIN__") && app.includes("mermaid"), `${app.length} bytes`);

proc.kill();
console.log(failures ? `\n${failures} check(s) failed` : "\nall passing");
process.exit(failures ? 1 : 0);
