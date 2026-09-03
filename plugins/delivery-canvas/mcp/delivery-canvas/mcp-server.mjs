#!/usr/bin/env node
// MCP server: delivery-canvas
//
// A render surface: two live viewers, and nothing else. It implements one operation group
// of the surface capability — render (render_diagram, render_markdown) — and neither tracks
// runs nor exports anything, because a canvas shows content and knows nothing about the
// lifecycle that produced it.
//
// The same two pages are the Copilot canvases in `extensions/delivery-canvas/`. One copy of
// each page, two transports: a canvas panel there, this server here.
//
//   MCP App (SEP-1865)                 plain browser
//   ui:// resource, rendered inline    page served on 127.0.0.1
//   the page's fetch, via app-bridge   the page's own fetch and EventSource
//
// Rendering is a live preview beside the file artifact, never a replacement for it: the
// caller renders the same source it wrote to disk, and the file stays the source of truth.
//
// Everything is served on 127.0.0.1 with an ephemeral port. There is no authentication:
// reaching it already requires local access to the machine.

import { createServer } from "node:http";
import { readFile as fsReadFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVER_NAME = "delivery-canvas";
const SERVER_VERSION = "0.1.0";
const SUPPORTED_PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

// MCP Apps (SEP-1865). A host that implements this extension renders the pages below inline
// in the conversation instead of the user opening them in a browser. Hosts that do not
// implement it ignore the resources entirely and the HTTP surface stays the way in.
const UI_EXTENSION = "io.modelcontextprotocol/ui";
const APP_MIME_TYPE = "text/html;profile=mcp-app";
const APP_RESOURCES = [
    {
        uri: "ui://delivery-canvas/diagram.html",
        name: "Mermaid diagram viewer",
        description: "Interactive, pannable Mermaid diagram viewer.",
        page: "mermaid",
    },
    {
        uri: "ui://delivery-canvas/document.html",
        name: "Markdown document viewer",
        description: "Rendered Markdown document preview.",
        page: "markdown",
    },
];
const APP_RESOURCE_BY_URI = new Map(APP_RESOURCES.map((r) => [r.uri, r]));

class ToolError extends Error {}

// ---------------------------------------------------------------------------
// Viewer state
// ---------------------------------------------------------------------------
//
// A view is deliberately in memory and not on disk. A rendered view is a preview of a file
// that already exists; persisting it would create a second, staler copy of something the
// caller can re-render in one call.

const viewers = {
    mermaid: { currentView: null, history: [], clients: new Set() },
    markdown: { currentView: null, history: [], clients: new Set() },
};

function viewPayload(viewer) {
    const view = viewer.currentView;
    return {
        ...view,
        historyDepth: viewer.history.length,
        breadcrumbs: viewer.history.map((v) => v.title).concat(view ? [view.title] : []),
    };
}

function broadcastViewer(viewer, event, data) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of viewer.clients) res.write(msg);
}

function setView(viewer, view, mode) {
    if (mode === "push" && viewer.currentView) viewer.history.push(viewer.currentView);
    viewer.currentView = view;
    broadcastViewer(viewer, "view", viewPayload(viewer));
}

function popView(viewer) {
    if (!viewer.history.length) return null;
    viewer.currentView = viewer.history.pop();
    broadcastViewer(viewer, "view", viewPayload(viewer));
    return viewer.currentView;
}

function pageFile(name) {
    return path.join(__dirname, "views", name === "mermaid" ? "mermaid.html" : "markdown.html");
}

// --- MCP App resources ------------------------------------------------------
//
// The same pages the HTTP server returns, with the bridge script injected ahead of their
// own. The pages are unchanged: see app-bridge.js for why.

async function appPageHtml(page) {
    const body = await fsReadFile(pageFile(page), "utf8");
    const bridge = await fsReadFile(path.join(__dirname, "app-bridge.js"), "utf8");
    // The HTTP origin is how the page reaches its own state and history routes from inside
    // the app sandbox. Starting the server here is what makes that origin knowable.
    const origin = await ensureHttpServer().catch(() => "");
    const preamble =
        `<script>window.__DELIVERY_HTTP_ORIGIN__ = ${JSON.stringify(origin || "")};</script>\n` +
        `<script>\n${bridge}\n</script>\n`;
    const headIndex = body.indexOf("<head>");
    if (headIndex < 0) return preamble + body;
    return body.slice(0, headIndex + "<head>".length) + "\n" + preamble + body.slice(headIndex + "<head>".length);
}

function appResourceMeta(origin) {
    const domains = origin ? [origin.replace(/\/$/, "")] : [];
    return {
        ui: {
            csp: {
                // This server's own origin serves the viewer state routes; the CDN serves
                // Mermaid for the diagram viewer.
                connectDomains: domains,
                resourceDomains: domains.concat(["https://cdn.jsdelivr.net"]),
            },
            prefersBorder: true,
        },
    };
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

let httpServer = null;
let httpUrl = null;

function sendHtml(res, body) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(body);
}

const INDEX_PAGE = `<!doctype html><meta charset="utf-8"><title>Viewers</title>
<style>body{margin:0;padding:3rem;background:#12161c;color:#e6edf3;font:15px/1.6 system-ui,sans-serif}
a{color:#7cc4ff;display:block;margin:.6rem 0}</style>
<h1>Viewers</h1><a href="/mermaid">Mermaid diagram viewer</a><a href="/markdown">Markdown document viewer</a>`;

async function handleRequest(req, res) {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/") {
        sendHtml(res, INDEX_PAGE);
        return;
    }

    for (const [name, viewer] of Object.entries(viewers)) {
        if (req.method === "GET" && (pathname === `/${name}` || pathname === `/${name}/`)) {
            sendHtml(res, await fsReadFile(pageFile(name), "utf8"));
            return;
        }
        if (req.method === "GET" && pathname === `/${name}/events`) {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            viewer.clients.add(res);
            req.on("close", () => viewer.clients.delete(res));
            if (viewer.currentView) {
                res.write(`event: view\ndata: ${JSON.stringify(viewPayload(viewer))}\n\n`);
            }
            return;
        }
        if (req.method === "GET" && pathname === `/${name}/api/state`) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(viewPayload(viewer)));
            return;
        }
        if (req.method === "POST" && pathname === `/${name}/api/back`) {
            const prev = popView(viewer);
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true, view: prev }));
            return;
        }
    }

    res.statusCode = 404;
    res.end("not found");
}

async function ensureHttpServer() {
    if (httpServer) return httpUrl;
    httpServer = createServer((req, res) => {
        handleRequest(req, res).catch((err) => {
            res.statusCode = 500;
            res.end(String((err && err.message) || err));
        });
    });
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    httpUrl = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/`;
    return httpUrl;
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------
//
// Two names, and only two: the render capability is what this surface answers. A viewer that
// declared navigation or inspection tools of its own would stop being swappable for another
// implementation of the same contract.

const tools = [
    {
        name: "render_diagram",
        description:
            "Render or update a Mermaid diagram in the diagram viewer. Use mode 'push' to drill into a related diagram (adds to history so the user can navigate back), or 'replace' (default) to update the current view in place. Render the same Mermaid source that was written to the file artifact; the file stays the source of truth.",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string", description: "Diagram title." },
                source: { type: "string", description: "Raw Mermaid diagram source, e.g. the contents of a ```mermaid fenced code block." },
                mode: { type: "string", enum: ["push", "replace"], description: "Navigation mode. Defaults to replace." },
                explanation: {
                    type: "object",
                    properties: { title: { type: "string" }, text: { type: "string" } },
                    description: "Optional explanation panel shown alongside the diagram.",
                },
            },
            required: ["source"],
        },
        _meta: { ui: { resourceUri: "ui://delivery-canvas/diagram.html" } },
        handler: async ({ title, source, mode, explanation }) => {
            if (typeof source !== "string" || !source.trim()) throw new ToolError("source is required.");
            const url = await ensureHttpServer();
            setView(viewers.mermaid, { title: title || "Diagram", source, explanation: explanation || null }, mode);
            return { ok: true, url: `${url}mermaid`, view: viewPayload(viewers.mermaid), historyDepth: viewers.mermaid.history.length };
        },
    },
    {
        name: "render_markdown",
        description:
            "Render or update a Markdown document in the document viewer. Render the same Markdown that was written to the file artifact; the file stays the source of truth.",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string", description: "Document title." },
                content: { type: "string", description: "Raw Markdown content to render." },
                mode: { type: "string", enum: ["push", "replace"], description: "Navigation mode. Defaults to replace." },
            },
            required: ["content"],
        },
        _meta: { ui: { resourceUri: "ui://delivery-canvas/document.html" } },
        handler: async ({ title, content, mode }) => {
            if (typeof content !== "string" || !content.length) throw new ToolError("content is required.");
            const url = await ensureHttpServer();
            setView(viewers.markdown, { title: title || "Document", content }, mode);
            return { ok: true, url: `${url}markdown`, view: viewPayload(viewers.markdown), historyDepth: viewers.markdown.history.length };
        },
    },
];

const toolsByName = new Map(tools.map((t) => [t.name, t]));

// ---------------------------------------------------------------------------
// MCP stdio transport (newline-delimited JSON-RPC 2.0)
// ---------------------------------------------------------------------------

function send(message) {
    process.stdout.write(JSON.stringify(message) + "\n");
}

function respond(id, result) {
    send({ jsonrpc: "2.0", id, result });
}

function respondError(id, code, message) {
    send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleMessage(msg) {
    if (!msg || msg.jsonrpc !== "2.0") return;
    const { id, method, params } = msg;
    // Notifications carry no id and expect no response.
    if (id === undefined || id === null) return;

    switch (method) {
        case "initialize": {
            const requested = params && params.protocolVersion;
            respond(id, {
                protocolVersion: SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0],
                capabilities: {
                    tools: { listChanged: false },
                    resources: { listChanged: false, subscribe: false },
                    // Extensions are negotiated: a host that does not implement MCP Apps
                    // simply never reads the ui:// resources.
                    extensions: { [UI_EXTENSION]: { mimeTypes: [APP_MIME_TYPE] } },
                },
                serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            });
            return;
        }
        case "ping":
            respond(id, {});
            return;
        case "tools/list":
            respond(id, {
                tools: tools.map(({ name, description, inputSchema, _meta }) => ({ name, description, inputSchema, _meta })),
            });
            return;
        case "resources/list": {
            const origin = await ensureHttpServer().catch(() => "");
            respond(id, {
                resources: APP_RESOURCES.map(({ uri, name, description }) => ({
                    uri,
                    name,
                    description,
                    mimeType: APP_MIME_TYPE,
                    _meta: appResourceMeta(origin),
                })),
            });
            return;
        }
        case "resources/read": {
            const resource = APP_RESOURCE_BY_URI.get(params && params.uri);
            if (!resource) {
                respondError(id, -32602, `Unknown resource: ${params && params.uri}`);
                return;
            }
            const origin = await ensureHttpServer().catch(() => "");
            respond(id, {
                contents: [
                    {
                        uri: resource.uri,
                        mimeType: APP_MIME_TYPE,
                        text: await appPageHtml(resource.page),
                        _meta: appResourceMeta(origin),
                    },
                ],
            });
            return;
        }
        case "tools/call": {
            const tool = toolsByName.get(params && params.name);
            if (!tool) {
                respondError(id, -32602, `Unknown tool: ${params && params.name}`);
                return;
            }
            try {
                const result = await tool.handler((params && params.arguments) || {});
                respond(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
            } catch (err) {
                // Tool failures are reported as results with isError so the model can read
                // and correct them, per the MCP spec; only protocol faults use JSON-RPC
                // errors.
                respond(id, {
                    content: [{ type: "text", text: String((err && err.message) || err) }],
                    isError: true,
                });
            }
            return;
        }
        default:
            respondError(id, -32601, `Method not found: ${method}`);
    }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
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
        handleMessage(msg).catch((err) => {
            process.stderr.write(`delivery-canvas: ${String((err && err.stack) || err)}\n`);
        });
    }
});
// End of input means the host is done with this server. Close the viewer streams and the
// HTTP listener first: exiting out from under live handles aborts the process on Windows
// rather than ending it.
process.stdin.on("end", () => {
    for (const viewer of Object.values(viewers)) {
        for (const res of viewer.clients) res.end();
        viewer.clients.clear();
    }
    if (httpServer) httpServer.close();
    process.exitCode = 0;
});
