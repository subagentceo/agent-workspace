# apps/ — Product Repo Pointers

The three product repos are tracked as separate GitHub repositories, not vendored here,
to keep this control-plane repo light. Each entry below is a pointer + the contract this
workspace depends on.

| App | Repo | Build target of the loop? |
|---|---|---|
| 16 — CoworkersNative | [subagentceo/coworkers-native](https://github.com/subagentceo/coworkers-native) | **Yes** — primary |
| 19 — XcodeAI | [subagentceo/xcode-ai](https://github.com/subagentceo/xcode-ai) | Future (extension) |
| 20 — SandboxAgent | [subagentceo/sandbox-agent](https://github.com/subagentceo/sandbox-agent) | No — deployed Worker |

To vendor them as real git submodules later:
```bash
git submodule add https://github.com/subagentceo/coworkers-native apps/coworkers-native
git submodule add https://github.com/subagentceo/xcode-ai        apps/xcode-ai
git submodule add https://github.com/subagentceo/sandbox-agent   apps/sandbox-agent
```

## coworkers-native (the loop's build target)

- iOS 18, Swift 6 strict concurrency.
- Targets: app, `ShareExtension`, `CoworkersWidget`.
- Backend: `coworkers-agent` Worker (Workers AI, no Anthropic key).
- Build path: SwiftPM library + (to be added) an Xcode project for the app/extensions.
- Known gap: an `.xcodeproj`/`.xcworkspace` is needed for `xcodebuild` to produce an IPA;
  the SwiftPM package alone builds the library but not the app bundle. First loop outcomes
  (O1-O4) operate on the package; O5 (IPA) requires the Xcode project.
