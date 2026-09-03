// MCP Apps bridge — injected into the diagram and document pages when they are served as
// `ui://` resources instead of over HTTP.
//
// The point of this file is that the two pages never learn they are running inside an MCP
// App: they are the same files the HTTP server serves and the Copilot canvases open, and
// stay that way. This bridge adapts the environment to them rather than the other way round.
//
// It does three things:
//
//   1. Speaks the MCP Apps postMessage protocol to the host (ui/initialize,
//      ui/notifications/*), per the 2026-01-26 specification.
//   2. Answers the pages' own routes — `/mermaid/api/state`, `/markdown/api/back` — against
//      the server's HTTP origin, which a sandboxed page is allowed to reach. They are not
//      tool calls: this surface declares only the two render tool names the contract names,
//      and viewer navigation is not one of them.
//   3. Replaces `EventSource` with a poller. The Apps protocol pushes a notification for the
//      tool result that opened the app, but nothing equivalent to a server-sent stream, so
//      the view is polled instead. Polling a local server is cheap.
//
// Everything degrades: with no host and no origin, the pages show their empty state instead
// of throwing.

(function () {
  "use strict";

  var originalFetch = window.fetch ? window.fetch.bind(window) : null;
  var ORIGIN = window.__DELIVERY_HTTP_ORIGIN__ || "";
  var POLL_MS = 2000;

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
        // Not running inside a host, or the host declined. The page then renders its normal
        // empty state.
        return null;
      });
    return connected;
  }

  // --- fetch shim ---------------------------------------------------------------------

  var ROUTES = [
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

  // The pages open `/mermaid|markdown/events` and listen for "view" and "clear". Poll the
  // state route and emit the same events, only when the payload actually changed, so
  // re-renders stay as rare as they were with SSE.
  function BridgeEventSource(url) {
    var self = this;
    this.url = url;
    this.readyState = 1;
    this._listeners = Object.create(null);
    this._last = null;

    // The pages append `?instance=…&token=…`, so match on the path alone.
    var viewer = /^\/(mermaid|markdown)\/events$/.exec(String(url).split("?")[0]);
    var poll = function () {
      if (!viewer) return Promise.resolve();
      return httpJson("/" + viewer[1] + "/api/state").then(function (view) {
        var serialized = JSON.stringify(view || null);
        if (serialized === self._last) return;
        self._last = serialized;
        if (!view || !view.title) self._emit("clear", "{}");
        else self._emit("view", serialized);
      });
    };
    // The host also pushes the result of the tool that opened this app; use it so the first
    // paint does not wait for a poll tick.
    toolResultHandlers.push(function () {
      poll().catch(function () {});
    });

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
