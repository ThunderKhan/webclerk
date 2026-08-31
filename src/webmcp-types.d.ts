interface WebMcpToolResultContent {
  type: "text";
  text: string;
}

interface WebMcpToolResult {
  content: WebMcpToolResultContent[];
}

interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input?: Record<string, unknown>) => Promise<WebMcpToolResult> | WebMcpToolResult;
}

interface WebMcpRegisterOptions {
  signal?: AbortSignal;
}

interface WebMcpModelContext {
  registerTool(tool: WebMcpToolDefinition, options?: WebMcpRegisterOptions): Promise<void>;
}

interface Document {
  readonly modelContext?: WebMcpModelContext;
}
