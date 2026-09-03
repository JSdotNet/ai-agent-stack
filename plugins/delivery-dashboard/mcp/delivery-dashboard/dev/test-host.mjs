#!/usr/bin/env node
// Minimal MCP Apps host, for developing the dashboard app without Claude Desktop.
//
// It does what a real host does, and nothing else: spawn the server over stdio, list its
// tools, call one, read the `ui://` resource that tool points at, render it in a sandboxed
// iframe, and speak the MCP Apps postMessage protocol to it — answering `ui/initialize`,
// forwarding `tools/call` to the server, pushing `ui/notifications/tool-result`, and
// handling `ui/open-link`.
//
//   node dev/test-host.mjs [--port 8765] [--tool open_dashboard] [--inspect]
//
// Then open the printed URL. `--inspect` adds `allow-same-origin` to the iframe sandbox so
// devtools (and automated checks) can read the app's DOM; it weakens the sandbox and exists
// only for debugging. This is a development harness, not part of the shipped extension:
// Claude Desktop provides the real thing.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const PORT = Number(argOf("--port", "8765"));
const DEFAULT_TOOL = argOf("--tool", "open_dashboard");
const SANDBOX = args.includes("--inspect") ? "allow-scripts allow-same-origin" : "allow-scripts";

// --- stdio client -----------------------------------------------------------

const child = spawn(process.execPath, [path.join(__dirname, "..", "mcp-server.mjs")], {
    stdio: ["pipe", "pipe", "inherit"],
    env: process.env,
});

let buffer = "";
let nextId = 1;
const pending = new Map();

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
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
    return new Promise((resolve, reject) => {
        pending.set(id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
}

const init = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: { extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } } },
    clientInfo: { name: "delivery-dashboard-test-host", version: "1.0.0" },
});
child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

const uiSupported = Boolean(init.capabilities && init.capabilities.extensions && init.capabilities.extensions["io.modelcontextprotocol/ui"]);
console.log(`server: ${init.serverInfo.name} ${init.serverInfo.version} — MCP Apps ${uiSupported ? "advertised" : "NOT advertised"}`);

// --- host page --------------------------------------------------------------

const HOST_PAGE = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>MCP Apps test host</title>
<style>
  body { font: 13px system-ui, sans-serif; margin: 0; display: flex; height: 100vh; }
  aside { width: 280px; border-right: 1px solid #d0d7de; padding: 12px; overflow: auto; }
  main { flex: 1; display: flex; flex-direction: column; }
  iframe { flex: 1; border: 0; width: 100%; }
  button { display: block; width: 100%; text-align: left; margin-bottom: 4px; padding: 6px 8px; cursor: pointer; }
  button.ui { font-weight: 600; }
  #log { height: 140px; overflow: auto; border-top: 1px solid #d0d7de; font-family: ui-monospace, monospace; font-size: 11px; padding: 6px; white-space: pre-wrap; }
</style>
</head>
<body>
<aside><h3>Tools</h3><div id="tools"></div></aside>
<main><iframe id="app" sandbox="${SANDBOX}"></iframe><div id="log"></div></main>
<script>
  const logEl = document.getElementById("log");
  const log = (...parts) => { logEl.textContent += parts.join(" ") + "\\n"; logEl.scrollTop = logEl.scrollHeight; };
  const frame = document.getElementById("app");
  const rpc = (method, params) => fetch("/rpc", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, params }),
  }).then((r) => r.json());

  let tools = [];
  async function loadTools() {
    const res = await rpc("tools/list", {});
    tools = res.result.tools;
    document.getElementById("tools").innerHTML = tools.map((t) =>
      '<button class="' + (t._meta && t._meta.ui ? "ui" : "") + '" data-tool="' + t.name + '">' +
      t.name + (t._meta && t._meta.ui ? " ▣" : "") + "</button>"
    ).join("");
  }

  // The host side of the MCP Apps postMessage protocol.
  window.addEventListener("message", async (event) => {
    const msg = event.data;
    if (!msg || msg.jsonrpc !== "2.0" || !msg.method) return;
    const reply = (result) => frame.contentWindow.postMessage({ jsonrpc: "2.0", id: msg.id, result }, "*");
    if (msg.method === "ui/initialize") {
      log("<- ui/initialize");
      reply({ protocolVersion: "2026-01-26", hostInfo: { name: "test-host", version: "1.0.0" }, hostCapabilities: {}, hostContext: { theme: "light", displayMode: "inline" } });
      return;
    }
    if (msg.method === "ui/notifications/initialized") { log("<- initialized"); return; }
    if (msg.method === "tools/call") {
      log("<- tools/call", msg.params.name);
      const res = await rpc("tools/call", msg.params);
      reply(res.result);
      return;
    }
    if (msg.method === "resources/read") {
      const res = await rpc("resources/read", msg.params);
      reply(res.result);
      return;
    }
    if (msg.method === "ui/open-link") { log("<- ui/open-link", msg.params.url); window.open(msg.params.url, "_blank"); reply({}); return; }
    if (msg.method === "ui/notifications/size-changed") return;
    if (msg.id !== undefined) reply({});
  });

  async function callTool(name) {
    const tool = tools.find((t) => t.name === name);
    const uri = tool && tool._meta && tool._meta.ui && tool._meta.ui.resourceUri;
    if (!uri) { log("tool", name, "declares no UI resource"); return; }
    log("read", uri);
    const resource = await rpc("resources/read", { uri });
    const html = resource.result.contents[0].text;
    const meta = resource.result.contents[0]._meta;
    log("csp", JSON.stringify(meta && meta.ui && meta.ui.csp));
    frame.srcdoc = html;
    frame.onload = async () => {
      const result = await rpc("tools/call", { name, arguments: {} });
      frame.contentWindow.postMessage({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: result.result }, "*");
      log("-> tool-result", name);
    };
  }

  document.getElementById("tools").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tool]");
    if (btn) callTool(btn.dataset.tool);
  });

  loadTools().then(() => callTool(${JSON.stringify(DEFAULT_TOOL)}));
</script>
</body>
</html>`;

createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/rpc") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const { method, params } = JSON.parse(body || "{}");
        try {
            const result = await rpc(method, params);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ result }));
        } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err.message || err) }));
        }
        return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(HOST_PAGE);
}).listen(PORT, "127.0.0.1", () => {
    console.log(`test host: http://127.0.0.1:${PORT}/  (rendering ${DEFAULT_TOOL})`);
});
