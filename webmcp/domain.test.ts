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
  TEST_REFERENCE_NOW,
} from "./domain";

describe("webclerk deterministic domain engine", () => {
  it("derives populated evidence-backed fields as verified", () => {
    const fields = deriveFields(initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(fields.find((field) => field.id === "full_name")?.status).toBe("verified");
    expect(fields.find((field) => field.id === "dob")?.status).toBe("verified");
    expect(fields.find((field) => field.id === "institution")?.status).toBe("verified");
  });

  it("starts with evidence-backed blanks the agent can safely complete", () => {
    const programme = inspectField("programme", initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    const domicile = inspectField("domicile_state", initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(programme?.status).toBe("empty");
    expect(domicile?.status).toBe("empty");
    expect(suggestFieldValue("programme", evidenceDocuments, TEST_REFERENCE_NOW)?.value).toBe("Bachelor of Computer Applications");
    expect(suggestFieldValue("domicile_state", evidenceDocuments, TEST_REFERENCE_NOW)?.value).toBe("Uttar Pradesh");
  });

  it("detects the seeded family-income conflict from evidence", () => {
    const inspection = inspectField("family_income", initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(inspection?.status).toBe("blocked");
    expect(inspection?.evidenceValue).toBe("320000");
    expect(inspection?.reason).toContain("₹3,50,000");
    expect(inspection?.reason).toContain("₹3,20,000");
  });

  it("treats the seeded income certificate as stale at the test reference time", () => {
    const income = evidenceDocuments.find((document) => document.id === "income");
    expect(income).toBeDefined();
    expect(isEvidenceStale(income!, TEST_REFERENCE_NOW)).toBe(true);
    const field = inspectField("income_cert_no", initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(field?.status).toBe("blocked");
    expect(field?.reason).toContain("12-month validity window");
  });

  it("uses the supplied clock rather than a frozen production timestamp", () => {
    const income = evidenceDocuments.find((document) => document.id === "income")!;
    expect(isEvidenceStale(income, new Date("2025-06-11T00:00:00+05:30"))).toBe(false);
    expect(isEvidenceStale(income, new Date("2026-08-31T00:00:00+05:30"))).toBe(true);
  });

  it("does not infer fields that require human confirmation", () => {
    const field = inspectField("mode", initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(field?.status).toBe("needs_confirmation");
    expect(suggestFieldValue("mode", evidenceDocuments, TEST_REFERENCE_NOW)).toBeUndefined();
  });

  it("suggests only non-stale evidence-backed values", () => {
    expect(suggestFieldValue("full_name", evidenceDocuments, TEST_REFERENCE_NOW)?.value).toBe("Ayan Khan");
    expect(suggestFieldValue("family_income", evidenceDocuments, TEST_REFERENCE_NOW)).toBeUndefined();
  });

  it("never verifies or suggests evidence that is not accepted", () => {
    const warningEvidence = evidenceDocuments.map((document) =>
      document.id === "enrollment"
        ? { ...document, status: "warning" as const }
        : document,
    );

    const programme = initialFields.map((field) =>
      field.id === "programme"
        ? { ...field, value: "Bachelor of Computer Applications" }
        : field,
    );

    const inspection = inspectField("programme", programme, warningEvidence, TEST_REFERENCE_NOW);
    expect(inspection?.status).toBe("blocked");
    expect(inspection?.reason).toContain("not accepted evidence");
    expect(suggestFieldValue("programme", warningEvidence, TEST_REFERENCE_NOW)).toBeUndefined();
  });

  it("finds required unresolved information", () => {
    const unresolved = findMissingInformation(initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(unresolved.some((field) => field.id === "declaration")).toBe(true);
    expect(unresolved.some((field) => field.id === "family_income")).toBe(true);
    expect(unresolved.some((field) => field.id === "mobile")).toBe(true);
    expect(unresolved.some((field) => field.id === "programme")).toBe(true);
  });

  it("reports deterministic consistency failures", () => {
    const conflicts = checkConsistency(initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(conflicts.map((item) => item.fieldId)).toContain("family_income");
    expect(conflicts.map((item) => item.fieldId)).toContain("income_cert_no");
  });

  it("preflight blocks preparation while critical issues remain", () => {
    const preflight = runPreflight(initialFields, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(preflight.ready).toBe(false);
    expect(preflight.critical.some((issue) => issue.fieldId === "family_income")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "income_cert_no")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "declaration")).toBe(true);
    expect(preflight.critical.some((issue) => issue.fieldId === "programme")).toBe(true);
    expect(preflight.warnings.length).toBeGreaterThan(0);
  });

  it("re-evaluates a field after a human edit instead of preserving old UI state", () => {
    const changed = initialFields.map((field) =>
      field.id === "full_name" ? { ...field, value: "Someone Else", status: "verified" as const } : field,
    );
    const derived = deriveFields(changed, evidenceDocuments, TEST_REFERENCE_NOW);
    expect(derived.find((field) => field.id === "full_name")?.status).toBe("blocked");
  });
});
