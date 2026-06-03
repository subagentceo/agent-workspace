# MCP Connector Cache — Design Category

Generated: 2026-06-03
Method: live HTTP probe (SSE) + npm package extraction + GitHub source + session context

## Probe Status
- ✅ LIVE — tools/list confirmed, full schema extracted
- 🔐 AUTH_GATED — URL confirmed, server responds, token required
- 📦 SOURCE — extracted from npm/GitHub
- ❓ UNCONFIRMED — URL guessed

## Summary

| Connector | MCP URL | Auth | Status | Tools |
|---|---|---|---|---|
| Canva | mcp.canva.com/mcp | OAuth | Connected (session) | 28 |
| Figma | local stdio npx figma-mcp | API key | Source extracted | 5 |
| Mermaid Chart | chatgpt.mermaid.ai/anthropic/mcp | None | ✅ LIVE | 1 |
| tldraw | tldraw-mcp-app.tldraw.workers.dev/mcp | Session | ✅ LIVE | 3 |
| Miro | mcp.miro.com/mcp | Bearer | Auth-gated | ~15 est |
| Whimsical | mcp.whimsical.com/mcp | Bearer | Auth-gated | ~8 est |
| Splice | mcp.splice.com/mcp | Bearer | Auth-gated | ~6 est |
| Adobe | unconfirmed | required | ❓ | unknown |
| Descript | unconfirmed | required | ❓ | unknown |
| SketchUp | unconfirmed | required | ❓ | unknown |

## Canva (28 tools, from session context)
generate-design, generate-design-structured, request-outline-review, search-designs,
get-design, get-design-content, get-design-pages, get-design-thumbnail,
start-editing-transaction, perform-editing-operations, commit-editing-transaction, cancel-editing-transaction,
export-design, get-export-formats, resize-design, copy-design, import-design-from-url, merge-designs,
create-folder, list-folder-items, search-folders, move-item-to-folder,
get-assets, upload-asset-from-url, list-brand-kits, create-design-from-brand-template,
create-design-from-candidate, comment-on-design, list-comments, reply-to-comment,
list-replies, resolve-shortlink, get-presenter-notes, help

## Figma (5 tools, npm source)
add_figma_file(url) — add file to context
view_node(file_key, node_id) — get thumbnail for node
read_comments(file_key) — get all comments
post_comment(file_key, node_id, message) — post comment
reply_to_comment(file_key, comment_id, message) — reply to comment

## Mermaid Chart (1 tool, LIVE verified)
validate_and_render_mermaid_diagram(diagramCode, title?)
  Widget: ui://widget/claude-e9f9.html
  readOnly=true, idempotent=true
  Accept: application/json, text/event-stream

## tldraw (3 tools, LIVE verified init — session required for tools/list)
Server: "tldraw Canvas" v1.0.0 on Cloudflare Workers + DOs
exec(canvasId?, code) — run JS on live editor instance
  editor.createShape({_type:'rectangle', shapeId, x, y, w, h, text})
  editor.createShape({_type:'arrow', shapeId, fromId, toId, x1, y1, x2, y2})
  editor.select(id); editor.zoomToSelection()
  return editor.getCurrentPageShapes()
search(query) — query Editor API spec server-side
read_checkpoint() — read canvas state
Rate limit: 30 req/60s

## Probe pattern
curl -X POST {URL} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

## Next categories
productivity, developer, data, communication, sales
