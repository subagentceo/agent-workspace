# Build Tools

Two repos cloned from MobAI-App, .git and upstream stripped. Enable building/testing the iOS app without a Mac.

## ios-builder — `tools/ios-builder/`
Go 1.24 CLI. Triggers GitHub Actions macos-latest builds, downloads IPA.
- **Build:** `apk add go && GOTOOLCHAIN=auto go build -o builder ./cmd/builder` → 16 MB binary ✅
- **Tests:** `go test ./...` all pass ✅
- **Can do now:** `builder init`, trigger via workflow_dispatch API
- **Needs later:** `builder auth github` (interactive OAuth, Claude Desktop)

## mobai-mcp — `tools/mobai-mcp/`
TypeScript/Node 20 MCP server. On-device iOS control via MobAI desktop app.
- **Build:** `npm install && npm run build` → `dist/index.js` ✅
- **MCP init:** initialize + tools/list verified over stdio ✅
- **Can do now:** Build, run, inspect tools
- **Needs later:** MobAI desktop at 127.0.0.1:8686 + physical iOS device
