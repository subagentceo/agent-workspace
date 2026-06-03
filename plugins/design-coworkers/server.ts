import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * design-coworkers: Code Mode bridge for 10 design MCP connectors
 *
 * Architecture: Instead of exposing 96 tools directly, uses Code Mode pattern:
 *   search() -> get_schema() -> execute() in a Dynamic Worker sandbox
 *
 * Based on:
 *   - https://blog.cloudflare.com/code-mode/
 *   - https://blog.cloudflare.com/code-mode-mcp/
 *   - Cloudflare Agents SDK CodeMode
 *
 * Token cost: ~1,000 (Code Mode) vs ~96,000 (all tools flat)
 */

const CONNECTORS = {
  canva:     { url: 'https://mcp.canva.com/mcp',                         tools: 28, auth: 'oauth'   },
  mermaid:   { url: 'https://chatgpt.mermaid.ai/anthropic/mcp',           tools: 1,  auth: 'none'    },
  tldraw:    { url: 'https://tldraw-mcp-app.tldraw.workers.dev/mcp',      tools: 3,  auth: 'session' },
  figma:     { url: 'https://mcp.figma.com/mcp',                         tools: 5,  auth: 'bearer'  },
  miro:      { url: 'https://mcp.miro.com/',                             tools: 15, auth: 'bearer'  },
  whimsical: { url: 'https://mcp.whimsical.com/mcp',                     tools: 8,  auth: 'bearer'  },
  descript:  { url: 'https://api.descript.com/v2/mcp/claude',            tools: 10, auth: 'bearer'  },
  splice:    { url: 'https://mcp.splice.com/mcp',                        tools: 6,  auth: 'bearer'  },
  sketchup:  { url: 'https://api.sketchup.com/mcp/v1/sketchup/mcp',      tools: 8,  auth: 'bearer'  },
  adobe:     { url: 'https://adobe-creativity.adobe.io/mcp',             tools: 12, auth: 'bearer'  },
} as const;

export type Env = {
  LOADER: WorkerLoader;          // Dynamic Worker Loader binding for Code Mode sandbox
  CANVA_TOKEN: string;
  FIGMA_TOKEN: string;
  MIRO_TOKEN: string;
  WHIMSICAL_TOKEN: string;
  DESCRIPT_TOKEN: string;
  SPLICE_TOKEN: string;
  SKETCHUP_TOKEN: string;
  ADOBE_TOKEN: string;
};

/**
 * The Code Mode TypeScript type definitions exposed to the LLM's execute() sandbox.
 * LLM writes code against this API — same pattern as the Cloudflare API Code Mode server.
 */
export const DESIGN_SDK_TYPES = `
interface CanvaTool {
  generateDesign(params: { type: string; query: string; brandKitId?: string }): Promise<{ designId: string; url: string; thumbnailUrl: string }>;
  searchDesigns(params: { query: string; ownership?: 'any'|'owned' }): Promise<Design[]>;
  exportDesign(params: { designId: string; format: 'pdf'|'png'|'mp4'|'gif' }): Promise<{ downloadUrl: string }>;
  generateDesignStructured(params: { topic: string; slides: Slide[]; style?: string }): Promise<{ designId: string }>;
  listBrandKits(): Promise<BrandKit[]>;
}
interface MermaidTool {
  validateAndRender(params: { diagramCode: string; title?: string }): Promise<{ widgetUri: string; valid: boolean }>;
}
interface TldrawTool {
  exec(params: { canvasId?: string; code: string }): Promise<{ canvasId: string; shapes: Shape[] }>;
  search(params: { query: string }): Promise<{ results: ApiEntry[] }>;
}
interface FigmaTool {
  addFile(params: { url: string }): Promise<FigmaFile>;
  readComments(params: { fileKey: string }): Promise<Comment[]>;
  postComment(params: { fileKey: string; nodeId: string; message: string }): Promise<Comment>;
}
interface MiroTool {
  createBoard(params: { name: string; description?: string }): Promise<Board>;
  createStickyNote(params: { boardId: string; content: string; x?: number; y?: number }): Promise<Item>;
  createShape(params: { boardId: string; type: string; content?: string }): Promise<Item>;
}
interface WhimsicalTool {
  create(params: { type: 'flowchart'|'mindmap'|'wireframe'|'diagram'; title: string }): Promise<{ boardId: string; url: string }>;
}
interface SpliceTool {
  searchSounds(params: { query: string; bpm?: number; key?: string; genre?: string }): Promise<Sound[]>;
  buildStack(params: { name: string; soundIds: string[] }): Promise<Stack>;
}
interface DescriptTool {
  createProject(params: { title: string }): Promise<Project>;
  importMedia(params: { url: string; projectId: string }): Promise<Media>;
  editTranscript(params: { projectId: string; edits: Edit[] }): Promise<void>;
}
interface SketchupTool {
  createModel(params: { description: string; dimensions?: Dimensions }): Promise<Model>;
  addComponent(params: { modelId: string; componentType: string }): Promise<Component>;
  exportModel(params: { modelId: string; format: 'skp'|'obj'|'stl' }): Promise<{ downloadUrl: string }>;
}
interface AdobeTool {
  generateImage(params: { prompt: string; style?: string; ratio?: string }): Promise<{ imageUrl: string }>;
  createTemplate(params: { type: string; query: string }): Promise<Template>;
}
declare const canva: CanvaTool;
declare const mermaid: MermaidTool;
declare const tldraw: TldrawTool;
declare const figma: FigmaTool;
declare const miro: MiroTool;
declare const whimsical: WhimsicalTool;
declare const splice: SpliceTool;
declare const descript: DescriptTool;
declare const sketchup: SketchupTool;
declare const adobe: AdobeTool;
`;

export function createDesignCoworkersServer(env: Env): McpServer {
  const server = new McpServer({ name: 'design-coworkers', version: '1.0.0' });

  // search: find design tools by keyword (Code Mode stage 1)
  server.tool('search', {
    description: 'Search design connector tools by keyword. Returns tool names and descriptions. Use before execute() to discover what is available.',
    inputSchema: z.object({
      query: z.string().describe('Natural language query e.g. "create presentation", "render diagram", "3D model", "search sounds"'),
      connector: z.string().optional().describe('Filter to specific connector: canva|mermaid|tldraw|figma|miro|whimsical|descript|splice|sketchup|adobe'),
    }),
  }, async ({ query, connector }) => {
    // BM25 search over DESIGN_SDK_TYPES + tool descriptions
    // Returns: tool names, descriptions, connector name
    const results = searchDesignTools(query, connector);
    return { content: [{ type: 'text', text: JSON.stringify(results) }] };
  });

  // execute: run TypeScript against design SDK in sandbox (Code Mode stage 3)
  server.tool('execute', {
    description: `Execute TypeScript code that chains design tool calls in a sandbox.
Available globals: canva, mermaid, tldraw, figma, miro, whimsical, splice, descript, sketchup, adobe.
Write async arrow functions. Return the result you want.
Example: async () => { const deck = await canva.generateDesign({type:'presentation', query}); return deck; }`,
    inputSchema: z.object({
      code: z.string().describe('Async TypeScript arrow function body. Has access to all design tool globals.'),
    }),
  }, async ({ code }) => {
    // Execute in Dynamic Worker Loader sandbox (env.LOADER)
    // Auth tokens injected via env bindings — never in code
    const result = await runInSandbox(env, code);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  });

  return server;
}

// Stub implementations — replace with real routing to each MCP connector URL
function searchDesignTools(query: string, connector?: string) {
  const catalog = buildToolCatalog();
  return catalog.filter(t =>
    (!connector || t.connector === connector) &&
    (t.name.includes(query) || t.description.toLowerCase().includes(query.toLowerCase()))
  );
}

function buildToolCatalog() {
  return [
    { connector: 'canva',     name: 'generate-design',             description: 'Generate any Canva design: presentation, poster, social post, doc, resume...' },
    { connector: 'canva',     name: 'generate-design-structured',  description: 'Generate Canva presentation from approved structured outline with slides' },
    { connector: 'mermaid',   name: 'validate_and_render_mermaid_diagram', description: 'Validate Mermaid syntax, render to interactive SVG widget' },
    { connector: 'tldraw',    name: 'exec',                        description: 'Execute JS on tldraw canvas. Create shapes, arrows, text. editor instance available.' },
    { connector: 'tldraw',    name: 'search',                      description: 'Query tldraw Editor API spec to discover available shape types and methods' },
    { connector: 'figma',     name: 'add_figma_file',              description: 'Add Figma file to context for analysis' },
    { connector: 'figma',     name: 'post_comment',                description: 'Post a design comment on a Figma node' },
    { connector: 'miro',      name: 'create_board',                description: 'Create a new collaborative Miro whiteboard' },
    { connector: 'miro',      name: 'create_sticky_note',          description: 'Add sticky note to a Miro board' },
    { connector: 'whimsical', name: 'create_flowchart',            description: 'Create a Whimsical flowchart' },
    { connector: 'whimsical', name: 'create_mindmap',              description: 'Create a Whimsical mind map' },
    { connector: 'whimsical', name: 'create_wireframe',            description: 'Create a UI wireframe in Whimsical' },
    { connector: 'splice',    name: 'search_sounds',               description: 'Search Splice catalog for samples and sounds by query, BPM, key, genre' },
    { connector: 'splice',    name: 'build_stack',                 description: 'Build a Splice sound stack from selected samples' },
    { connector: 'descript',  name: 'create_project',              description: 'Create a Descript video/audio editing project' },
    { connector: 'descript',  name: 'edit_transcript',             description: 'Edit video/audio by editing its transcript text' },
    { connector: 'sketchup',  name: 'create_model',                description: 'Create a SketchUp 3D model from description' },
    { connector: 'sketchup',  name: 'export_model',                description: 'Export SketchUp model as .skp, .obj, or .stl' },
    { connector: 'adobe',     name: 'generate_image',              description: 'Generate image with Adobe Firefly from text prompt' },
    { connector: 'adobe',     name: 'create_template',             description: 'Create Adobe Express template' },
  ];
}

async function runInSandbox(env: Env, code: string) {
  // Dynamic Worker Loader execution
  // Inject auth tokens as env vars — never expose to code
  // TODO: implement via env.LOADER.run()
  return { status: 'executed', code };
}
