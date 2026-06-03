"""
design-coworkers: Python Code Mode bridge for 10 design MCP connectors

Based on FastMCP Code Mode:
  https://gofastmcp.com/servers/transforms/code-mode

3-stage discovery: GetTags -> Search -> GetSchemas -> execute()
Token cost: ~1,000 vs ~96,000 for all tools flat
"""

from fastmcp import FastMCP
from fastmcp.experimental.transforms.code_mode import (
    CodeMode, GetTags, Search, GetSchemas
)

mcp = FastMCP(
    "design-coworkers",
    transforms=[
        CodeMode(
            # Tags let LLM browse by design category first
            # Then search within a category, then get schemas, then execute
            discovery_tools=[
                GetTags(),      # browse: canvasing, diagramming, 3d, audio, video, boards
                Search(default_detail="brief", default_limit=5),
                GetSchemas(default_detail="detailed"),
            ],
        )
    ],
)

# ── Canva (28 tools - registering the key ones) ───────────────────────────────

@mcp.tool(tags=["canvasing", "visual"])
async def canva_generate_design(design_type: str, query: str, brand_kit_id: str = "") -> dict:
    """Generate a Canva design. type: presentation|poster|social_post|doc|resume|report|flyer|logo.
    Set brand_kit_id to apply brand colors and fonts."""
    pass  # routes to https://mcp.canva.com/mcp generate-design

@mcp.tool(tags=["canvasing", "visual"])
async def canva_generate_presentation(topic: str, slides: list, style: str = "minimalist", audience: str = "professional") -> dict:
    """Generate a structured Canva presentation from an approved outline. slides: [{title, description}]"""
    pass

@mcp.tool(tags=["canvasing", "visual"])
async def canva_export_design(design_id: str, format: str = "pdf") -> dict:
    """Export a Canva design. format: pdf|png|jpg|mp4|gif"""
    pass

# ── Mermaid Chart (1 tool) ────────────────────────────────────────────────────

@mcp.tool(tags=["diagramming"])
async def mermaid_render_diagram(diagram_code: str, title: str = "") -> dict:
    """Validate and render a Mermaid diagram to an interactive SVG widget.
    Supports: flowchart, sequence, gantt, class, state, ER, gitGraph, mindmap, timeline."""
    pass  # routes to https://chatgpt.mermaid.ai/anthropic/mcp

# ── tldraw (3 tools) ─────────────────────────────────────────────────────────

@mcp.tool(tags=["diagramming", "canvasing"])
async def tldraw_exec(code: str, canvas_id: str = "") -> dict:
    """Execute JavaScript on a live tldraw canvas. code has access to: editor instance,
    createShape, createArrowBetweenShapes, toRichText, createShapeId helpers.
    Examples: editor.createShape({_type:'rectangle', shapeId:'box1', x:200, y:120, w:320, h:180, text:'Hello'})"""
    pass  # routes to https://tldraw-mcp-app.tldraw.workers.dev/mcp

@mcp.tool(tags=["diagramming"])
async def tldraw_search_api(query: str) -> dict:
    """Search the tldraw Editor API spec to discover available shape types and methods.
    Use before tldraw_exec to find the right methods."""
    pass

# ── Figma (5 tools) ──────────────────────────────────────────────────────────

@mcp.tool(tags=["visual", "design-review"])
async def figma_add_file(url: str) -> dict:
    """Add a Figma file to context. url: Figma file or prototype URL."""
    pass  # routes to https://mcp.figma.com/mcp

@mcp.tool(tags=["design-review"])
async def figma_post_comment(file_key: str, node_id: str, message: str) -> dict:
    """Post a design review comment on a specific Figma node."""
    pass

# ── Miro (key tools) ─────────────────────────────────────────────────────────

@mcp.tool(tags=["boards", "collaboration"])
async def miro_create_board(name: str, description: str = "") -> dict:
    """Create a new Miro collaborative whiteboard."""
    pass  # routes to https://mcp.miro.com/

@mcp.tool(tags=["boards"])
async def miro_create_sticky(board_id: str, content: str, color: str = "yellow", x: int = 0, y: int = 0) -> dict:
    """Add a sticky note to a Miro board."""
    pass

# ── Whimsical ─────────────────────────────────────────────────────────────────

@mcp.tool(tags=["diagramming", "boards"])
async def whimsical_create(type: str, title: str) -> dict:
    """Create a Whimsical board. type: flowchart|mindmap|wireframe|diagram"""
    pass  # routes to https://mcp.whimsical.com/mcp

# ── Splice ────────────────────────────────────────────────────────────────────

@mcp.tool(tags=["audio"])
async def splice_search_sounds(query: str, bpm: int = 0, key: str = "", genre: str = "") -> dict:
    """Search Splice sound catalog for samples. Returns samples with preview URLs.
    bpm: target BPM (0 = any). key: musical key e.g. 'Cmaj'. genre: e.g. 'lo-fi', 'trap'."""
    pass  # routes to https://mcp.splice.com/mcp

@mcp.tool(tags=["audio"])
async def splice_build_stack(name: str, sound_ids: list) -> dict:
    """Build a Splice sound stack from a list of sample IDs."""
    pass

# ── Descript ─────────────────────────────────────────────────────────────────

@mcp.tool(tags=["video"])
async def descript_create_project(title: str) -> dict:
    """Create a Descript video/audio editing project."""
    pass  # routes to https://api.descript.com/v2/mcp/claude

@mcp.tool(tags=["video"])
async def descript_import_media(project_id: str, url: str) -> dict:
    """Import media (video/audio URL) into a Descript project."""
    pass

# ── SketchUp ─────────────────────────────────────────────────────────────────

@mcp.tool(tags=["3d"])
async def sketchup_create_model(description: str) -> dict:
    """Create a SketchUp 3D model from a text description."""
    pass  # routes to https://api.sketchup.com/mcp/v1/sketchup/mcp

@mcp.tool(tags=["3d"])
async def sketchup_export_model(model_id: str, format: str = "skp") -> dict:
    """Export a SketchUp model. format: skp|obj|stl"""
    pass

# ── Adobe Creative ────────────────────────────────────────────────────────────

@mcp.tool(tags=["visual", "canvasing"])
async def adobe_generate_image(prompt: str, style: str = "", ratio: str = "1:1") -> dict:
    """Generate an image with Adobe Firefly from a text prompt."""
    pass  # routes to https://adobe-creativity.adobe.io/mcp

@mcp.tool(tags=["visual"])
async def adobe_create_template(type: str, query: str) -> dict:
    """Create an Adobe Express template. type: social|flyer|poster|banner"""
    pass


if __name__ == "__main__":
    mcp.run()
