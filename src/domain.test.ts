import { describe, expect, it } from "vitest";
import { evidenceDocuments, initialFields } from "./data";
import {
  checkConsistency,
  deriveFields,
  findMissingInformation,
  inspectField,
  isEvidenceStale,
  runPreflight,
  suggestFieldValue,
} from "./domain";

describe("webclerk deterministic domain engine", () => {
  it("derives evidence-backed fields as verified", () => {
    const fields = deriveFields(initialFields, evidenceDocuments);
    expect(fields.find((field) => field.id === "full_name")?.status).toBe("verified");
    expect(fields.find((field) => field.id === "institution")?.status).toBe("verified");
    expect(fields.find((field) => field.id === "domicile_state")?.status).toBe("verified");
  });

  it("detects the seeded family-income conflict from evidence", () => {
    const inspection = inspectField("family_income", initialFields, evidenceDocuments);
    expect(inspection?.status).toBe("blocked");
    expect(inspection?.evidenceValue).toBe("320000");
    expect(inspection?.reason).toContain("₹3,50,000");
    expect(inspection?.reason).toContain("₹3,20,000");
  });

  it("treats the seeded income certificate as stale", () => {
    const income = evidenceDocuments.find((document) => document.id === "income");
    expect(income).toBeDefined();
    expect(isEvidenceStale(income!)).toBe(true);
    const field = inspectField("income_cert_no", initialFields, evidenceDocuments);
    expect(field?.status).toBe("blocked");
    expect(field?.reason).toContain("12-month validity window");
  });

  it("does not infer fields that require human confirmation", () => {
    const field = inspectField("mode", initialFields, evidenceDocuments);
    expect(field?.status).toBe("needs_confirmation");
    expect(suggestFieldValue("mode", evidenceDocuments)).toBeUndefined();
  });

  it("suggests only non-stale evidence-backed values", () => {
    expect(suggestFieldValue("full_name", evidenceDocuments)?.value).toBe("Ayan Khan");
    expect(suggestFieldValue("family_income", evidenceDocuments)).toBeUndefined();
  });

  it("finds required unresolved information", () => {
    const unresolved = findMissingInformation(initialFields, evidenceDocuments);
    expect(unresolved.some((field) => field.id === "declaration")).toBe(true);
    expect(unresolved.some((field) => field.id === "family_income")).toBe(true);
    expect(unresolved.some((field) => field.id === "mobile")).toBe(true);
  });

  it("reports deterministic consistency failures", () => {
    const conflicts = checkConsistency(initialFields, evidenceDocuments);
    expect(conflicts.map((item) => item.fieldId)).toContain("family_income");
    expect(conflicts.map((item) => item.fieldId)).toContain("income_cert_no");
  });

  it("preflight blocks preparation while critical issues remain", () => {
    const preflight = runPreflight(initialFields, evidenceDocuments);
    expect(preflight.ready).toBe(false);
    expect(preflight.critical.some((issue) => issue.fieldId === "family_income")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "income_cert_no")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "declaration")).toBe(true);
    expect(preflight.warnings.length).toBeGreaterThan(0);
  });

  it("re-evaluates a field after a human edit instead of preserving old UI state", () => {
    const changed = initialFields.map((field) =>
      field.id === "full_name" ? { ...field, value: "Someone Else", status: "verified" as const } : field,
    );
    const derived = deriveFields(changed, evidenceDocuments);
    expect(derived.find((field) => field.id === "full_name")?.status).toBe("blocked");
  });
});
