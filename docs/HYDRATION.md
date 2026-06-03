# Hydration Guide

Restore full context after a compaction event or new session.

## Memory store location

- **CF Account:** `e6294e3ea89f8207af387d459824aaae` (Alex@jadecli.com)
- **KV Namespace:** `6db7fc3e28e04dc8bf85848faa369576` (named `ke-memory-store`)
- **Store ID:** `ms_ke_ios_builder_loop`

## Step 1 — Read the 8 KV memory entries

Via Cloudflare API:execute (account e6294e3ea89f8207af387d459824aaae):
```
GET /accounts/{acct}/storage/kv/namespaces/6db7fc3e28e04dc8bf85848faa369576/keys?prefix=memory:
```
Then GET each `memory:<path>` value. Read in this order:

1. `memory:project/mission` — what we're building
2. `memory:env/container-constraints` — **Swift dead-end proof (do not retry)**
3. `memory:cloudflare/account` — account, zone, cookie format
4. `memory:cloudflare/deployed-workers` — live workers + relay mechanism
5. `memory:github/repos` — repo inventory
6. `memory:tools/mobai` — ios-builder + mobai-mcp probes
7. `memory:loop/architecture` — loop design + exact next step
8. `memory:hydration/instructions` — this procedure

## Step 2 — Read this repo

- `docs/OUTCOMES.md` — full goal spec
- `ops/loop/STATE.md` — current loop phase
- `docs/breadcrumbs/INDEX.md` — all object IDs

## Step 3 — Verify relay is live

```bash
curl -s https://tools.agentknowledgeworkers.com/relay
# expected: ok
```

## Do NOT retry these dead ends

| Dead end | Evidence | Rule |
|---|---|---|
| Local Swift compile | `swiftly init` → "Unsupported Linux platform"; 2 GB disk | Never. GitHub Actions only. |
| In-Worker `eval()` | CF CSP blocks permanently; `unsafe_eval` flag does not exist | Never. Browser-side or DO. |
| workers.dev URLs | Disabled account-wide | Always use zone routes. |
