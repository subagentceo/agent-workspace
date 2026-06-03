# Ralph Loop — Current State

## Phase: 1.1 — Wire ios-build workflow ⚠️ IN PROGRESS

### Done
- [x] coworkers-native: 11 Swift source files pushed
- [x] xcode-ai: 3 files pushed
- [x] sandbox-agent: deployed live at sandbox.agentknowledgeworkers.com
- [x] ios-builder: cloned, built (16 MB Go binary), all tests pass
- [x] mobai-mcp: cloned, built (Node 20), MCP handshake verified
- [x] gh-commit-relay: operational (4 batches × multiple files all committed)
- [x] Memory store: 8 KV entries written, hydration dry-run verified
- [x] agent-workspace repo: created + fully populated (this repo)
- [x] OUTCOMES.md: all 8 phases + 17 outcomes documented

### Immediate next action

**Push ios-build.yml + builder.json to coworkers-native, then trigger build.**

Files to push (both via gh-commit-relay):
1. `.github/workflows/ios-build.yml` ← from `tools/ios-builder/internal/workflow/templates/ios-build.yml`
2. `builder.json` ← `{"project":"CoworkersNative","platform":"ios","github":{"owner":"subagentceo","repo":"coworkers-native"},"ios":{"path":".","scheme":""}}`

Then trigger workflow via GitHub API (relay worker holds GITHUB_TOKEN):
```
POST /repos/subagentceo/coworkers-native/actions/workflows/ios-build.yml/dispatches
{"ref":"main","inputs":{"build_id":"run_001","ios_path":".","scheme":"","configuration":"Debug"}}
```

Then poll and read errors.

### Run history

| Run | Time | Result | Errors |
|---|---|---|---|
| (none yet) | — | — | — |

---

## Phase overview

| Phase | Description | Status |
|---|---|---|
| 1.1 | Wire workflow into coworkers-native | ⚠️ IN PROGRESS |
| 1.2 | First workflow trigger | ⏳ |
| 1.3 | Read first compile errors | ⏳ |
| 1.4 | First green build + IPA | ⏳ |
| 2.x | IPA structure + Swift 6 clean | ⏳ |
| 3.x | On-device install (Claude Desktop + MobAI) | ⏳ |
| 4.x | Login + AI conversation on device | ⏳ |
| 5.x | Widget + Share Extension | ⏳ |
| 6.x | XcodeAI in Xcode 26 | ⏳ |
| 7.x | SandboxAgent execution fixed | ⏳ |
| 8.x | Consolidation + handoff | ⏳ |
