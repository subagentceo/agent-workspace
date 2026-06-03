# agent-workspace

**Consolidated control plane for the iOS-builder Ralph loop.**

This repo is the single source of truth that ties together every moving part of the
managedcoworkers / knowledge-engineering build effort: the three product repos, the
two cloned build tools, the Cloudflare objects, the container environment, and the
hydration memory store. If context is lost (compaction, new session, new operator),
start here.

---

## What this is

We are building and testing **CoworkersNative** (an iOS 18 Swift app) without a Mac.
Local Swift compilation is impossible in our Linux container (proven: musl libc + 2 GB
disk). The only viable build surface is **GitHub Actions macOS runners**, driven by the
**ios-builder** Go CLI. This repo orchestrates that loop.

```
  edit Swift  --->  push (gh-commit-relay)  --->  GitHub Actions macos-latest  --->  IPA / errors
      ^                                                                              |
      +-------------------------------  fix, repeat  <-------------------------------+
```

---

## Repository map

| Path | Purpose |
|---|---|
| `docs/` | Architecture, the full Ralph-loop outcomes spec, execution boundary |
| `docs/breadcrumbs/` | Exact IDs for every Cloudflare + container + GitHub object |
| `memory/` | Mirror of the hydration memory store (KV `6db7fc3e...`) |
| `ops/loop/` | The Ralph loop runner spec + state machine |
| `ops/relay/` | How to push to GitHub with no local token (gh-commit-relay) |
| `apps/` | Pointers to the three product repos |
| `tools/` | Pointers + probe results for mobai-mcp and ios-builder |
| `.github/workflows/` | The iOS build workflow (ios-build.yml) |

---

## The three product repos

| Repo | App | Stack | Status |
|---|---|---|---|
| [subagentceo/coworkers-native](https://github.com/subagentceo/coworkers-native) | 16 | iOS 18 Swift 6 | source pushed; needs macOS build |
| [subagentceo/xcode-ai](https://github.com/subagentceo/xcode-ai) | 19 | Xcode 26 extension | source pushed |
| [subagentceo/sandbox-agent](https://github.com/subagentceo/sandbox-agent) | 20 | CF Worker | deployed live |

## The two build tools (cloned, stripped of .git/upstream)

| Tool | Origin | Runs in container? | Role |
|---|---|---|---|
| `ios-builder` | MobAI-App/ios-builder | Yes (Go 1.24) | Triggers macOS GitHub Actions builds, downloads IPA |
| `mobai-mcp` | MobAI-App/mobai-mcp | Yes (Node 20) | MCP server for on-device control (needs MobAI desktop later) |

---

## Quick start (resuming work)

1. Read `docs/HYDRATION.md` — restores full context.
2. Read `docs/OUTCOMES.md` — the complete Ralph-loop goal spec.
3. Read `docs/breadcrumbs/INDEX.md` — every object ID you need.
4. Continue from the current loop phase in `ops/loop/STATE.md`.

## Hard-won facts (do not re-litigate)

- **No local Swift build.** musl != glibc, 2 GB disk. Use GitHub Actions.
- **No in-Worker `eval()`.** CF blocks it permanently; `unsafe_eval` is not a real flag.
- **workers.dev is disabled** on the account; use zone routes only.
- **GitHub pushes** go through the `gh-commit-relay` Worker (it holds the token).
