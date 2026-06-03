# Breadcrumbs — Every Object ID

Exact identifiers for every Cloudflare, container, and GitHub object in this project.
This is the lookup table. Treat as sensitive.

## Cloudflare account

| Thing | Value |
|---|---|
| Account (alex) | `e6294e3ea89f8207af387d459824aaae` |
| Account (admin) | `f0d57a2b99e45522265df86a1fa77db5` |
| Zone agentknowledgeworkers.com | `ea55e090c620a2da4ec1dfa89872c7f8` |
| Auth email allowlist | admin@jadecli.com, alex@jadecli.com, zhouk.alex@gmail.com |
| Session cookie | `s=base64({email,ts})`, 24h expiry |
| workers.dev | DISABLED account-wide — use zone routes only |

## Cloudflare Workers (live)

| Worker | Hostname / route | KV | Notes |
|---|---|---|---|
| coworkers-agent | agentknowledgeworkers.com | `fb6b8ec36e00493dbd199c626d2c70f5` | AI binding; plugins: default,legal,finance,engineering,data,sales |
| sandbox-agent | sandbox.agentknowledgeworkers.com | `cd31beacf6704b09b8962ba4cc963745` | route `c8f808000f3b40098b0cd58a68fc883f`; in-Worker eval blocked |
| gh-commit-relay | tools.agentknowledgeworkers.com/relay | `847586f6b96f4edd820f31814e9bcac8` | pushes to GitHub; holds token |
| repo-creator | tools.agentknowledgeworkers.com/repo-creator | (shares relay KV) | creates org repos |
| repo-verify | tools.agentknowledgeworkers.com/verify | (shares relay KV) | lists repo files (authed) |
| www (Pages) | www.agentknowledgeworkers.com | — | serves app HTML |

## Cloudflare secrets / KV

| Thing | Value |
|---|---|
| Secrets store | `565244614fc34be7aa8488ce46112f60` |
| Secret name (GitHub token) | `GITHUB_TOKEN` |
| Relay job queue KV | `847586f6b96f4edd820f31814e9bcac8` |
| Memory store KV | `6db7fc3e28e04dc8bf85848faa369576` |
| Memory store index key | `memory_store:ms_ke_ios_builder_loop` |

## Container (Firecracker microVM)

| Thing | Value |
|---|---|
| OS | Alpine Linux 3.19, musl libc, x86_64 |
| Disk | 2 GB total (~1 GB free) |
| Node | v20.15.1 |
| Go | `apk add go` -> 1.21; `GOTOOLCHAIN=auto` pulls 1.24 |
| DO_ID | `8779a4fbeaba54e81591edd0234035d79df0826f04c561edadde75032305` |
| APPLICATION_ID | `08c9c460-5792-4faa-848c-c5b7a79b8a12` |
| Location / kernel | gig02 (SAM) / 6.12.81-cloudflare-firecracker-2026.4.25 |
| NOTE | container filesystem resets between sessions — do not rely on /tmp persistence |

## GitHub (org: subagentceo)

| Repo | Purpose |
|---|---|
| coworkers-native | App 16 — iOS 18 Swift app |
| xcode-ai | App 19 — Xcode 26 extension |
| sandbox-agent | App 20 — CF Worker |
| agent-workspace | THIS repo — consolidation / control plane |
| knowledge-engineering @ claude/dreamy-noether-VEIgr | canonical managed_agents.py (memory schema) |

## Push mechanism (gh-commit-relay)

Job written to KV key `commit-jobs` (JSON array):
```json
{ "repo": "subagentceo/coworkers-native", "path": "x/y.swift",
  "message": "msg", "branch": "main", "contentB64": "<base64>" }
```
or `{ "source": "kv", "kvKey": "<key>", "repo": "...", "path": "..." }`.
Trigger: `GET https://tools.agentknowledgeworkers.com/relay`. Results in KV key `commit-results`.
b64 helper (non-Latin1 safe): `TextEncoder -> String.fromCharCode -> btoa`.
