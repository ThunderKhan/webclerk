import { describe, expect, it, vi } from "vitest";
import { deriveFields } from "../domain";
import { createWebMcpTools, type WebMcpBridge, type WebMcpWorkflowContext } from "../webmcp";
import { insuranceClaim, insuranceEvidence, insuranceFields, insuranceTrustRules } from "./insurance";

function parseToolResult(output: unknown) {
  const result = output as WebMcpToolResult;
  return JSON.parse(result.content[0].text) as Record<string, unknown>;
}

function insuranceHarness() {
  let raw = insuranceFields.map((field) => ({ ...field }));
  const mutation = vi.fn((fieldId: string, value: string) => {
    raw = raw.map((field) => field.id === fieldId ? { ...field, value } : field);
    const field = deriveFields(raw, insuranceEvidence, new Date(), insuranceTrustRules)
      .find((candidate) => candidate.id === fieldId);
    return { ok: true, field, message: "updated" };
  });
  const bridge: WebMcpBridge = {
    getFields: () => deriveFields(raw, insuranceEvidence, new Date(), insuranceTrustRules),
    setFieldFromAgent: mutation,
  };
  const context: WebMcpWorkflowContext = {
    application: { id: insuranceClaim.applicationId, title: insuranceClaim.name },
    evidenceDocuments: insuranceEvidence,
    trustRules: insuranceTrustRules,
    humanOnlyFieldIds: ["fraud_declaration"],
    evidenceAccess: "Fictional insurance evidence is attached to this claim fixture.",
  };
  return { bridge, context, mutation };
}

describe("workflow-configurable WebMCP tools", () => {
  it("publishes insurance application state through the same semantic tool surface", async () => {
    const { bridge, context } = insuranceHarness();
    const state = createWebMcpTools(bridge, context).find((tool) => tool.name === "get_application_state")!;
    const payload = parseToolResult(await state.execute({}));
    expect(payload.application).toMatchObject({
      id: "MIC-DEMO-26091",
      title: "Motor Insurance Claim",
    });
    expect(payload.evidenceCount).toBe(4);
  });

  it("bulk-fills only safe insurance facts and preserves the seeded conflict", async () => {
    const { bridge, context, mutation } = insuranceHarness();
    const bulk = createWebMcpTools(bridge, context).find((tool) => tool.name === "fill_verified_fields_from_evidence")!;
    const payload = parseToolResult(await bulk.execute({}));

    expect(payload.appliedCount).toBe(4);
    expect(mutation).toHaveBeenCalledWith("claimant_name", "Riya Sharma");
    expect(mutation).toHaveBeenCalledWith("policy_number", "POL-MTR-20491");
    expect(mutation).toHaveBeenCalledWith("vehicle_registration", "UP53-DEMO-1182");
    expect(mutation).toHaveBeenCalledWith("incident_date", "2026-08-19");
    expect(mutation).not.toHaveBeenCalledWith("repair_estimate", "78500");
    expect(mutation).not.toHaveBeenCalledWith("fraud_declaration", expect.anything());
  });

  it("refuses claimant-only legal judgement without evidence", async () => {
    const { bridge, context, mutation } = insuranceHarness();
    const set = createWebMcpTools(bridge, context).find((tool) => tool.name === "set_field_value")!;
    const payload = parseToolResult(await set.execute({ fieldId: "fault_admission", value: "Yes" }));
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("HUMAN_CONFIRMATION_REQUIRED");
    expect(mutation).not.toHaveBeenCalled();
  });

  it("keeps the insurance fraud declaration outside agent authority", async () => {
    const { bridge, context, mutation } = insuranceHarness();
    const set = createWebMcpTools(bridge, context).find((tool) => tool.name === "set_field_value")!;
    const payload = parseToolResult(await set.execute({ fieldId: "fraud_declaration", value: "I confirm" }));
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("HUMAN_ACTION_REQUIRED");
    expect(mutation).not.toHaveBeenCalled();
  });
});
