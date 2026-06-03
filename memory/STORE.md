# Memory Store Mirror

This is a human-readable mirror of the live hydration memory store. The **authoritative**
copy lives in Cloudflare KV; this file is a snapshot for offline reading and git history.

- **KV namespace:** `6db7fc3e28e04dc8bf85848faa369576` ("ke-memory-store")
- **Account:** `e6294e3ea89f8207af387d459824aaae`
- **Store index key:** `memory_store:ms_ke_ios_builder_loop`
- **Schema:** mirrors `MemoryStore` / `Memory` from `managed_agents.py` (path + content + version + timestamps)

To read the live store, see `docs/HYDRATION.md`. To re-sync this mirror, see `memory/sync.md`.

---

## memory:project/mission

```
PROJECT: Build + test the CoworkersNative iOS app (App 16) without a Mac, via a Ralph loop.
The loop edits Swift source, pushes to GitHub, and uses GitHub Actions macOS runners
(driven by the ios-builder Go CLI) to compile to an IPA. Local Swift compilation is
IMPOSSIBLE in this container (proven: musl libc + 2GB disk). GitHub Actions is the only build surface.

20-app roadmap context: apps 16 (CoworkersNative iOS native), 19 (XcodeAI extension),
20 (SandboxAgent worker) are the active three. All backed by coworkers-agent Worker
(Workers AI @cf/meta/llama-3.1-8b-instruct, no Anthropic key).
```

## memory:env/container-constraints

```
CONTAINER (Firecracker microVM, this session):
- OS: Alpine Linux 3.19, musl libc, x86_64
- Disk: 2GB total, ~1GB free — CANNOT hold Swift toolchain (2.5GB extracted)
- Node: v20.15.1 (works). Go: installed via 'apk add go' then GOTOOLCHAIN=auto pulls 1.24.
- DO_ID: 8779a4fbeaba54e81591edd0234035d79df0826f04c561edadde75032305
- CLOUDFLARE_APPLICATION_ID: 08c9c460-5792-4faa-848c-c5b7a79b8a12
- Location: gig02 (Brazil, SAM region), kernel 6.12.81-cloudflare-firecracker-2026.4.25

SWIFT INSTALL VERDICT (proven deterministically):
- swiftly binary runs (static) BUT 'swiftly init' => "Error: Unsupported Linux platform" (rejects musl/Alpine)
- Swift toolchain needs glibc (/lib64/ld-linux-x86-64.so.2). gcompat shim DID get the loader past ABI,
  remaining errors were only missing sibling .so (single-binary extract), NOT an ABI failure.
- BLOCKER 1: musl not glibc (no official musl Swift). BLOCKER 2: 2GB disk too small.
- CONCLUSION: Do NOT compile Swift locally. Use GitHub Actions macOS runners via ios-builder.
- A glibc Ubuntu image + bigger disk COULD run Swift Linux for pure-logic typecheck, but not here.
```

## memory:cloudflare/account

```
CF ACCOUNT (alex): e6294e3ea89f8207af387d459824aaae
Auth emails allowlist: admin@jadecli.com, alex@jadecli.com, zhouk.alex@gmail.com
workers.dev DISABLED at account level — ALL workers 403 on *.workers.dev. Must use zone routes.
Zone agentknowledgeworkers.com: ea55e090c620a2da4ec1dfa89872c7f8
Session cookie format: s=base64({email,ts})  (24h expiry)
```

## memory:cloudflare/deployed-workers

```
LIVE WORKERS (all verified via HTTP proof):
- coworkers-agent: agentknowledgeworkers.com — health/login/plugins/chat ALL PASS.
  KV fb6b8ec36e00493dbd199c626d2c70f5. AI binding. Plugins: default,legal,finance,engineering,data,sales.
- sandbox-agent: sandbox.agentknowledgeworkers.com — health/login/AI-codegen PASS.
  KV cd31beacf6704b09b8962ba4cc963745. Route c8f808000f3b40098b0cd58a68fc883f.
  KNOWN LIMIT: in-Worker eval()/new Function() PERMANENTLY blocked by CF (no flag fixes it — "unsafe_eval" is NOT a real flag).
  Real execution must use Containers (ContainerMcpAgent DO) or browser-side eval. AI generation + SSE + KV history all work.
- www.agentknowledgeworkers.com — Pages project, serves the app HTML.

GITHUB RELAY (how we push to GitHub without a local token):
- Worker 'gh-commit-relay' (account alex): reads KV key 'commit-jobs' (JSON array), PUTs each to
  GitHub Contents API using GITHUB_TOKEN secret, writes results to KV key 'commit-results'.
  KV namespace for relay: 847586f6b96f4edd820f31814e9bcac8. Secret store: 565244614fc34be7aa8488ce46112f60.
  Job shape: {repo:"owner/name", path, message, branch:"main", contentB64} OR {source:"kv", kvKey}.
  Trigger via route: https://tools.agentknowledgeworkers.com/relay  (GET runs it).
- Worker 'repo-creator': creates repos under an org + initial README. Route /repo-creator. Same token.
- Worker 'repo-verify': lists repo files via authed GitHub API. Route /verify.
- b64 helper for these workers: TextEncoder -> String.fromCharCode -> btoa (btoa alone breaks on non-Latin1).
```

## memory:github/repos

```
GITHUB ORG: subagentceo  (repos created + verified live)
- subagentceo/coworkers-native (App 16, iOS Swift): Package.swift, ARCHITECTURE.md, README.md,
  Sources/CoworkersNative/{Models/AppState.swift, Services/{AuthService,APIClient}.swift,
  Views/ContentView.swift, Widget/CoworkersWidget.swift, openapi.yaml, openapi-generator-config.yaml},
  Sources/ShareExtension/ShareViewController.swift  (11 files)
  NOTE: AllViews.swift (ConversationsView+ChatView+MemoryView) written locally but NOT yet pushed; verify.
  NOTE: VoiceInputService.swift written locally; verify if pushed.
- subagentceo/xcode-ai (App 19): XcodeAI/XcodeExtension/{XcodeAIExtension.swift, Info.plist}, README.md (3 files)
- subagentceo/sandbox-agent (App 20): src/worker.js, wrangler.jsonc, ARCHITECTURE.md, README.md (4 files)

OTHER REPO (this memory pattern's reference):
- subagentceo/knowledge-engineering @ branch claude/dreamy-noether-VEIgr
  apps/api-core/src/ke_api_core/managed_agents.py = canonical Managed Agents API types
  (managed-agents-2026-04-01 beta header; MemoryStore/Memory schema this store mirrors).
```

## memory:tools/mobai

```
CLONED + STRIPPED (.git and upstream removed), probed deterministically in container at /tmp:

mobai-mcp (github.com/MobAI-App/mobai-mcp) — TypeScript MCP server, v2.3.0:
- BUILDS here: npm install && npm run build => dist/index.js. RUNS here: completed MCP initialize + tools/list over stdio.
- It is a thin stdio proxy to MobAI desktop app at http://127.0.0.1:8686/api/v1.
- Tools: list_devices, get_device, start_bridge, stop_bridge, get_screenshot, save_screenshot,
  list_apps, install_app, uninstall_app, debug_app, execute_dsl (PRIMARY), test_* .
- NEEDS later (Claude Desktop/macOS): MobAI desktop app running + physical iOS device. Device tools are no-ops without it.

ios-builder (github.com/MobAI-App/ios-builder) — Go 1.24 CLI:
- BUILDS here: 'apk add go' (1.21) then GOTOOLCHAIN=auto GOFLAGS=-mod=mod 'go build -o builder ./cmd/builder' => 16MB binary. 'go test ./...' all pass.
- Builds iOS apps on GitHub Actions macos-latest runners — NO Mac needed. Embeds .github/workflows/ios-build.yml.
- Commands: 'builder auth github' (OAuth device flow — needs interactive browser => Claude Desktop step),
  'builder init' (detects git remote, writes workflow + builder.json),
  'builder ios build' (triggers workflow_dispatch, polls, downloads IPA to ./dist/),
  'builder dev flutter|rn' (hot reload via MobAI — needs device).
- mobai client default base URL: http://localhost:8686 (internal/mobai/client.go).
- Workflow: runs on macos-latest, setup-xcode, detects flutter/rn/expo/native, builds UNSIGNED IPA
  (CODE_SIGNING_ALLOWED=NO), uploads artifact 7-day retention. Signing optional via secrets.
```

## memory:loop/architecture

```
RALPH LOOP DESIGN (the goal):
1. Edit Swift source in subagentceo/coworkers-native (push via gh-commit-relay KV jobs).
2. GitHub Actions macos-latest compiles via ios-build.yml (added by 'builder init').
3. Poll build status (GitHub Actions API via a relay-style worker with the token).
4. Download IPA artifact OR read compile errors.
5. Fix errors, repeat.

EXECUTION BOUNDARY:
- CAN do here now: build/run ios-builder + mobai-mcp; run 'builder init'; trigger 'builder ios build'
  (only needs a GitHub token, which the relay workers already hold); read compile errors back.
- NEEDS Claude Desktop + macOS + MobAI + physical device later: 'builder auth github' interactive OAuth,
  any mobai-mcp device tool, 'builder dev' hot reload, on-device install/launch/screenshot/test.

NEXT STEP when resuming: wire ios-builder into coworkers-native — either run 'builder init' against a
local clone and push the generated .github/workflows/ios-build.yml via the relay, OR write that workflow
file directly into the repo via a commit-job. Then trigger a real macOS build and read back errors.
```

## memory:hydration/instructions

```
HOW TO HYDRATE AFTER COMPACTION:
1. Read this entire memory store from KV namespace 6db7fc3e28e04dc8bf85848faa369576 on CF account
   e6294e3ea89f8207af387d459824aaae. List keys with prefix "memory:" then GET each.
   (Via Cloudflare API:execute — GET /accounts/{acct}/storage/kv/namespaces/{ns}/keys?prefix=memory:
    then GET .../values/{key} for each.)
2. The store index is at key "memory_store:ms_ke_ios_builder_loop".
3. Paths to read in order: project/mission, env/container-constraints, cloudflare/account,
   cloudflare/deployed-workers, github/repos, tools/mobai, loop/architecture, then this.
4. After reading, you will know: what's built, what's blocked (local Swift), what works (GitHub Actions path),
   and the exact next step (wire ios-builder into coworkers-native).
5. Do NOT re-attempt local Swift compile or in-Worker eval — both proven dead ends.
```
