# Start

<!--
Copy to `.claude/start.md` and fill in. Only `## Start` and `## Open` are needed — delete
every other section unless you want it. Never put a secret here.
Read by the `start` skill: plugins/claude-desktop/skills/start/SKILL.md
-->

## Start

```bash
aspire run
```

## Open

- `https://localhost:7080` — the web front end.

---

<!-- Everything below is optional. -->

## Prerequisites

- A running container runtime.

## Healthy When

- All AppHost resources reach `Running`.
- Known benign: one `Detected container runtime restart` warning on first start.

## Sign In

- Seeded `qa@example.test`; password in the `ORDERS_QA_PASSWORD` environment variable, from
  the secret store entry `orders/local-qa`. Pointer only — never the value.
- Faster: `dotnet run --project tools/DevLogin` writes a signed-in session cookie.

## Go To

<!-- Area — route — the source path it owns. Used to land on what your branch changes. -->

- Orders — `/orders` — `src/Orders.Web/Pages/Orders/`
- Admin — `/admin/settings` — `src/Orders.Admin/`, needs the `admin` role

## Stop

- `Ctrl+C` stops every resource; volumes persist.

## Troubleshooting

- Port in use — another worktree's app is running; stop that one first.
