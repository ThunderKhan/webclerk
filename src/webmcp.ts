import { evidenceDocuments, scholarship, type ApplicationField } from "./data";
import {
  checkConsistency,
  evidenceFacts,
  findMissingInformation,
  inspectField,
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

export function createWebMcpTools(bridge: WebMcpBridge): WebMcpToolDefinition[] {
  return [
    {
      name: "get_application_state",
      description: "Get a compact overview of the current scholarship application before deciding which field, evidence item, or validation issue to inspect next.",
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
      description: "Inspect one application field when you need its current value, meaning, validation state, supporting evidence, or reason it cannot yet be verified.",
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
        return result({
          ok: true,
          field: inspection.field,
          evidence: inspection.evidence,
          evidenceValue: inspection.evidenceValue,
          status: inspection.status,
          reason: inspection.reason,
          agentMutationAllowed: fieldId !== "declaration",
        });
      },
    },
    {
      name: "list_evidence",
      description: "List the supporting records available to the application, including their type, issue date, validity rule, and structured facts that can support form answers.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", description: "Optional evidence-kind substring such as identity, education, financial, or residence." },
        },
        additionalProperties: false,
      },
      execute: (input) => {
        const kind = stringArg(input, "kind")?.toLocaleLowerCase("en-IN");
        const evidence = kind
          ? evidenceDocuments.filter((document) => document.kind.toLocaleLowerCase("en-IN").includes(kind))
          : evidenceDocuments;
        return result({
          ok: true,
          evidence: evidence.map((document) => ({
            ...document,
            facts: evidenceFacts
              .filter((fact) => fact.evidenceId === document.id)
              .map((fact) => ({ fieldId: fact.fieldId, value: fact.value })),
          })),
        });
      },
    },
    {
      name: "suggest_field_value",
      description: "Ask webclerk for an evidence-backed candidate value for a field. Use this before writing a value when the user wants verified information filled without guessing.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier to find evidence for." },
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
            message: "No current, acceptable evidence can support a value for this field. Leave it unresolved or ask the applicant to confirm it.",
          });
        }
        return result({ ok: true, fieldId, suggestedValue: suggestion.value, provenance: suggestion });
      },
    },
    {
      name: "set_field_value",
      description: "Write a proposed value into one application field through webclerk's normal domain rules. The page will visibly record the agent-authored edit and re-derive whether the result is verified, needs confirmation, or is blocked. The final applicant declaration cannot be completed by an agent.",
      inputSchema: {
        type: "object",
        properties: {
          fieldId: { type: "string", description: "Stable field identifier to update." },
          value: { type: "string", description: "Value to place in the field. Do not invent values that are not supported by evidence or explicit user instruction." },
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
            message: "The applicant declaration is a consequential attestation and must be completed directly by the human applicant.",
          });
        }
        return result(bridge.setFieldFromAgent(fieldId, value));
      },
    },
    {
      name: "find_missing_information",
      description: "Find required fields that are incomplete, blocked, or still need applicant confirmation so you can explain what prevents the application from being review-ready.",
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
      description: "Compare current form values with supporting evidence and return explicit conflicts or invalid evidence without resolving them automatically.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const conflicts = checkConsistency(bridge.getFields(), evidenceDocuments);
        return result({ ok: true, count: conflicts.length, conflicts });
      },
    },
    {
      name: "run_preflight",
      description: "Run the complete deterministic application preflight before the user reviews submission, including missing required fields, stale evidence, conflicts, and unresolved confirmations.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => {
        const preflight = runPreflight(bridge.getFields(), evidenceDocuments);
        bridge.onPreflightRun?.();
        return result({ ok: true, ...preflight });
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
