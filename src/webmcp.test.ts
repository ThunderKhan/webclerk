import { afterEach, describe, expect, it, vi } from "vitest";
import { evidenceDocuments, initialFields } from "./data";
import { deriveFields } from "./domain";
import {
  createWebMcpTools,
  registerWebMcpTools,
  WEBMCP_TOOL_NAMES,
  type WebMcpBridge,
} from "./webmcp";

function parseToolResult(output: unknown) {
  const result = output as WebMcpToolResult;
  return JSON.parse(result.content[0].text) as Record<string, unknown>;
}

function makeBridge(): WebMcpBridge {
  return {
    getFields: () => deriveFields(initialFields, evidenceDocuments),
    setFieldFromAgent: (fieldId, value) => ({ ok: true, message: `${fieldId}=${value}` }),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WebMCP tool adapter", () => {
  it("exposes the intended eight semantic tools", () => {
    const tools = createWebMcpTools(makeBridge());
    expect(tools.map((tool) => tool.name)).toEqual([...WEBMCP_TOOL_NAMES]);
    expect(tools.some((tool) => tool.name === "submit_application")).toBe(false);
  });

  it("returns a compact application state from the deterministic engine", async () => {
    const tool = createWebMcpTools(makeBridge()).find((item) => item.name === "get_application_state")!;
    const payload = parseToolResult(await tool.execute({}));
    expect(payload.ok).toBe(true);
    expect(payload.evidenceCount).toBe(5);
    expect(payload.preflight).toMatchObject({ ready: false });
  });

  it("exposes structured evidence facts rather than document labels only", async () => {
    const tool = createWebMcpTools(makeBridge()).find((item) => item.name === "list_evidence")!;
    const payload = parseToolResult(await tool.execute({ kind: "education" }));
    const evidence = payload.evidence as Array<{ id: string; facts: Array<{ fieldId: string; value: string }> }>;
    expect(evidence).toHaveLength(1);
    expect(evidence[0].id).toBe("enrollment");
    expect(evidence[0].facts).toContainEqual({ fieldId: "programme", value: "Bachelor of Computer Applications" });
  });

  it("does not offer stale evidence as a safe field suggestion", async () => {
    const tool = createWebMcpTools(makeBridge()).find((item) => item.name === "suggest_field_value")!;
    const payload = parseToolResult(await tool.execute({ fieldId: "family_income" }));
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("NO_VERIFIABLE_SUGGESTION");
  });

  it("allows a normal agent mutation through the shared bridge", async () => {
    const mutation = vi.fn(() => ({ ok: true, message: "updated" }));
    const bridge = makeBridge();
    bridge.setFieldFromAgent = mutation;
    const tool = createWebMcpTools(bridge).find((item) => item.name === "set_field_value")!;
    const payload = parseToolResult(await tool.execute({ fieldId: "institution", value: "Example University" }));
    expect(payload.ok).toBe(true);
    expect(mutation).toHaveBeenCalledWith("institution", "Example University");
  });

  it("keeps the final applicant declaration human-only", async () => {
    const mutation = vi.fn(() => ({ ok: true, message: "should not happen" }));
    const bridge = makeBridge();
    bridge.setFieldFromAgent = mutation;
    const tool = createWebMcpTools(bridge).find((item) => item.name === "set_field_value")!;
    const payload = parseToolResult(await tool.execute({ fieldId: "declaration", value: "I confirm" }));
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("HUMAN_ACTION_REQUIRED");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("makes an agent-run preflight visible through the bridge callback", async () => {
    const onPreflightRun = vi.fn();
    const bridge = makeBridge();
    bridge.onPreflightRun = onPreflightRun;
    const tool = createWebMcpTools(bridge).find((item) => item.name === "run_preflight")!;
    const payload = parseToolResult(await tool.execute({}));
    expect(payload.ok).toBe(true);
    expect(onPreflightRun).toHaveBeenCalledOnce();
  });

  it("registers every tool on document.modelContext with the supplied abort signal", async () => {
    const registerTool = vi.fn(async (_tool: WebMcpToolDefinition, _options?: { signal?: AbortSignal }) => undefined);
    vi.stubGlobal("document", { modelContext: { registerTool } });
    const controller = new AbortController();

    const registration = await registerWebMcpTools(makeBridge(), controller.signal);

    expect(registration).toEqual({ status: "available", registered: WEBMCP_TOOL_NAMES.length });
    expect(registerTool).toHaveBeenCalledTimes(WEBMCP_TOOL_NAMES.length);
    expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual([...WEBMCP_TOOL_NAMES]);
    for (const [, options] of registerTool.mock.calls) {
      expect(options).toEqual({ signal: controller.signal });
    }
  });

  it("degrades cleanly when the browser does not expose WebMCP", async () => {
    vi.stubGlobal("document", {});
    const registration = await registerWebMcpTools(makeBridge(), new AbortController().signal);
    expect(registration).toEqual({ status: "unavailable", registered: 0 });
  });

  it("isolates registration failures instead of breaking normal app startup", async () => {
    const registerTool = vi.fn(async (_tool: WebMcpToolDefinition, _options?: { signal?: AbortSignal }) => {
      throw new Error("registration denied");
    });
    vi.stubGlobal("document", { modelContext: { registerTool } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const registration = await registerWebMcpTools(makeBridge(), new AbortController().signal);

    expect(registration).toEqual({ status: "error", registered: 0 });
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });
});
