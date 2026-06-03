# Ralph Loop — Full Outcomes Specification

This is the complete set of outcomes the iOS-builder Ralph loop is designed to achieve.
Each outcome is a verifiable end state, not a task. The loop runs until every P0 outcome
is met, then continues to P1/P2 as capacity allows. "Verified" means proven by a command
or HTTP response, never assumed.

---

## Definitions

- **Ralph loop**: an autonomous edit->build->observe->fix cycle. Each iteration makes one
  coherent change, pushes it, triggers a remote build, reads the result, and decides the
  next change. State persists across iterations in `ops/loop/STATE.md` and the KV memory store.
- **Build surface**: GitHub Actions `macos-latest` runner. The ONLY place Swift/Xcode can compile.
- **Push surface**: the `gh-commit-relay` Worker (holds the GitHub token).
- **Verdict source**: the GitHub Actions run conclusion + downloaded artifact (IPA) or logs.

---

## P0 — Must achieve (loop does not stop until all green)

### O1. Workflow wired into coworkers-native
`.github/workflows/ios-build.yml` exists in `subagentceo/coworkers-native` on `main`,
is valid YAML, and is triggerable via `workflow_dispatch`.
**Verify:** GET the file via GitHub API returns 200; Actions tab lists the workflow.

### O2. First remote build triggered and observed
A `workflow_dispatch` run starts on `macos-latest` and reaches a terminal conclusion
(`success` or `failure`) that we can read.
**Verify:** runs API returns a run with a `conclusion` for our `build_id`.

### O3. Compile errors are legible to the loop
When a build fails, the loop can fetch job logs and extract Swift compiler diagnostics
(file, line, message) so the next iteration can act on them.
**Verify:** logs API returns text; loop parses >=1 structured error on a known-bad build.

### O4. Clean compile of the Swift package
The Swift sources compile without error on the macOS runner (SwiftPM `swift build` for the
library target, and `xcodebuild` for the app target once an Xcode project is present).
**Verify:** a build run concludes `success`; logs show `Build complete!` / `BUILD SUCCEEDED`.

### O5. IPA artifact produced and retrievable
The workflow uploads an `.ipa` (unsigned, `CODE_SIGNING_ALLOWED=NO`) as an artifact,
and the loop downloads it into `./dist/`.
**Verify:** artifacts API lists an `ipa` >0 bytes; `unzip -l` shows `Payload/*.app`.

---

## P1 — Should achieve

### O6. Three-target build integrity
App target, `ShareExtension`, and `CoworkersWidget` all compile together (shared App Group + Keychain group).
**Verify:** build logs show all three targets BUILD SUCCEEDED.

### O7. OpenAPI client generation works in CI
`swift-openapi-generator` plugin runs during build and produces the typed client from `openapi.yaml`.
**Verify:** logs show generator ran; no `prepareForBuild` failures.

### O8. Deterministic, cached incremental builds
Later builds restore DerivedData from cache and are faster, with identical conclusions.
**Verify:** cache-hit line in logs; build #2 wall-time < build #1.

### O9. Loop self-heals from a seeded error
Given a deliberately introduced compile error, the loop detects (O3), fixes, pushes, and the
next build returns to `success` with no human input.
**Verify:** a red->green transition recorded in STATE.md with both run IDs.

---

## P2 — Stretch (needs Claude Desktop + macOS + MobAI + device)

### O10. On-device install
Produced IPA installs on a connected device via mobai-mcp `install_app`.
**Boundary:** requires MobAI desktop at 127.0.0.1:8686 + real device. Not possible in-container.

### O11. On-device launch + screenshot
App launches (`execute_dsl` open_app); screenshot captured for visual verification. Same boundary.

### O12. End-to-end smoke test
A `.mob` script logs in, opens a conversation, sends a message to coworkers-agent, asserts a
streamed AI reply renders. Same boundary; backend already live + verified.

---

## Non-goals

- Local Swift compilation in the container. Proven impossible (musl, 2 GB disk).
- In-Worker arbitrary `eval()`. CF blocks it permanently.
- Code signing / App Store distribution. Builds are unsigned.
- Re-deriving the push mechanism. Use `gh-commit-relay` (see `ops/relay/`).

---

## Loop exit conditions

| Condition | Action |
|---|---|
| All P0 green | Continue to P1. Record milestone in STATE.md + memory store. |
| Same error twice, no progress | Stop. Write blocker to STATE.md. Surface to operator. |
| Build infra error (not our code) | Retry up to 3x, then stop and report. |
| Needs device (P2) | Park outcome `BLOCKED:needs-desktop`, continue others. |
| Token/auth failure | Stop immediately. Never loop on auth errors. |

---

## Current status

See `ops/loop/STATE.md` for the authoritative phase. At writing:
- O1-O5: workflow being wired into coworkers-native.
- Tools (ios-builder, mobai-mcp): cloned, built, probed — ready.
- Backend (coworkers-agent): live and verified.
