# Ralph Loop — State Machine + Current Phase

This file is the authoritative answer to "where were we?". The loop updates it every iteration.

## State machine

```
  INIT --> WIRE_WORKFLOW --> FIRST_BUILD --> READ_RESULT -->+
                                  ^                         |
                                  +-- FIX <-- (fail) -------+
                                                            | (success)
                                                            v
                                                    DOWNLOAD_IPA --> P1 / P2
```

| State | Meaning | Exit |
|---|---|---|
| INIT | Tools built, repo exists | workflow file ready to write |
| WIRE_WORKFLOW | Writing ios-build.yml into coworkers-native | file on main (O1) |
| FIRST_BUILD | workflow_dispatch triggered | run reaches terminal conclusion (O2) |
| READ_RESULT | Fetch conclusion + logs | parsed (O3) |
| FIX | Apply a fix for a compile error | new commit pushed |
| DOWNLOAD_IPA | Pull artifact to ./dist | ipa present (O5) |

## Current phase

**Phase: WIRE_WORKFLOW (entering)**

Done:
- Tools cloned + built + probed (ios-builder Go binary, mobai-mcp dist).
- agent-workspace repo created + populated.
- Memory store live and verified.
- coworkers-native has Swift sources (Package.swift + Sources/*).

Next action (single, concrete):
- Write `.github/workflows/ios-build.yml` into `subagentceo/coworkers-native` via gh-commit-relay,
  then trigger a `workflow_dispatch` build and read the conclusion.

Blockers: none.

## Iteration log

| # | State | Change | Run ID | Conclusion |
|---|---|---|---|---|
| 0 | INIT | workspace + memory store built | — | — |
