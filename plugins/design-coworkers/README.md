# Design Coworkers Plugin

Code Mode bridge for 10 design MCP connectors. Create presentations, diagrams, canvases, wireframes, 3D models, sounds, and video — all through a unified Code Mode interface that chains multiple design tools in one call.

## Commands

| Command | Description |
|---|---|
| `/design` | Generate a design artifact — deck, poster, diagram, canvas, or mockup |
| `/diagram` | Create or render a diagram — flowchart, mindmap, Mermaid, or tldraw canvas |
| `/canvas` | Sketch, draw, or diagram on a live tldraw canvas with JavaScript |
| `/design-brief` | Chain multiple design tools in one workflow (deck + diagram + board) |

## Connected Connectors (probed 2026-06-03)

| Connector | URL | Status | Tools |
|---|---|---|---|
| Canva | mcp.canva.com/mcp | Auth-gated | 28 confirmed |
| Mermaid Chart | chatgpt.mermaid.ai/anthropic/mcp | ✅ Live (no auth) | 1 confirmed |
| tldraw | tldraw-mcp-app.tldraw.workers.dev/mcp | ✅ Live (session) | 3 confirmed |
| Figma | mcp.figma.com/mcp | Auth-gated | 5 (npm source) |
| Miro | mcp.miro.com/ | Auth-gated | ~15 est |
| Whimsical | mcp.whimsical.com/mcp | Auth-gated | ~8 est |
| Descript | api.descript.com/v2/mcp/claude | Auth-gated (v1.3.0) | ~10 est |
| Splice | mcp.splice.com/mcp | Auth-gated | ~6 est |
| SketchUp | api.sketchup.com/mcp/v1/sketchup/mcp | Auth-gated | ~8 est |
| Adobe | adobe-creativity.adobe.io/mcp | Unconfirmed | ~12 est |

## Code Mode

Token cost: ~1,000 (Code Mode) vs ~96,000 (all tools flat).
Based on: https://blog.cloudflare.com/code-mode-mcp/

```typescript
// Chain deck + diagram + board in one execute() call
const deck = await canva.generateDesign({type: 'presentation', query: 'Q3 launch'});
const diagram = await mermaid.validateAndRender({diagramCode: ganttSrc});
const board = await miro.createBoard({name: 'Brainstorm'});
return {deck, diagram, board};
```

## iOS End State

Runs inside CoworkersNative iOS app (subagentceo/coworkers-native).
Build: gh-commit-relay → GitHub Actions macos-latest → ios-build.yml → IPA.
Xcode intelligence MCP bridge on macOS provides live build feedback to Claude Desktop.
Swift UI uses swift-markdown-ui (github.com/anthropics/swift-markdown-ui).
