// MCP Apps bridge — injected into the dashboard, diagram and document pages when they are
// served as `ui://` resources instead of over HTTP.
//
// The point of this file is that the three pages themselves never learn they are running
// inside an MCP App: `render.mjs` and the two viewer pages are the same files the HTTP
// server serves, and stay that way. This bridge adapts the environment to them rather than
// the other way round.
//
// It does four things:
//
//   1. Speaks the MCP Apps postMessage protocol to the host (ui/initialize, tools/call,
//      ui/notifications/*), per the 2026-01-26 specification.
//   2. Replaces `fetch` for the run pages' own JSON routes, answering them with `tools/call`
//      results instead: `/api/runs` becomes `list_runs`, `/api/runs/<id>` becomes `get_run`.
//      The two viewer routes have no tool behind them — the surface declares only the tool
//      names in the contract, and viewer navigation is not one of them — so those go to the
//      server's HTTP origin instead, which the sandbox is allowed to reach.
//   3. Replaces `EventSource` with a poller. The Apps protocol pushes a notification for the
//      tool result that opened the app, but nothing equivalent to a server-sent stream, so
//      live updates are polled from the same tools. Polling a local stdio server is cheap.
//   4. Rewrites the handful of URLs the pages build for things JSON cannot carry — evidence
//      images and the HTML report — to absolute URLs on the dashboard's own HTTP origin, and
//      routes outbound link clicks through `ui/open-link`, since a sandboxed iframe cannot
//      navigate or open tabs by itself.
//
// Everything degrades: if the host never answers `ui/initialize`, the pages simply show
// their empty state instead of throwing.

(function () {
  "use strict";

  var originalFetch = window.fetch ? window.fetch.bind(window) : null;
  var ORIGIN = window.__DELIVERY_HTTP_ORIGIN__ || "";
  var POLL_MS = 2000;

  // The pages' own routes on the server's HTTP origin. Used for everything the tool surface
  // deliberately does not expose; resolves to a rejected promise when there is no origin, and
  // the caller degrades to its empty state.
  function httpJson(path, init) {
    if (!ORIGIN || !originalFetch) return Promise.reject(new Error("no HTTP origin available"));
    return originalFetch(ORIGIN.replace(/\/$/, "") + path, init).then(function (res) {
      return res.json();
    });
  }

  // --- JSON-RPC over postMessage ------------------------------------------------------

  var nextId = 1;
  var pending = new Map();
  var toolResultHandlers = [];
  var connected = null;

  function post(message) {
    var payload = { jsonrpc: "2.0" };
    for (var key in message) payload[key] = message[key];
    window.parent.postMessage(payload, "*");
  }

  function request(method, params) {
    var id = "bridge-" + nextId++;
    return new Promise(function (resolve, reject) {
      pending.set(id, { resolve: resolve, reject: reject });
      post({ id: id, method: method, params: params || {} });
      // A host that never answers must not wedge the page forever.
      setTimeout(function () {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error("Timed out waiting for host response to " + method));
        }
      }, 15000);
    });
  }

  function notify(method, params) {
    post({ method: method, params: params || {} });
  }

  window.addEventListener("message", function (event) {
    var msg = event.data;
    if (!msg || msg.jsonrpc !== "2.0") return;

    if (msg.id !== undefined && msg.id !== null && pending.has(msg.id)) {
      var waiter = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) waiter.reject(new Error(msg.error.message || "Host returned an error"));
      else waiter.resolve(msg.result);
      return;
    }

    if (msg.method === "ui/notifications/tool-result") {
      toolResultHandlers.forEach(function (fn) {
        try {
          fn(msg.params);
        } catch (err) {
          /* a bad handler must not break the message pump */
        }
      });
      return;
    }

    if (msg.method === "ui/resource-teardown" && msg.id !== undefined) {
      post({ id: msg.id, result: {} });
      return;
    }
  });

  function connect() {
    if (connected) return connected;
    connected = request("ui/initialize", { appCapabilities: {} })
      .then(function (result) {
        notify("ui/notifications/initialized");
        return result;
      })
      .catch(function () {
        // Not running inside a host, or the host declined. The fetch shim below then
        // resolves to empty payloads and the pages render their normal empty state.
        return null;
      });
    return connected;
  }

  // Tool results are JSON-encoded into a text content block by this server, so unwrap that
  // here rather than making every caller do it.
  function callTool(name, args) {
    return connect().then(function () {
      return request("tools/call", { name: name, arguments: args || {} }).then(function (result) {
        if (!result || !Array.isArray(result.content)) return null;
        var text = result.content
          .filter(function (c) { return c && c.type === "text"; })
          .map(function (c) { return c.text; })
          .join("");
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch (err) {
          return text;
        }
      });
    });
  }

  // --- Evidence lookup ----------------------------------------------------------------

  // `get_run` returns evidence as data URIs alongside the run, so images still render when
  // the sandbox will not load them from the HTTP origin.
  var evidenceByPath = Object.create(null);

  function rememberEvidence(run) {
    if (!run || !run.evidenceDataUris) return run;
    for (var key in run.evidenceDataUris) {
      if (run.evidenceDataUris[key]) evidenceByPath[key] = run.evidenceDataUris[key];
    }
    return run;
  }

  // --- fetch shim ---------------------------------------------------------------------

  var ROUTES = [
    { method: "GET", pattern: /^\/api\/runs$/, handler: function () { return callTool("list_runs"); } },
    {
      method: "GET",
      pattern: /^\/api\/runs\/([^/]+)$/,
      handler: function (m) {
        return callTool("get_run", { runId: decodeURIComponent(m[1]), includeEvidence: true }).then(rememberEvidence);
      },
    },
    { method: "GET", pattern: /^\/(mermaid|markdown)\/api\/state$/, handler: function (m) { return httpJson("/" + m[1] + "/api/state"); } },
    { method: "POST", pattern: /^\/(mermaid|markdown)\/api\/back$/, handler: function (m) { return httpJson("/" + m[1] + "/api/back", { method: "POST" }); } },
  ];

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input && input.url;
    var method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
    if (typeof url === "string" && url.charAt(0) === "/") {
      var path = url.split("?")[0];
      for (var i = 0; i < ROUTES.length; i++) {
        var route = ROUTES[i];
        var match = route.pattern.exec(path);
        if (match && route.method === method) {
          return route.handler(match).then(function (data) {
            return new Response(JSON.stringify(data === null || data === undefined ? {} : data), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          });
        }
      }
    }
    if (originalFetch) return originalFetch(input, init);
    return Promise.reject(new Error("fetch is unavailable in this app sandbox: " + url));
  };

  // --- EventSource shim ---------------------------------------------------------------

  // The pages open `/events` (dashboard) or `/mermaid|markdown/events` (viewers) and listen
  // for "update" / "view" / "clear". Poll the equivalent tool and emit the same events, only
  // when the payload actually changed, so re-renders stay as rare as they were with SSE.
  function BridgeEventSource(url) {
    var self = this;
    this.url = url;
    this.readyState = 1;
    this._listeners = Object.create(null);
    this._last = null;

    // The viewer pages append `?instance=…&token=…`, so match on the path alone.
    var viewer = /^\/(mermaid|markdown)\/events$/.exec(String(url).split("?")[0]);
    var poll;
    if (viewer) {
      poll = function () {
        return httpJson("/" + viewer[1] + "/api/state").then(function (view) {
          var serialized = JSON.stringify(view || null);
          if (serialized === self._last) return;
          self._last = serialized;
          if (!view || !view.title) self._emit("clear", "{}");
          else self._emit("view", serialized);
        });
      };
      // The host also pushes the result of the tool that opened this app; use it so the
      // first paint does not wait for a poll tick.
      toolResultHandlers.push(function () {
        poll().catch(function () {});
      });
    } else {
      poll = function () {
        return callTool("list_runs").then(function (runs) {
          var serialized = JSON.stringify(runs || []);
          if (serialized === self._last) return;
          self._last = serialized;
          self._emit("update", "{}");
        });
      };
    }

    this._timer = setInterval(function () {
      poll().catch(function () {});
    }, POLL_MS);
    poll().catch(function () {});
  }

  BridgeEventSource.prototype.addEventListener = function (type, fn) {
    (this._listeners[type] = this._listeners[type] || []).push(fn);
  };
  BridgeEventSource.prototype.removeEventListener = function (type, fn) {
    var list = this._listeners[type] || [];
    var idx = list.indexOf(fn);
    if (idx >= 0) list.splice(idx, 1);
  };
  BridgeEventSource.prototype.close = function () {
    clearInterval(this._timer);
    this.readyState = 2;
  };
  BridgeEventSource.prototype._emit = function (type, data) {
    var event = { type: type, data: data };
    (this._listeners[type] || []).forEach(function (fn) {
      try {
        fn(event);
      } catch (err) {
        /* keep polling even if a handler throws */
      }
    });
    if (typeof this["on" + type] === "function") this["on" + type](event);
  };

  window.EventSource = BridgeEventSource;

  // --- URL rewriting and outbound links -----------------------------------------------

  // Evidence images and the HTML report are the two things the pages reference by URL rather
  // than by data. Relative URLs resolve against the sandbox, not the dashboard server, so
  // rewrite them to the absolute HTTP origin; swap in the data URI if that still fails.
  function absolutize(node) {
    var src = node.getAttribute && node.getAttribute("src");
    if (src && src.indexOf("/api/") === 0) {
      var evidencePath = /[?&]path=([^&]+)/.exec(src);
      // The page marks thumbnails `loading="lazy"`, which never resolves in an app sandbox:
      // the iframe's viewport is not the user's, so the image stays permanently deferred and
      // silently blank. Evidence lists are short, so eager loading costs nothing here.
      if (node.getAttribute("loading") === "lazy") node.setAttribute("loading", "eager");
      if (ORIGIN) node.setAttribute("src", ORIGIN.replace(/\/$/, "") + src);
      if (evidencePath) {
        var decoded = decodeURIComponent(evidencePath[1]);
        node.addEventListener(
          "error",
          function () {
            if (evidenceByPath[decoded] && node.getAttribute("src") !== evidenceByPath[decoded]) {
              node.setAttribute("src", evidenceByPath[decoded]);
            }
          },
          { once: true }
        );
        if (!ORIGIN && evidenceByPath[decoded]) node.setAttribute("src", evidenceByPath[decoded]);
      }
    }
    var href = node.getAttribute && node.getAttribute("href");
    if (href && href.indexOf("/api/") === 0 && ORIGIN) {
      node.setAttribute("href", ORIGIN.replace(/\/$/, "") + href);
    }
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    absolutize(root);
    var nodes = root.querySelectorAll ? root.querySelectorAll("img[src], a[href]") : [];
    for (var i = 0; i < nodes.length; i++) absolutize(nodes[i]);
  }

  document.addEventListener("DOMContentLoaded", function () {
    scan(document.body);
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        for (var i = 0; i < record.addedNodes.length; i++) scan(record.addedNodes[i]);
      });
    }).observe(document.body, { childList: true, subtree: true });
  });

  // A sandboxed iframe cannot open a tab, so hand external links to the host instead.
  document.addEventListener("click", function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!anchor) return;
    var href = anchor.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href)) return;
    event.preventDefault();
    connect().then(function () {
      request("ui/open-link", { url: href }).catch(function () {});
    });
  });

  connect();
})();
