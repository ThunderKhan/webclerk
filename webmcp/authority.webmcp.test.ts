import { describe, expect, it } from "vitest";
import { AGENT_AUTHORITY } from "./authority";
import { evidenceDocuments, initialFields } from "./data";
import { deriveFields } from "./domain";
import { createWebMcpTools, type WebMcpBridge } from "./webmcp";

function parseToolResult(output: unknown) {
  const result = output as WebMcpToolResult;
  return JSON.parse(result.content[0].text) as Record<string, unknown>;
}

function bridge(): WebMcpBridge {
  return {
    getFields: () => deriveFields(initialFields, evidenceDocuments),
    setFieldFromAgent: (fieldId, value) => ({ ok: true, message: `${fieldId}=${value}` }),
  };
}

describe("machine-readable WebMCP authority contract", () => {
  it("publishes the complete authority policy in application state", async () => {
    const state = createWebMcpTools(bridge()).find((tool) => tool.name === "get_application_state")!;
    const payload = parseToolResult(await state.execute({}));
    expect(payload.agentAuthority).toEqual(AGENT_AUTHORITY);
  });

  it("repeats the same authority policy at the final review gate", async () => {
    const preflight = createWebMcpTools(bridge()).find((tool) => tool.name === "run_preflight")!;
    const payload = parseToolResult(await preflight.execute({}));
    expect(payload.agentAuthority).toEqual(AGENT_AUTHORITY);
  });

  it("states that useful preparation is allowed while consequential authority is denied", () => {
    expect(AGENT_AUTHORITY.mutateVerifiedFields).toBe(true);
    expect(AGENT_AUTHORITY.runPreflight).toBe(true);
    expect(AGENT_AUTHORITY.inferUnsupportedValues).toBe(false);
    expect(AGENT_AUTHORITY.resolveConflicts).toBe(false);
    expect(AGENT_AUTHORITY.attestTruthfulness).toBe(false);
    expect(AGENT_AUTHORITY.submitApplication).toBe(false);
  });
});
