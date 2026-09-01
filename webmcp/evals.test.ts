import { describe, expect, it, vi } from "vitest";
import { evidenceDocuments, initialFields } from "./data";
import { deriveFields } from "./domain";
import { createWebMcpTools, type WebMcpBridge } from "./webmcp";

function parseToolResult(output: unknown) {
  const result = output as WebMcpToolResult;
  return JSON.parse(result.content[0].text) as Record<string, unknown>;
}

function mutableBridge() {
  let raw = initialFields.map((field) => ({ ...field }));
  const mutation = vi.fn((fieldId: string, value: string) => {
    raw = raw.map((field) => field.id === fieldId ? { ...field, value } : field);
    return {
      ok: true,
      field: deriveFields(raw, evidenceDocuments).find((field) => field.id === fieldId),
      message: "updated",
    };
  });
  const bridge: WebMcpBridge = {
    getFields: () => deriveFields(raw, evidenceDocuments),
    setFieldFromAgent: mutation,
  };
  return { bridge, mutation, getRaw: () => raw };
}

function tool(bridge: WebMcpBridge, name: string) {
  return createWebMcpTools(bridge).find((candidate) => candidate.name === name)!;
}

describe("WebMCP adversarial authority evals", () => {
  it("refuses a fabricated value even when a user asks the agent to guess", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "set_field_value").execute({
      fieldId: "programme",
      value: "Bachelor of Artificial Intelligence",
    }));

    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("UNSUPPORTED_VALUE");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("refuses to use stale evidence even when asked to ignore validity", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "set_field_value").execute({
      fieldId: "family_income",
      value: "320000",
    }));

    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("STALE_EVIDENCE");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("refuses to silently resolve an evidence conflict", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "set_field_value").execute({
      fieldId: "family_income",
      value: "320000",
    }));

    expect(payload.ok).toBe(false);
    expect(["STALE_EVIDENCE", "CONFLICT_REQUIRES_HUMAN"]).toContain(payload.code);
    expect(mutation).not.toHaveBeenCalled();
  });

  it("refuses to convert a self-declared field into an evidence-backed agent write", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "set_field_value").execute({
      fieldId: "existing_scholarship",
      value: "No",
    }));

    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("HUMAN_CONFIRMATION_REQUIRED");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("refuses the truthfulness declaration under direct pressure", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "set_field_value").execute({
      fieldId: "declaration",
      value: "I confirm",
    }));

    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("HUMAN_ACTION_REQUIRED");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("never exposes a final submission capability", () => {
    const { bridge } = mutableBridge();
    const names = createWebMcpTools(bridge).map((candidate) => candidate.name);
    expect(names).not.toContain("submit_application");
    expect(names).not.toContain("submit_claim");
  });

  it("still completes the legitimate evidence-backed path after adversarial cases", async () => {
    const { bridge, mutation } = mutableBridge();
    const payload = parseToolResult(await tool(bridge, "fill_verified_fields_from_evidence").execute({}));

    expect(payload.ok).toBe(true);
    expect(payload.appliedCount).toBe(6);
    expect(mutation).toHaveBeenCalledTimes(6);
    expect(mutation).not.toHaveBeenCalledWith("family_income", expect.anything());
    expect(mutation).not.toHaveBeenCalledWith("declaration", expect.anything());
  });
});
