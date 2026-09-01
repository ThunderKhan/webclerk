interface WebMcpToolResultContent {
  type: "text";
  text: string;
}

interface WebMcpToolResult {
  content: WebMcpToolResultContent[];
}

interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  untrustedContentHint?: boolean;
}

interface WebMcpToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebMcpToolAnnotations;
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
