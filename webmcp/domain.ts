import type { ApplicationField, EvidenceDocument, FieldStatus } from "./data";

export type ChangeOrigin = "human" | "agent" | "system";

export interface FieldFact {
  fieldId: string;
  value: string;
  evidenceId: string;
}

export interface TrustRules {
  evidenceFacts: FieldFact[];
  confirmationOnlyFields: ReadonlySet<string>;
  confirmationReasons: Readonly<Record<string, string>>;
}

export interface FieldInspection {
  field: ApplicationField;
  evidence?: EvidenceDocument;
  evidenceValue?: string;
  status: FieldStatus;
  reason?: string;
}

export interface ChangeRecord {
  id: string;
  fieldId: string;
  previousValue: string;
  nextValue: string;
  origin: ChangeOrigin;
  timestamp: string;
}

export interface PreflightIssue {
  id: string;
  fieldId?: string;
  severity: "critical" | "warning";
  title: string;
  detail: string;
}

export interface PreflightResult {
  ready: boolean;
  critical: PreflightIssue[];
  warnings: PreflightIssue[];
  missingRequired: string[];
}

export const TEST_REFERENCE_NOW = new Date("2026-08-31T00:00:00+05:30");
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

export const evidenceFacts: FieldFact[] = [
  { fieldId: "full_name", value: "Ayan Khan", evidenceId: "identity" },
  { fieldId: "dob", value: "2006-04-12", evidenceId: "identity" },
  { fieldId: "institution", value: "Deen Dayal Upadhyaya Gorakhpur University", evidenceId: "enrollment" },
  { fieldId: "programme", value: "Bachelor of Computer Applications", evidenceId: "enrollment" },
  { fieldId: "year", value: "Second year", evidenceId: "enrollment" },
  { fieldId: "enrollment", value: "FSG-DEMO-220184", evidenceId: "enrollment" },
  { fieldId: "previous_score", value: "80", evidenceId: "marksheet" },
  { fieldId: "family_income", value: "320000", evidenceId: "income" },
  { fieldId: "income_cert_no", value: "UP-INC-2025-88412", evidenceId: "income" },
  { fieldId: "domicile_state", value: "Uttar Pradesh", evidenceId: "domicile" },
  { fieldId: "domicile_cert", value: "UP-DOM-2026-41027", evidenceId: "domicile" },
];

const confirmationOnlyFields = new Set([
  "gender",
  "mobile",
  "email",
  "address",
  "mode",
  "dependents",
  "earning_member",
  "bank_account",
  "category",
  "existing_scholarship",
  "disability",
  "declaration",
]);

const confirmationReasons: Record<string, string> = {
  gender: "No supporting document is designated as authoritative for this field.",
  mobile: "User-entered contact detail; applicant confirmation is required.",
  email: "User-entered contact detail; applicant confirmation is required.",
  address: "Current correspondence address is not directly attested by the seeded evidence set.",
  mode: "The enrollment certificate does not explicitly state the mode of study.",
  dependents: "No uploaded evidence directly verifies the number of dependent family members.",
  earning_member: "Applicant confirmation is required for this household detail.",
  bank_account: "No bank evidence is included in the MVP evidence set.",
  category: "No category certificate is present; applicant confirmation is required.",
  existing_scholarship: "Self-declaration; this cannot be inferred from uploaded documents.",
  disability: "Self-declaration; the agent must not infer disability status from unrelated evidence.",
  declaration: "The declaration is a consequential attestation and must be completed by the applicant.",
};

export const DEFAULT_TRUST_RULES: TrustRules = {
  evidenceFacts,
  confirmationOnlyFields,
  confirmationReasons,
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN");
}

function evidenceForField(fieldId: string, evidence: EvidenceDocument[], rules: TrustRules) {
  const fact = rules.evidenceFacts.find((item) => item.fieldId === fieldId);
  if (!fact) return undefined;
  const document = evidence.find((item) => item.id === fact.evidenceId);
  if (!document) return undefined;
  return { fact, document };
}

function parseIssuedDate(document: EvidenceDocument) {
  if (!document.issuedAt) return undefined;
  const parsed = new Date(`${document.issuedAt}T00:00:00+05:30`);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

export function isEvidenceStale(document: EvidenceDocument, now = new Date()) {
  if (!document.maxAgeMonths) return false;
  const issued = parseIssuedDate(document);
  if (!issued) return false;
  const maxAge = document.maxAgeMonths === 12 ? TWELVE_MONTHS_MS : document.maxAgeMonths * 30.4375 * 24 * 60 * 60 * 1000;
  return now.valueOf() - issued.valueOf() > maxAge;
}

export function deriveField(
  field: ApplicationField,
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
): ApplicationField {
  const value = field.value.trim();
  if (!value) {
    return {
      ...field,
      status: "empty",
      source: undefined,
      issue: field.required ? "Required field is incomplete." : undefined,
    };
  }

  const match = evidenceForField(field.id, evidence, rules);
  if (match) {
    if (normalize(value) !== normalize(match.fact.value)) {
      return {
        ...field,
        status: "blocked",
        source: match.document.name,
        issue: `Conflict: application value is ${formatValue(field, value)} while the evidence states ${formatValue(field, match.fact.value)}.`,
      };
    }

    const stale = isEvidenceStale(match.document, now);
    if (stale) {
      return {
        ...field,
        status: "blocked",
        source: match.document.name,
        issue: `${match.document.name} is outside the accepted ${match.document.maxAgeMonths}-month validity window.`,
      };
    }

    if (match.document.status !== "accepted") {
      return {
        ...field,
        status: "blocked",
        source: match.document.name,
        issue: `${match.document.name} requires human attention and is not accepted evidence for verification.`,
      };
    }

    return {
      ...field,
      status: "verified",
      source: match.document.name,
      issue: undefined,
    };
  }

  if (rules.confirmationOnlyFields.has(field.id)) {
    return {
      ...field,
      status: "needs_confirmation",
      source: undefined,
      issue: confirmationReason(field.id, rules),
    };
  }

  return {
    ...field,
    status: "needs_confirmation",
    source: undefined,
    issue: "No acceptable evidence is mapped to this field.",
  };
}

export function deriveFields(
  fields: ApplicationField[],
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
) {
  return fields.map((field) => deriveField(field, evidence, now, rules));
}

export function inspectField(
  fieldId: string,
  fields: ApplicationField[],
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
): FieldInspection | undefined {
  const field = fields.find((item) => item.id === fieldId);
  if (!field) return undefined;
  const derived = deriveField(field, evidence, now, rules);
  const match = evidenceForField(field.id, evidence, rules);
  return {
    field: derived,
    evidence: match?.document,
    evidenceValue: match?.fact.value,
    status: derived.status,
    reason: derived.issue,
  };
}

export function suggestFieldValue(
  fieldId: string,
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
) {
  const match = evidenceForField(fieldId, evidence, rules);
  if (!match || match.document.status !== "accepted" || isEvidenceStale(match.document, now)) return undefined;
  return {
    value: match.fact.value,
    evidenceId: match.document.id,
    evidenceName: match.document.name,
  };
}

export function findMissingInformation(
  fields: ApplicationField[],
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
) {
  return deriveFields(fields, evidence, now, rules).filter(
    (field) => field.required && (field.status === "empty" || field.status === "needs_confirmation" || field.status === "blocked"),
  );
}

export function checkConsistency(
  fields: ApplicationField[],
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
) {
  return deriveFields(fields, evidence, now, rules)
    .filter((field) => field.status === "blocked")
    .map((field) => ({ fieldId: field.id, label: field.label, issue: field.issue ?? "Blocked" }));
}

export function runPreflight(
  fields: ApplicationField[],
  evidence: EvidenceDocument[],
  now = new Date(),
  rules: TrustRules = DEFAULT_TRUST_RULES,
): PreflightResult {
  const derived = deriveFields(fields, evidence, now, rules);
  const critical: PreflightIssue[] = [];
  const warnings: PreflightIssue[] = [];
  const missingRequired: string[] = [];

  for (const field of derived) {
    if (field.required && field.status === "empty") {
      missingRequired.push(field.id);
      critical.push({
        id: `missing-${field.id}`,
        fieldId: field.id,
        severity: "critical",
        title: `${field.label} is required`,
        detail: "Complete this field before the application can be prepared for submission.",
      });
      continue;
    }

    if (field.status === "blocked") {
      critical.push({
        id: `blocked-${field.id}`,
        fieldId: field.id,
        severity: "critical",
        title: `${field.label} is blocked`,
        detail: field.issue ?? "Resolve this conflict before submission.",
      });
      continue;
    }

    if (field.status === "needs_confirmation" && field.required) {
      warnings.push({
        id: `confirm-${field.id}`,
        fieldId: field.id,
        severity: "warning",
        title: `${field.label} needs applicant confirmation`,
        detail: field.issue ?? "This value cannot be independently verified from the supplied evidence.",
      });
    }
  }

  return {
    ready: critical.length === 0 && warnings.length === 0,
    critical,
    warnings,
    missingRequired,
  };
}

export function formatValue(field: ApplicationField, value: string) {
  if (field.id === "family_income" && /^\d+$/.test(value)) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }
  return value;
}

export function confirmationReason(fieldId: string, rules: TrustRules = DEFAULT_TRUST_RULES) {
  return rules.confirmationReasons[fieldId] ?? "Applicant confirmation is required.";
}

export function makeChangeRecord(
  fieldId: string,
  previousValue: string,
  nextValue: string,
  origin: ChangeOrigin,
  sequence: number,
  now = new Date(),
): ChangeRecord {
  return {
    id: `change-${sequence}`,
    fieldId,
    previousValue,
    nextValue,
    origin,
    timestamp: new Date(now.valueOf() + sequence * 1000).toISOString(),
  };
}
