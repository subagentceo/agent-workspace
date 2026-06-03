---
name: design-coworkers
description: |
  Code Mode bridge for 10 design MCP connectors: Canva (28 tools), Figma (5),
  Miro (~15), tldraw (3), Mermaid Chart (1), Whimsical, Descript, Splice, SketchUp,
  Adobe Creative. Chains multiple design calls in one execute() sandbox.
  Triggers: deck, diagram, wireframe, poster, sound, video, 3D model, Miro board,
  flowchart, mindmap, presentation, Figma, sketch, canvas, design.
code_mode: true
code_mode_pattern: search -> get_schema -> execute
probe_date: 2026-06-03
connectors:
  - { name: canva,     url: "https://mcp.canva.com/mcp",                          auth: oauth,   tools: 28, status: auth-gated }
  - { name: mermaid,   url: "https://chatgpt.mermaid.ai/anthropic/mcp",            auth: none,    tools: 1,  status: live }
  - { name: tldraw,    url: "https://tldraw-mcp-app.tldraw.workers.dev/mcp",       auth: session, tools: 3,  status: live }
  - { name: figma,     url: "https://mcp.figma.com/mcp",                          auth: bearer,  tools: 5,  status: auth-gated }
  - { name: miro,      url: "https://mcp.miro.com/",                              auth: bearer,  tools: 15, status: auth-gated }
  - { name: whimsical, url: "https://mcp.whimsical.com/mcp",                      auth: bearer,  tools: 8,  status: auth-gated }
  - { name: descript,  url: "https://api.descript.com/v2/mcp/claude",             auth: bearer,  tools: 10, status: auth-gated-init-live, version: "1.3.0" }
  - { name: splice,    url: "https://mcp.splice.com/mcp",                         auth: bearer,  tools: 6,  status: auth-gated }
  - { name: sketchup,  url: "https://api.sketchup.com/mcp/v1/sketchup/mcp",       auth: bearer,  tools: 8,  status: auth-gated }
  - { name: adobe,     url: "https://adobe-creativity.adobe.io/mcp",              auth: bearer,  tools: 12, status: auth-gated }
license: Proprietary
compatibility: |
  claude.ai web/desktop with Code Mode support.
  Target: CoworkersNative iOS app on macOS with Xcode intelligence MCP bridge.
metadata:
  author: subagentcowork
  version: "1.0.0"
  repo: https://github.com/subagentceo/agent-workspace
---

# design-coworkers

Code Mode bridge for 10 design MCP connectors. Instead of loading 96 tools into context,
uses Code Mode: search() -> get_schema() -> execute() in a sandbox. ~1,000 tokens instead
of ~96,000 for the full tool catalog.

## Code Mode architecture

Based on:
- TypeScript: https://blog.cloudflare.com/code-mode/ + https://blog.cloudflare.com/code-mode-mcp/
- Python: https://gofastmcp.com/servers/transforms/code-mode

Two meta-tools replace all 96 design tools:

```
search(query)   — find design tools by keyword → returns names + descriptions
execute(code)   — run TypeScript that chains selected tools in a Workers sandbox
```

Discovery: 3-stage
1. search("canva presentation") → tool names
2. get_schema(["generate-design"]) → parameter details
3. execute(code) → chain calls, return final result

## Connector status (probed 2026-06-03)

| Connector | URL | Auth | Status | Tools |
|---|---|---|---|---|
| Canva | mcp.canva.com/mcp | OAuth | auth-gated | 28 confirmed |
| Mermaid Chart | chatgpt.mermaid.ai/anthropic/mcp | None | ✅ LIVE | 1 confirmed |
| tldraw | tldraw-mcp-app.tldraw.workers.dev/mcp | Session | ✅ LIVE | 3 confirmed |
| Figma | mcp.figma.com/mcp | Bearer | auth-gated | 5 (npm source) |
| Miro | mcp.miro.com/ | Bearer | auth-gated | ~15 est |
| Whimsical | mcp.whimsical.com/mcp | Bearer | auth-gated | ~8 est |
| Descript | api.descript.com/v2/mcp/claude | Bearer | init-live v1.3.0 | ~10 est |
| Splice | mcp.splice.com/mcp | Bearer | auth-gated | ~6 est |
| SketchUp | api.sketchup.com/mcp/v1/sketchup/mcp | Bearer | auth-gated | ~8 est |
| Adobe | adobe-creativity.adobe.io/mcp | Bearer | auth-gated | ~12 est |

## execute() chain examples

```typescript
// Deck + diagram in one call
const deck = await canva.generateDesign({type:'presentation', query});
const diagram = await mermaid.validateAndRender({diagramCode: ganttSrc});
return {deck, diagram};

// Interactive canvas + board
const canvas = await tldraw.exec({code: 'editor.createShape({_type:"rectangle",...})'});
const board = await miro.createBoard({name: 'Brainstorm'});
return {canvas, board};

// Full creative pipeline
const sound = await splice.searchSounds({query: 'lo-fi beat', bpm: 90});
const video = await descript.createProject({title: 'Campaign video'});
const poster = await canva.generateDesign({type:'poster', query: 'Campaign launch'});
return {sound, video, poster};
```

## iOS end state

Plugin runs inside CoworkersNative (iOS 18 Swift app) at subagentceo/coworkers-native.
Build loop: edit Swift -> gh-commit-relay -> GitHub Actions macos-latest -> Xcode -> IPA.
On macOS: Xcode intelligence MCP bridge provides live build feedback to Claude Desktop.
On device: install via MobAI mobai-mcp tool after IPA built.

See: https://github.com/subagentceo/agent-workspace/blob/main/ops/loop/STATE.md
