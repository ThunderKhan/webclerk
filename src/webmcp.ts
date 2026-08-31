import { evidenceDocuments, scholarship, type ApplicationField } from "./data";
import {
  checkConsistency,
  evidenceFacts,
  findMissingInformation,
  inspectField,
  isEvidenceStale,
  runPreflight,
  suggestFieldValue,
  type ChangeRecord,
} from "./domain";

export const WEBMCP_TOOL_NAMES = [
  "get_application_state",
  "inspect_field",
  "list_evidence",
  "suggest_field_value",
  "set_field_value",
  "find_missing_information",
  "check_consistency",
  "run_preflight",
] as const;

export type WebMcpAvailability = "registering" | "available" | "unavailable" | "error";

export interface AgentMutationResult {
  ok: boolean;
  field?: ApplicationField;
  change?: ChangeRecord;
  message: string;
}

export interface WebMcpBridge {
  getFields(): ApplicationField[];
  setFieldFromAgent(fieldId: string, value: string): AgentMutationResult;
  onPreflightRun?(): void;
}

function result(payload: unknown): WebMcpToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload) }],
  };
}

function stringArg(input: Record<string, unknown> | undefined, key: string) {
  const value = input?.[key];
  return typeof value === "string" ? value : undefined;
}

function summarizeSections(fields: ApplicationField[]) {
  const sections = ["personal", "education", "financial", "eligibility"] as const;
  return sections.map((section) => {
    const sectionFields = fields.filter((field) => field.section === section);
    return {
      section,
      total: sectionFields.length,
      verified: sectionFields.filter((field) => field.status === "verified").length,
      needsConfirmation: sectionFields.filter((field) => field.status === "needs_confirmation").length,
      blocked: sectionFields.filter((field) => field.status === "blocked").length,
      incomplete: sectionFields.filter((field) => field.status === "empty").length,
    };
  });
}

function evidenceSummary() {
  return evidenceDocuments.map((document) => {
    const stale = isEvidenceStale(document);
    return {
      ...document,
      validity: stale ? "stale" : document.status === "accepted" ? "current" : "attention_required",
      acceptableForVerification: document.status === "accepted" && !stale,
      facts: evidenceFacts
        .filter((fact) => fact.evidenceId === document.id)
        .map((fact) => ({ fieldId: fact.fieldId, value: fact.value })),
    };
  });
}

export function createWebMcpTools(bridge: WebMcpBridge): WebMcpToolDefinition[] {
  return [
    {
      name: "get_application_state",
      description: "Get the current scholarship application state before acting. The application already contains its supporting records; use list_evidence rather than searching for external workspace attachments. A normal evidence-backed preparation flow is list_evidence → find_missing_information → suggest_field_value → set_field_value → run_preflight. Never infer confirmation-only fields, resolve conflicts silently, attest the declaration, or submit the application.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const fields = bridge.getFields();
        const preflight = runPreflight(fields, evidenceDocuments);
        const completed = fields.filter((field) => field.value.trim() !== "").length;
        const counts = {
          verified: fields.filter((field) => field.status === "verified").length,
          needsConfirmation: fields.filter((field) => field.status === "needs_confirmation").length,
          blocked: fields.filter((field) => field.status === "blocked").length,
          incomplete: fields.filter((field) => field.status === "empty").length,
        };
        return result({
          ok: true,
          application: {
            id: scholarship.applicationId,
            title: scholarship.name,
            closingDate: scholarship.closingDate,
          },
          completionPercent: Math.round((completed / fields.length) * 100),
          counts,
          sections: summarizeSections(fields),
          evidenceCount: evidenceDocuments.length,
          evidenceAccess: "Supporting documents are already available inside this application as pre-extracted structured evidence. Use list_evidence; no external workspace files are required for this demo.",
          recommendedFlow: [
            "list_evidence",
            "find_missing_information",
            "suggest_field_value",
            "set_field_value",
            "run_preflight",
          ],
          humanAuthority: {
            declaration: "human_only",
            submission: "not_exposed_as_a_webmcp_tool",
            safeEvidenceBackedEdits: "agent_allowed_and_reversible_after_user_request",
          },
          preflight: {
            ready: preflight.ready,
            criticalCount: preflight.critical.length,
            warningCount: preflight.warnings.length,
          },
        });
      },
    },
    {
      name: "inspect_field",
      description: "Inspect one field's current value, validation state, supporting site evidence, provenance, and reason for being verified, unresolved, or blocked. Inspection never changes application state.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier from the current application." },
        },
        required: ["fieldId"],
        additionalProperties: false,
      },
      execute: (input) => {
        const fieldId = stringArg(input, "fieldId");
        if (!fieldId) return result({ ok: false, code: "INVALID_ARGUMENT", message: "fieldId is required." });
        const inspection = inspectField(fieldId, bridge.getFields(), evidenceDocuments);
        if (!inspection) return result({ ok: false, code: "FIELD_NOT_FOUND", fieldId, message: "No application field has that id." });
        const stale = inspection.evidence ? isEvidenceStale(inspection.evidence) : false;
        return result({
          ok: true,
          field: inspection.field,
          evidence: inspection.evidence,
          evidenceValue: inspection.evidenceValue,
          evidenceValidity: inspection.evidence
            ? stale
              ? "stale"
              : inspection.evidence.status === "accepted"
                ? "current"
                : "attention_required"
            : "not_mapped",
          acceptableForVerification: inspection.evidence
            ? inspection.evidence.status === "accepted" && !stale
            : false,
          status: inspection.status,
          reason: inspection.reason,
          agentMutationAllowed: fieldId !== "declaration",
        });
      },
    },
    {
      name: "list_evidence",
      description: "Read the supporting documents already attached to this webclerk application. Treat this as the authoritative source whenever the user says 'my documents', 'uploaded documents', 'supporting documents', or asks you to fill from evidence. Each record includes a human-inspectable fictional PDF URL, pre-extracted facts, validity, and whether it is acceptable for verification. Do not search external workspace attachments first.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", description: "Optional evidence-kind substring such as identity, education, financial, or residence." },
        },
        additionalProperties: false,
      },
      execute: (input) => {
        const kind = stringArg(input, "kind")?.toLocaleLowerCase("en-IN");
        const evidence = evidenceSummary();
        const filtered = kind
          ? evidence.filter((document) => document.kind.toLocaleLowerCase("en-IN").includes(kind))
          : evidence;
        return result({
          ok: true,
          extractionMode: "pre_extracted_structured_demo_evidence",
          arbitraryPdfIngestionSupported: false,
          evidence: filtered,
        });
      },
    },
    {
      name: "suggest_field_value",
      description: "Return a candidate value only when current, acceptable site evidence supports it. Use this before writing evidence-backed values. If no acceptable evidence exists, leave the field unresolved or ask the applicant; never substitute confidence, inference, stale evidence, or a conflicting value for proof.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier to find site evidence for." },
        },
        required: ["fieldId"],
        additionalProperties: false,
      },
      execute: (input) => {
        const fieldId = stringArg(input, "fieldId");
        if (!fieldId) return result({ ok: false, code: "INVALID_ARGUMENT", message: "fieldId is required." });
        const field = bridge.getFields().find((item) => item.id === fieldId);
        if (!field) return result({ ok: false, code: "FIELD_NOT_FOUND", fieldId, message: "No application field has that id." });
        const suggestion = suggestFieldValue(fieldId, evidenceDocuments);
        if (!suggestion) {
          return result({
            ok: false,
            code: "NO_VERIFIABLE_SUGGESTION",
            fieldId,
            message: "No current, acceptable site evidence can support a value for this field. Leave it unresolved or ask the applicant to confirm it.",
          });
        }
        const source = evidenceDocuments.find((document) => document.id === suggestion.evidenceId);
        return result({
          ok: true,
          fieldId,
          suggestedValue: suggestion.value,
          provenance: {
            ...suggestion,
            sourceUrl: source?.sourceUrl,
            acceptableForVerification: true,
          },
        });
      },
    },
    {
      name: "set_field_value",
      description: "Write one reversible, non-consequential form value through webclerk's normal evidence rules. When the user has already asked you to fill or prepare evidence-backed fields, values returned by suggest_field_value may be applied immediately without another per-field confirmation. Do not invent confirmation-only values, use stale evidence, or overwrite an unresolved conflict. The declaration is human-only, and final submission is not exposed as a WebMCP capability.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier to update." },
          value: { type: "string", description: "Value to place in the field. Use evidence-backed values when the user requested form completion; do not invent unsupported values." },
        },
        required: ["fieldId", "value"],
        additionalProperties: false,
      },
      execute: (input) => {
        const fieldId = stringArg(input, "fieldId");
        const value = stringArg(input, "value");
        if (!fieldId || value === undefined) {
          return result({ ok: false, code: "INVALID_ARGUMENT", message: "fieldId and value are required." });
        }
        if (fieldId === "declaration") {
          return result({
            ok: false,
            code: "HUMAN_ACTION_REQUIRED",
            fieldId,
            message: "The declaration is a consequential truthfulness attestation. It is intentionally not agent-authorizable. The applicant must review the form and perform this action directly.",
          });
        }
        return result(bridge.setFieldFromAgent(fieldId, value));
      },
    },
    {
      name: "find_missing_information",
      description: "Find required fields that are incomplete, blocked, or still need applicant confirmation. Use the result to separate evidence-backed work the agent can safely prepare from values that must remain unresolved for the applicant.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const missing = findMissingInformation(bridge.getFields(), evidenceDocuments);
        return result({
          ok: true,
          count: missing.length,
          fields: missing.map((field) => ({ id: field.id, label: field.label, section: field.section, status: field.status, issue: field.issue })),
        });
      },
    },
    {
      name: "check_consistency",
      description: "Compare current form values with site evidence and report conflicts or invalid evidence. Never resolve a conflict automatically; surface it for human review.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const conflicts = checkConsistency(bridge.getFields(), evidenceDocuments);
        return result({ ok: true, count: conflicts.length, conflicts });
      },
    },
    {
      name: "run_preflight",
      description: "Run the complete deterministic review check after preparation. Report missing required fields, stale evidence, explicit conflicts, and confirmation-only items. This tool never attests or submits; declaration remains human-only and no submit_application tool exists.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const preflight = runPreflight(bridge.getFields(), evidenceDocuments);
        bridge.onPreflightRun?.();
        return result({
          ok: true,
          ...preflight,
          humanAuthority: {
            declaration: "human_only",
            submission: "not_exposed_as_a_webmcp_tool",
          },
        });
      },
    },
  ];
}

export async function registerWebMcpTools(bridge: WebMcpBridge, signal: AbortSignal) {
  if (!document.modelContext) {
    return { status: "unavailable" as const, registered: 0 };
  }

  const tools = createWebMcpTools(bridge);
  try {
    for (const tool of tools) {
      await document.modelContext.registerTool(tool, { signal });
    }
    return { status: "available" as const, registered: tools.length };
  } catch (error) {
    if (signal.aborted) return { status: "unavailable" as const, registered: 0 };
    console.error("WebMCP registration failed", error);
    return { status: "error" as const, registered: 0 };
  }
}
