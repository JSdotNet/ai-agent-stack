// Extension: delivery-canvas
//
// The two viewers as Copilot canvases: a Mermaid diagram viewer and a Markdown document
// viewer. The same pages the plugin's MCP server serves — one copy each, under
// `../../mcp/delivery-canvas/views/` — so a fix to a viewer lands in both transports at
// once and the two can never disagree about what a diagram looks like.
//
// A render surface, and nothing else: each canvas exposes exactly the one action the render
// capability names, so this plugin is swappable for any other implementation of the same
// contract. Neither canvas knows anything about runs, stages, or whatever produced the
// content it is handed.
//
// Rendering is a live preview beside the file artifact, never a replacement for it: the
// caller renders the same source it wrote to disk, and the file stays the source of truth.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createCanvas, joinSession } from "@github/copilot-sdk/extension";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIEWS = path.resolve(__dirname, "..", "..", "mcp", "delivery-canvas", "views");

// ---------------------------------------------------------------------------
// Per-instance view state, one store per canvas kind.
// ---------------------------------------------------------------------------

function createStore() {
    const instances = new Map();
    const sseClients = new Map();

    function getInstance(instanceId) {
        if (!instances.has(instanceId)) {
            instances.set(instanceId, {
                currentView: null,
                history: [],
                token: crypto.randomBytes(16).toString("hex"),
            });
        }
        return instances.get(instanceId);
    }

    function setView(inst, view, mode) {
        if (mode === "push" && inst.currentView) inst.history.push(inst.currentView);
        inst.currentView = view;
    }

    function popView(inst) {
        if (inst.history.length === 0) return null;
        inst.currentView = inst.history.pop();
        return inst.currentView;
    }

    function viewPayload(inst) {
        const view = inst.currentView;
        return {
            ...view,
            historyDepth: inst.history.length,
            breadcrumbs: inst.history.map((v) => v.title).concat(view ? [view.title] : []),
        };
    }

    function broadcast(instanceId, event, data) {
        const clients = sseClients.get(instanceId);
        if (!clients) return;
        const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of clients) res.write(msg);
    }

    function broadcastView(instanceId, inst) {
        broadcast(instanceId, "view", viewPayload(inst));
    }

    function validateToken(instanceId, token) {
        const inst = instances.get(instanceId);
        return Boolean(inst && inst.token === token);
    }

    function close(instanceId) {
        instances.delete(instanceId);
        sseClients.delete(instanceId);
    }

    return { instances, sseClients, getInstance, setView, popView, viewPayload, broadcast, broadcastView, validateToken, close };
}

const stores = {
    mermaid: createStore(),
    markdown: createStore(),
};

// ---------------------------------------------------------------------------
// One HTTP server for both canvases: `/mermaid…` and `/markdown…`, each page
// served from the shared views folder, with the per-instance token the canvas
// hands out in its open URL.
// ---------------------------------------------------------------------------

function json(res, code, data) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const segments = url.pathname.split("/").filter(Boolean);
    const kind = segments[0];
    const store = stores[kind];
    const instanceId = url.searchParams.get("instance");
    const token = url.searchParams.get("token");

    if (!store || !instanceId || !store.validateToken(instanceId, token)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    // Page
    if (req.method === "GET" && segments.length === 1) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fs.readFileSync(path.join(VIEWS, `${kind}.html`), "utf8"));
        return;
    }

    // SSE stream
    if (req.method === "GET" && segments[1] === "events") {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        if (!store.sseClients.has(instanceId)) store.sseClients.set(instanceId, new Set());
        store.sseClients.get(instanceId).add(res);
        req.on("close", () => store.sseClients.get(instanceId)?.delete(res));

        const inst = store.getInstance(instanceId);
        if (inst.currentView) {
            res.write(`event: view\ndata: ${JSON.stringify(store.viewPayload(inst))}\n\n`);
        }
        return;
    }

    // Current state, read by the page on load and on reconnect
    if (req.method === "GET" && segments[1] === "api" && segments[2] === "state") {
        json(res, 200, store.viewPayload(store.getInstance(instanceId)));
        return;
    }

    // Navigate back through the view history
    if (req.method === "POST" && segments[1] === "api" && segments[2] === "back") {
        const inst = store.getInstance(instanceId);
        const prev = store.popView(inst);
        if (prev) store.broadcastView(instanceId, inst);
        json(res, 200, { ok: true, view: prev });
        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

const port = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});

function openUrl(kind, instanceId, inst) {
    return `http://127.0.0.1:${port}/${kind}?instance=${instanceId}&token=${inst.token}`;
}

// ---------------------------------------------------------------------------
// Mermaid diagram viewer
// ---------------------------------------------------------------------------

const store = stores.mermaid;

const diagramCanvas = createCanvas({
    id: "delivery-diagram",
    displayName: "Mermaid Diagram Viewer",
    description:
        "Renders Mermaid diagram source as an interactive, pannable live preview beside the file it was written to.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "Optional title for the initial diagram" },
            source: { type: "string", description: "Optional raw Mermaid diagram source to render immediately on open, e.g. the contents of a ```mermaid fenced code block" },
            explanation: {
                type: "object",
                properties: { title: { type: "string" }, text: { type: "string" } },
                description: "Optional explanation panel shown alongside the initial diagram",
            },
        },
    },
    actions: [
        {
            name: "render_diagram",
            description:
                "Render or update a Mermaid diagram on the canvas. Use mode 'push' to drill into a related diagram (adds to history so the user can navigate back with the Back button), or 'replace' (default) to update the current view in place. Render the same Mermaid source that was written to the file artifact; the file stays the source of truth.",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Diagram title" },
                    source: { type: "string", description: "Raw Mermaid diagram source, e.g. the contents of a ```mermaid fenced code block" },
                    mode: {
                        type: "string",
                        enum: ["push", "replace"],
                        description: "Navigation mode. 'push' saves the current view to history. 'replace' updates in place (default).",
                    },
                    explanation: {
                        type: "object",
                        properties: { title: { type: "string" }, text: { type: "string" } },
                        description: "Optional explanation panel shown alongside the diagram",
                    },
                },
                required: ["source"],
            },
            handler({ instanceId, input }) {
                const inst = store.getInstance(instanceId);
                store.setView(inst, { title: input.title || "Diagram", source: input.source, explanation: input.explanation || null }, input.mode);
                store.broadcastView(instanceId, inst);
                return { ok: true, historyDepth: inst.history.length };
            },
        },
    ],
    open({ instanceId, input }) {
        const inst = store.getInstance(instanceId);
        if (input?.source) {
            store.setView(inst, { title: input.title || "Diagram", source: input.source, explanation: input.explanation || null }, "replace");
        }
        return {
            url: openUrl("mermaid", instanceId, inst),
            title: input?.title || "Mermaid Diagram Viewer",
            status: inst.currentView ? inst.currentView.title : "Ready",
        };
    },
    onClose({ instanceId }) {
        store.close(instanceId);
    },
});

// ---------------------------------------------------------------------------
// Markdown document viewer
// ---------------------------------------------------------------------------

const docStore = stores.markdown;

const documentCanvas = createCanvas({
    id: "delivery-document",
    displayName: "Markdown Document Viewer",
    description:
        "Live-renders a Markdown document as formatted HTML beside the file it was written to, while it is drafted or revised.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "Optional title for the initial document" },
            content: { type: "string", description: "Optional raw Markdown content to render immediately on open" },
        },
    },
    actions: [
        {
            name: "render_markdown",
            description:
                "Render or update the Markdown document shown on the canvas. Use mode 'push' when switching to a different document (adds to history), or 'replace' (default) to update in place. Render the same Markdown that was written to the file artifact; the file stays the source of truth.",
            inputSchema: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Document title" },
                    content: { type: "string", description: "Raw Markdown content to render" },
                    mode: {
                        type: "string",
                        enum: ["push", "replace"],
                        description: "Navigation mode. 'push' saves the current document to history. 'replace' updates in place (default).",
                    },
                },
                required: ["content"],
            },
            handler({ instanceId, input }) {
                const inst = docStore.getInstance(instanceId);
                docStore.setView(inst, { title: input.title || "Document", content: input.content }, input.mode);
                docStore.broadcastView(instanceId, inst);
                return { ok: true, historyDepth: inst.history.length };
            },
        },
    ],
    open({ instanceId, input }) {
        const inst = docStore.getInstance(instanceId);
        if (input?.content) {
            docStore.setView(inst, { title: input.title || "Document", content: input.content }, "replace");
        }
        return {
            url: openUrl("markdown", instanceId, inst),
            title: input?.title || "Markdown Document Viewer",
            status: inst.currentView ? inst.currentView.title : "Ready",
        };
    },
    onClose({ instanceId }) {
        docStore.close(instanceId);
    },
});

await joinSession({ canvases: [diagramCanvas, documentCanvas] });
