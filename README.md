# agent-workspace

**Consolidated control plane for the iOS-builder Ralph loop.**

This repo ties together every moving part of the managedcoworkers / knowledge-engineering
build effort. If context is lost (compaction, new session, new operator) — start here.

```
 edit Swift  ──▶  gh-commit-relay (push)  ──▶  GitHub Actions macos-latest  ──▶  IPA / errors
     ▲                                                                               │
     └───────────────────────────  fix, repeat  ◀──────────────────────────────────┘
```

## Quick start after compaction

1. `docs/HYDRATION.md` — restore full context from KV memory store
2. `docs/OUTCOMES.md` — the complete Ralph-loop goal spec
3. `docs/breadcrumbs/INDEX.md` — every object ID (CF account, KV, workers, routes)
4. `ops/loop/STATE.md` — current loop phase and next action

## Repository map

| Path | Purpose |
|---|---|
| `docs/OUTCOMES.md` | Full spec of everything to achieve with the Ralph loop |
| `docs/HYDRATION.md` | How to restore context from KV after compaction |
| `docs/breadcrumbs/INDEX.md` | Every CF + container + GitHub object ID |
| `ops/loop/STATE.md` | Loop state machine + current phase |
| `ops/relay/RELAY.md` | gh-commit-relay usage (push to GitHub without local token) |
| `memory/` | Mirror of the 8 KV hydration memories |
| `apps/` | References to the 3 product repos |
| `tools/ios-builder/` | ios-builder source (cloned, .git stripped) |
| `tools/mobai-mcp/` | mobai-mcp source (cloned, .git stripped) |
| `.github/workflows/ios-build.yml` | The embedded iOS build workflow |

## Product repos

| Repo | App# | Stack | Live? |
|---|---|---|---|
| [subagentceo/coworkers-native](https://github.com/subagentceo/coworkers-native) | 16 | iOS 18 Swift 6 | source pushed |
| [subagentceo/xcode-ai](https://github.com/subagentceo/xcode-ai) | 19 | Xcode 26 extension | source pushed |
| [subagentceo/sandbox-agent](https://github.com/subagentceo/sandbox-agent) | 20 | CF Worker | deployed live |

## Hard constraints (do not re-litigate)

- **No local Swift.** musl libc + 2 GB disk. Proven dead end. Use GitHub Actions only.
- **No in-Worker `eval()`.** CF blocks permanently. `unsafe_eval` is not a real flag.
- **workers.dev disabled** account-wide. All workers need zone routes.
- **GitHub pushes** go through `gh-commit-relay` Worker (holds the GITHUB_TOKEN).
