# tools/ — Cloned Build Tools (probe results)

Two tools from MobAI-App, cloned and stripped of `.git` + upstream remotes. Both were
built and probed deterministically in the container. This documents exactly what runs
here vs. what needs Claude Desktop + macOS + a device later.

They are not vendored into this repo (Go/Node trees are large); re-clone per `docs/HYDRATION.md`.

---

## ios-builder (github.com/MobAI-App/ios-builder)

**Go 1.24 CLI. Builds iOS apps on GitHub Actions macOS runners — no Mac needed.**

| Probe | Result |
|---|---|
| Build in container | OK: `apk add go` (1.21) then `GOTOOLCHAIN=auto GOFLAGS=-mod=mod go build -o builder ./cmd/builder` -> 16 MB binary |
| `go test ./...` | OK: all pass (config, dev packages) |
| `./builder --help` | OK |
| Embedded workflow | `internal/workflow/templates/ios-build.yml` (copied to this repo's `.github/workflows/`) |

**Commands:**
- `builder auth github` — OAuth device flow. NEEDS interactive browser -> Claude Desktop step.
- `builder init` — detects git remote, writes workflow + `builder.json`. Runs in container.
- `builder ios build` — triggers `workflow_dispatch`, polls, downloads IPA to `./dist/`. Needs only a token.
- `builder dev flutter|rn` — hot reload via MobAI. NEEDS device.

**mobai client base URL:** `http://localhost:8686` (`internal/mobai/client.go`).

---

## mobai-mcp (github.com/MobAI-App/mobai-mcp)

**TypeScript MCP server v2.3.0. Thin stdio proxy to the MobAI desktop app at 127.0.0.1:8686.**

| Probe | Result |
|---|---|
| Build in container | OK: `npm install && npm run build` -> `dist/index.js` |
| Run in container | OK: completed MCP `initialize` + returned full `tools/list` over stdio |
| Device tools | NEED the MobAI desktop app + a physical device |

**Tools:** `list_devices`, `get_device`, `start_bridge`, `stop_bridge`, `get_screenshot`,
`save_screenshot`, `list_apps`, `install_app`, `uninstall_app`, `debug_app`,
`execute_dsl` (primary), `test_get_active`, `test_list_projects`, `test_run`.

---

## Execution boundary (the key table)

| Capability | Here (container) | Needs Claude Desktop + macOS + MobAI + device |
|---|---|---|
| Build ios-builder / mobai-mcp | YES | |
| `builder init` (write workflow) | YES | |
| `builder ios build` (remote macOS build, download IPA) | YES (token only) | |
| Read compile errors from Actions logs | YES | |
| `builder auth github` (interactive OAuth) | | YES |
| `install_app` / launch / screenshot / `execute_dsl` | | YES |
| `builder dev` hot reload | | YES |
| On-device smoke test (`.mob`) | | YES |

**Bottom line:** the entire compile loop (edit -> build -> IPA / errors) runs from here.
Only actually running the app on a device is the Desktop step.
