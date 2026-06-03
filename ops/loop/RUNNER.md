# Ralph Loop Runner

How one iteration of the loop executes. The runner is the operator (an instance) plus
these deterministic steps. No daemon — each iteration is an explicit pass.

## One iteration

1. **Read state** — `ops/loop/STATE.md` + memory store. Know the current phase + last result.
2. **Decide one change** — the smallest coherent edit that advances the nearest unmet outcome
   in `docs/OUTCOMES.md`. One change per iteration.
3. **Apply** — edit Swift/workflow files.
4. **Push** — queue commit-jobs to relay KV, trigger `GET /relay`, confirm `commit-results` ok.
5. **Build** — trigger `workflow_dispatch` on coworkers-native with a unique `build_id`.
6. **Observe** — poll the Actions runs API for that `build_id` until terminal conclusion.
7. **Read** — on failure, fetch logs, extract Swift diagnostics. On success, download IPA.
8. **Record** — append to the iteration log in STATE.md; update memory store on milestone.
9. **Loop or stop** — per the exit conditions in OUTCOMES.md.

## Triggering a build (no local gh)

```
POST https://api.github.com/repos/subagentceo/coworkers-native/actions/workflows/ios-build.yml/dispatches
Authorization: Bearer <GITHUB_TOKEN>
body: { "ref": "main", "inputs": { "build_id": "<uuid>", "ios_path": ".", "configuration": "Debug" } }
```

## Reading a result

```
GET /repos/subagentceo/coworkers-native/actions/runs?event=workflow_dispatch
  -> find run whose inputs.build_id matches; read .status / .conclusion
GET /repos/.../actions/runs/{run_id}/jobs       -> job ids + step conclusions
GET /repos/.../actions/jobs/{job_id}/logs       -> raw text; grep "error:" for diagnostics
GET /repos/.../actions/runs/{run_id}/artifacts  -> find "ipa"; download zip
```

## Why ios-builder still matters

ios-builder encapsulates steps 5-7 (dispatch + poll + artifact download) and ships the
canonical `ios-build.yml`. Run the `builder` binary directly (needs only a token) or
replicate its API calls through a relay-style worker. The embedded workflow template is
the source of truth for the build steps — see `.github/workflows/ios-build.yml`.
