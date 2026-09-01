import { describe, expect, it } from "vitest";
import {
  deriveFields,
  inspectField,
  runPreflight,
  suggestFieldValue,
  TEST_REFERENCE_NOW,
} from "../domain";
import {
  insuranceEvidence,
  insuranceFields,
  insuranceTrustRules,
} from "./insurance";

describe("insurance workflow reuses the shared trust engine", () => {
  it("verifies and suggests policy-backed values through workflow-specific rules", () => {
    const claimant = suggestFieldValue("claimant_name", insuranceEvidence, TEST_REFERENCE_NOW, insuranceTrustRules);
    const registration = suggestFieldValue("vehicle_registration", insuranceEvidence, TEST_REFERENCE_NOW, insuranceTrustRules);

    expect(claimant?.value).toBe("Riya Sharma");
    expect(registration?.value).toBe("UP53-DEMO-1182");
  });

  it("surfaces a repair-estimate conflict instead of silently correcting it", () => {
    const inspection = inspectField(
      "repair_estimate",
      insuranceFields,
      insuranceEvidence,
      TEST_REFERENCE_NOW,
      insuranceTrustRules,
    );

    expect(inspection?.status).toBe("blocked");
    expect(inspection?.evidenceValue).toBe("78500");
    expect(inspection?.reason).toContain("85000");
    expect(inspection?.reason).toContain("78500");
  });

  it("keeps legally consequential claimant decisions under human authority", () => {
    const fault = inspectField(
      "fault_admission",
      insuranceFields,
      insuranceEvidence,
      TEST_REFERENCE_NOW,
      insuranceTrustRules,
    );
    const declaration = inspectField(
      "fraud_declaration",
      insuranceFields,
      insuranceEvidence,
      TEST_REFERENCE_NOW,
      insuranceTrustRules,
    );

    expect(fault?.status).toBe("empty");
    expect(suggestFieldValue("fault_admission", insuranceEvidence, TEST_REFERENCE_NOW, insuranceTrustRules)).toBeUndefined();
    expect(suggestFieldValue("fraud_declaration", insuranceEvidence, TEST_REFERENCE_NOW, insuranceTrustRules)).toBeUndefined();
  });

  it("uses the same preflight engine to block unresolved consequential fields and conflicts", () => {
    const preflight = runPreflight(
      insuranceFields,
      insuranceEvidence,
      TEST_REFERENCE_NOW,
      insuranceTrustRules,
    );

    expect(preflight.ready).toBe(false);
    expect(preflight.critical.some((issue) => issue.fieldId === "repair_estimate")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "fault_admission")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "fraud_declaration")).toBe(true);
  });

  it("can derive a second domain without changing scholarship behavior", () => {
    const derived = deriveFields(
      insuranceFields.map((field) =>
        field.id === "claimant_name" ? { ...field, value: "Riya Sharma" } : field,
      ),
      insuranceEvidence,
      TEST_REFERENCE_NOW,
      insuranceTrustRules,
    );

    expect(derived.find((field) => field.id === "claimant_name")?.status).toBe("verified");
    expect(derived.find((field) => field.id === "repair_estimate")?.status).toBe("blocked");
  });
});
