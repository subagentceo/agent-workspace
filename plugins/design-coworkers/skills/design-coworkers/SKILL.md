---
name: design-coworkers
description: Code Mode bridge for 10 design MCP connectors. Use when creating presentations, diagrams, wireframes, canvases, 3D models, sounds, video, or AI images. Chains multiple design tool calls in one execute() sandbox. Triggers: "make me a deck", "diagram this", "wireframe", "design a poster", "find a sound", "edit this video", "3D model", "Miro board", "flowchart", "mindmap", "tldraw canvas", "Canva", "Figma".
argument-hint: "<design request>"
---

# /design-coworkers

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Code Mode bridge for design tools. Routes design intent to the right connector and chains tool calls in one execute() sandbox.

## Usage

```
/design-coworkers $ARGUMENTS
```

Create a design artifact: @$1

## Code Mode

Based on Cloudflare Code Mode and FastMCP. Two meta-tools replace all 96 design tools:
- **search(query)** — find tools by keyword, returns names + descriptions (~50 tokens)
- **execute(code)** — run TypeScript sandbox, chains any design tools (~200 tokens)

Total: ~1,000 tokens vs ~96,000 for all tools flat.

## Connector Reference

### ~~visual design (Canva, Figma)

**Canva** (28 tools, mcp.canva.com/mcp)
```typescript
canva.generateDesign({type, query, brandKitId?})
canva.generateDesignStructured({topic, slides: [{title, description}], style?, audience?})
canva.searchDesigns({query, ownership?})
canva.exportDesign({designId, format: 'pdf'|'png'|'mp4'|'gif'})
canva.listBrandKits()
canva.getDesignContent({designId})
canva.uploadAssetFromUrl({url})
canva.resizeDesign({designId, preset?})
```

**Figma** (5 tools, mcp.figma.com/mcp)
```typescript
figma.addFile({url})              // add Figma file to context
figma.viewNode({fileKey, nodeId}) // get thumbnail
figma.readComments({fileKey})
figma.postComment({fileKey, nodeId, message})
figma.replyToComment({fileKey, commentId, message})
```

### ~~interactive canvas (tldraw ✅ LIVE)

**tldraw** (3 tools, tldraw-mcp-app.tldraw.workers.dev/mcp, Cloudflare Workers + DO)
```typescript
tldraw.search({query: 'rectangle arrow'})  // search Editor API first

tldraw.exec({canvasId?, code: `
  editor.createShape({_type: 'rectangle', shapeId: 'box1', x: 200, y: 120, w: 320, h: 180, text: 'Hello'})
  editor.createShape({_type: 'arrow', shapeId: 'a1', fromId: 'box1', toId: 'box2', x1: 0, y1: 0, x2: 100, y2: 0})
  editor.select('box1')
  editor.zoomToSelection()
  return editor.getCurrentPageShapes()
`})

tldraw.readCheckpoint({canvasId})
```

### ~~diagramming (Mermaid Chart ✅ LIVE)

**Mermaid Chart** (1 tool, chatgpt.mermaid.ai/anthropic/mcp, NO AUTH)
```typescript
mermaid.validateAndRender({
  diagramCode: `flowchart TD
    A[Start] --> B{Decision}
    B -- Yes --> C[Action]
    B -- No --> D[End]`,
  title?: 'optional'
})
// Returns: widgetUri ui://widget/claude-e9f9.html, valid: boolean
// Supports: flowchart, sequence, gantt, classDiagram, stateDiagram,
//           erDiagram, gitGraph, mindmap, timeline, journey
```

### ~~collaboration board (Miro, Whimsical)

**Miro** (~15 tools, mcp.miro.com/)
```typescript
miro.createBoard({name, description?})
miro.createStickyNote({boardId, content, color?, x?, y?})
miro.createShape({boardId, type, content?})
miro.createFrame({boardId, title})
miro.getItems({boardId})
miro.updateItem({boardId, itemId, changes})
```

**Whimsical** (~8 tools, mcp.whimsical.com/mcp)
```typescript
whimsical.createFlowchart({title})
whimsical.createMindmap({title})
whimsical.createWireframe({title})
whimsical.createDiagram({title})
```

### ~~sound library (Splice)

**Splice** (~6 tools, mcp.splice.com/mcp)
```typescript
splice.searchSounds({query, bpm?, key?, genre?})
splice.buildStack({name, soundIds})
splice.downloadSample({sampleId})
```

### ~~video editing (Descript)

**Descript** (~10 tools, api.descript.com/v2/mcp/claude, server v1.3.0)
```typescript
descript.createProject({title})
descript.importMedia({projectId, url})
descript.editTranscript({projectId, edits})
descript.removeFillerWords({projectId})
descript.exportVideo({projectId, format})
```

### ~~3d tool (SketchUp)

**SketchUp** (~8 tools, api.sketchup.com/mcp/v1/sketchup/mcp)
```typescript
sketchup.createModel({description, dimensions?})
sketchup.addComponent({modelId, componentType})
sketchup.exportModel({modelId, format: 'skp'|'obj'|'stl'})
```

### ~~ai image (Adobe)

**Adobe Creative** (~12 tools, adobe-creativity.adobe.io/mcp)
```typescript
adobe.generateImage({prompt, style?, ratio?: '1:1'|'16:9'|'4:3'})
adobe.createTemplate({type: 'social'|'flyer'|'poster'|'banner', query})
```

## execute() Chain Examples

### Deck + timeline
```typescript
const deck = await canva.generateDesign({type: 'presentation', query: 'Q3 product launch'});
const timeline = await mermaid.validateAndRender({diagramCode: `
  gantt
    title Q3 Roadmap
    dateFormat YYYY-MM-DD
    section Launch
    Design :done, 2026-06-01, 2026-06-15
    Dev    :active, 2026-06-15, 2026-07-01
    Launch :milestone, 2026-07-01, 0d
`, title: 'Q3 Roadmap'});
return {deck, timeline};
```

### Brainstorm board + mindmap
```typescript
const board = await miro.createBoard({name: 'Q3 Brainstorm'});
await miro.createStickyNote({boardId: board.id, content: 'Core feature: real-time collab', color: 'yellow'});
const mindmap = await whimsical.createMindmap({title: 'Q3 Ideas'});
return {board, mindmap};
```

### Architecture diagram on canvas
```typescript
const canvas = await tldraw.exec({code: `
  editor.createShape({_type:'rectangle', shapeId:'ios',    x:100, y:150, w:180, h:60, text:'CoworkersNative iOS'});
  editor.createShape({_type:'rectangle', shapeId:'worker', x:380, y:150, w:180, h:60, text:'coworkers-agent'});
  editor.createShape({_type:'rectangle', shapeId:'canva',  x:660, y:80,  w:140, h:60, text:'Canva MCP'});
  editor.createShape({_type:'rectangle', shapeId:'mermaid',x:660, y:220, w:140, h:60, text:'Mermaid MCP'});
  editor.createShape({_type:'arrow', shapeId:'a1', fromId:'ios',    toId:'worker', x1:0, y1:0, x2:80, y2:0});
  editor.createShape({_type:'arrow', shapeId:'a2', fromId:'worker', toId:'canva',  x1:0, y1:0, x2:80, y2:-70});
  editor.createShape({_type:'arrow', shapeId:'a3', fromId:'worker', toId:'mermaid',x1:0, y1:0, x2:80, y2:70});
  editor.zoomToFit();
  return editor.getCurrentPageShapes();
`});
return canvas;
```

### Campaign: sound + video + poster
```typescript
const sounds = await splice.searchSounds({query: 'lo-fi ambient product launch', bpm: 90});
const video  = await descript.createProject({title: 'Q3 Launch Video'});
const poster = await canva.generateDesign({type: 'poster', query: 'Q3 product launch minimal'});
return {sounds: sounds.slice(0, 3), video, poster};
```

## iOS End State

Runs inside **CoworkersNative** (iOS 18 Swift app, subagentceo/coworkers-native).

Build loop:
1. Edit Swift → push via `gh-commit-relay`
2. GitHub Actions `macos-latest` → Xcode builds via `ios-build.yml`
3. **Xcode intelligence MCP bridge** → live error feedback to Claude Desktop on macOS
4. IPA → install via `mobai-mcp:install_app` → run on device
5. Design calls: CoworkersNative → coworkers-agent CF Worker → Code Mode sandbox → design connectors

Swift rendering uses `swift-markdown-ui` (github.com/anthropics/swift-markdown-ui).

## Probe Notes

Correct headers for any SSE MCP server:
```bash
curl -X POST {URL} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}'
```

Key findings:
- tldraw needs `Mcp-Session-Id` header for tools/list (init works without it)
- Mermaid works with no auth — Accept header must include both json and event-stream
- Descript init responds as v1.3.0 but tools/list needs bearer token
