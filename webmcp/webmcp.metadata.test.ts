import { describe, expect, it } from "vitest";
import { evidenceDocuments, initialFields } from "./data";
import { deriveFields } from "./domain";
import { createWebMcpTools, type WebMcpBridge } from "./webmcp";

function makeBridge(): WebMcpBridge {
  return {
    getFields: () => deriveFields(initialFields, evidenceDocuments),
    setFieldFromAgent: (fieldId, value) => ({ ok: true, message: `${fieldId}=${value}` }),
  };
}

describe("WebMCP tool metadata", () => {
  it("marks semantic mutations as writable and reads as read-only", () => {
    const tools = createWebMcpTools(makeBridge());
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    expect(byName.get("fill_verified_fields_from_evidence")?.annotations).toMatchObject({
      readOnlyHint: false,
    });
    expect(byName.get("set_field_value")?.annotations).toMatchObject({
      readOnlyHint: false,
    });

    for (const name of [
      "get_application_state",
      "inspect_field",
      "list_evidence",
      "suggest_field_value",
      "find_missing_information",
      "check_consistency",
      "run_preflight",
    ]) {
      expect(byName.get(name)?.annotations).toMatchObject({ readOnlyHint: true });
    }
  });

  it("marks evidence-derived outputs as untrusted content", () => {
    const byName = new Map(createWebMcpTools(makeBridge()).map((tool) => [tool.name, tool]));
    for (const name of [
      "inspect_field",
      "list_evidence",
      "suggest_field_value",
      "check_consistency",
      "run_preflight",
    ]) {
      expect(byName.get(name)?.annotations).toMatchObject({ untrustedContentHint: true });
    }
  });

  it("gives every tool a human-readable title", () => {
    const tools = createWebMcpTools(makeBridge());
    for (const tool of tools) {
      expect(tool.title?.trim().length).toBeGreaterThan(0);
    }
  });
});
