# Ralph Loop — Full Outcomes Spec

Everything to achieve with the Ralph loop, in order. Each outcome is atomic and verifiable.

---

## Phase 1 — First Green Build

**Goal:** Produce a compiled, unsigned IPA of CoworkersNative via GitHub Actions macos-latest.

### 1.1 — Workflow wired ⚠️ IN PROGRESS
- `.github/workflows/ios-build.yml` pushed to `subagentceo/coworkers-native`
- `builder.json` pushed: `{"project":"CoworkersNative","platform":"ios","github":{"owner":"subagentceo","repo":"coworkers-native"},"ios":{"path":".","scheme":""}}`

### 1.2 — First workflow trigger
- `workflow_dispatch` fired against `subagentceo/coworkers-native`
- GitHub Actions run ID captured
- Build log streaming begins

### 1.3 — First compile errors read back
- Xcode build log downloaded from Actions artifact
- Every Swift compiler error: `{file, line, col, severity, message}`
- Errors written to `ops/loop/errors/run_001.json`

### 1.4 — First green build
- All Swift errors resolved (push fixes via relay)
- Unsigned IPA artifact produced by macos-latest runner
- IPA downloaded to `ops/loop/dist/CoworkersNative_001.ipa`

---

## Phase 2 — App is structurally correct

### 2.1 — IPA structure verified
- `Payload/CoworkersNative.app/` confirmed in IPA
- `Info.plist`: correct bundle ID, NSAppTransportSecurity allows agentknowledgeworkers.com
- Widget extension: `PlugIns/CoworkersWidget.appex`
- Share extension: `PlugIns/ShareExtension.appex`

### 2.2 — OpenAPI client generated clean
- `openapi.yaml` passes swift-openapi-generator validation
- Generated client compiles, covers: login, plugins, conversations, chat, memory

### 2.3 — Swift 6 strict concurrency clean
- Zero `@preconcurrency` suppressions
- All `@MainActor` / `actor` boundaries correct
- `swift build -strict-concurrency=complete` exits 0

---

## Phase 3 — On-device install (needs Claude Desktop + MobAI)

### 3.1 — builder auth complete
- `builder auth github` OAuth device flow completed interactively on Claude Desktop
- Token stored in macOS Keychain

### 3.2 — IPA re-signed for device
- iCloud personal team re-sign via MobAI
- Bundle ID: `com.managedcoworkers.native.TEAMID`
- App Group: `group.com.managedcoworkers.native.TEAMID`

### 3.3 — App installs and launches
- `mobai-mcp:install_app` completes
- `execute_dsl open_app` launches CoworkersNative
- `get_screenshot` returns login screen → saved to `ops/loop/screenshots/launch_001.png`

---

## Phase 4 — Login and first AI conversation (Claude Desktop + MobAI)

### 4.1 — Login flow works
- DSL: tap email field → type `alex@jadecli.com` → tap sign-in
- App transitions to conversations tab
- Session cookie stored in iOS Keychain

### 4.2 — Conversations load
- Conversations tab populated from `GET /api/conversations`
- Plugin chips visible (default, legal, finance, etc.)

### 4.3 — Send message, get AI response
- DSL: new conversation → type "Hello, what can you help me with today?" → send
- Workers AI `@cf/meta/llama-3.1-8b-instruct` responds
- Round-trip latency < 10s

### 4.4 — Memory tab works
- `POST /api/memory` from within app adds an entry
- Entry appears in Memory tab

---

## Phase 5 — Widget and Share Extension

### 5.1 — Widget on home screen
- Appears in iOS widget picker as "Quick Ask"
- Taps deeplink to `coworkers://new`
- App Group sync confirmed: shows last conversation title

### 5.2 — Share Extension
- Share URL from Safari → Coworkers
- ShareViewController creates conversation + sends to `POST /api/chat`
- Extension completes without error

---

## Phase 6 — XcodeAI extension (App 19)

### 6.1 — Extension loads in Xcode 26
- All 7 commands listed in Xcode → Settings → Extensions

### 6.2 — First command round-trip
- Select Swift code → "Explain Selected Code"
- Calls `POST /api/chat` with `plugin: engineering`
- Result inserted as `///` comments above selection, < 15s

---

## Phase 7 — SandboxAgent execution fixed (App 20)

### 7.1 — Execution engine replaced
- `new Function()` removed (blocked by CF CSP permanently)
- Replaced with browser-side execution (iframe sandbox in app HTML)
- Fibonacci test: AI generates code → browser executes → stdout `[0,1,1,2,3,5,8,13]`

### 7.2 — SHA-256 test
- `crypto.subtle.digest` code generated + executed in browser context
- Correct hash verified

---

## Phase 8 — Consolidation

### 8.1 — This repo complete
- Memory entries current, breadcrumbs verified live, all phases checked off

### 8.2 — Claude Desktop can take over
- Reads this repo → picks up at next unchecked outcome with zero re-derivation

---

## Status

- Phase 1.1: ⚠️ IN PROGRESS (push workflow → trigger build)
- All others: ⏳ pending
