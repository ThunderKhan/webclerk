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
  "fill_verified_fields_from_evidence",
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

function safeEvidenceBackedEdits(fields: ApplicationField[]) {
  return fields.flatMap((field) => {
    if (field.id === "declaration" || field.value.trim() !== "") return [];
    const suggestion = suggestFieldValue(field.id, evidenceDocuments);
    if (!suggestion) return [];
    return [{
      fieldId: field.id,
      value: suggestion.value,
      source: suggestion.evidenceName,
    }];
  });
}

export function createWebMcpTools(bridge: WebMcpBridge): WebMcpToolDefinition[] {
  return [
    {
      name: "get_application_state",
      description: "Read the current application state before acting. If safe evidence-backed edits are available and the user asked to fill, autofill, complete, populate, or prepare what can be verified from their documents, the recommended next action is fill_verified_fields_from_evidence. Do not conclude that document-backed work is complete while safeEvidenceBackedEditsAvailable is greater than zero. Never infer confirmation-only fields, resolve conflicts silently, attest the declaration, or submit the application.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const fields = bridge.getFields();
        const preflight = runPreflight(fields, evidenceDocuments);
        const completed = fields.filter((field) => field.value.trim() !== "").length;
        const safeEdits = safeEvidenceBackedEdits(fields);
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
          evidenceAccess: "Supporting documents are already available inside this application as pre-extracted structured evidence. No external workspace files are required for this demo.",
          safeEvidenceBackedEditsAvailable: safeEdits.length,
          safeEvidenceBackedFieldIds: safeEdits.map((edit) => edit.fieldId),
          recommendedNextAction: safeEdits.length > 0 ? "fill_verified_fields_from_evidence" : "run_preflight",
          recommendedFlow: [
            "get_application_state",
            "fill_verified_fields_from_evidence",
            "run_preflight",
          ],
          granularEditTools: {
            tools: ["suggest_field_value", "set_field_value"],
            preferredForBulkPreparation: false,
            useWhen: "The user asks about or changes one specific field rather than requesting all safe document-backed fields.",
          },
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
      name: "fill_verified_fields_from_evidence",
      description: "Use this tool whenever the user asks to fill, autofill, complete, populate, or prepare everything that can be verified from their documents. This is the preferred semantic mutation for bulk document-backed preparation; do not use browser form controls or repeated per-field set_field_value calls for that intent. It fills every currently incomplete field backed by current, acceptable site evidence through webclerk itself, so each edit is attributed to the WebMCP agent. It skips confirmation-only fields, stale evidence, conflicts, already completed fields, the declaration, and unsupported values. It never submits the application.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const before = bridge.getFields();
        const safeEdits = safeEvidenceBackedEdits(before);
        const applied: Array<{ fieldId: string; value: string; source: string; status?: string }> = [];
        const failed: Array<{ fieldId: string; reason: string }> = [];

        for (const edit of safeEdits) {
          const mutation = bridge.setFieldFromAgent(edit.fieldId, edit.value);
          if (!mutation.ok) {
            failed.push({ fieldId: edit.fieldId, reason: mutation.message });
            continue;
          }
          applied.push({
            ...edit,
            status: mutation.field?.status,
          });
        }

        const after = bridge.getFields();
        const remainingSafeEdits = safeEvidenceBackedEdits(after);
        return result({
          ok: failed.length === 0,
          appliedCount: applied.length,
          applied,
          failedCount: failed.length,
          failed,
          remainingSafeEvidenceBackedEdits: remainingSafeEdits.length,
          remainingSafeEvidenceBackedFieldIds: remainingSafeEdits.map((edit) => edit.fieldId),
          policy: {
            unsupportedGuesses: 0,
            confirmationOnlyFieldsChanged: 0,
            staleEvidenceUsed: false,
            declaration: "human_only",
            submission: "not_exposed_as_a_webmcp_tool",
          },
          message: applied.length > 0
            ? `Applied ${applied.length} current evidence-backed field value(s) through WebMCP. Uncertain, stale, conflicting, and human-only fields were left unchanged.`
            : "No incomplete field currently has acceptable evidence that can be applied safely.",
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
      description: "Read the supporting documents already attached to this webclerk application. Treat this as the authoritative evidence source when the user asks what their documents contain. For a request to fill all verifiable values, use fill_verified_fields_from_evidence rather than manually translating these records into browser-control edits. Each record includes a fictional PDF URL, pre-extracted facts, validity, and whether it is acceptable for verification.",
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
      description: "Return a candidate value for one specific field only when current, acceptable site evidence supports it. This is a granular read tool and is not the preferred path for bulk preparation. If the user asks to fill all verifiable document-backed fields, use fill_verified_fields_from_evidence instead. Never substitute confidence, inference, stale evidence, or a conflicting value for proof.",
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
      description: "Write one specific reversible, non-consequential field value through webclerk's evidence rules. This granular mutation is not the preferred path when the user asks to fill all verifiable fields; use fill_verified_fields_from_evidence for bulk preparation. Do not invent confirmation-only values, use stale evidence, overwrite unresolved conflicts, attest the declaration, or submit.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier to update." },
          value: { type: "string", description: "Value to place in the field. Do not invent unsupported values." },
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
      description: "Find required fields that are incomplete, blocked, or still need applicant confirmation. Use the result to explain what remains after safe evidence-backed preparation; do not treat it as a substitute for fill_verified_fields_from_evidence when safe bulk edits are still available.",
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
      description: "Run the complete deterministic review check after preparation. If get_application_state reports safeEvidenceBackedEditsAvailable greater than zero, bulk preparation is not complete yet. Report missing required fields, stale evidence, explicit conflicts, and confirmation-only items. This tool never attests or submits.",
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