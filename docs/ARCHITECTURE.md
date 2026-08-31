# Architecture

## Architectural principle

The visible application state is the source of truth. WebMCP tools must call the same domain/application functions used by the human UI rather than maintaining a separate agent-only state model.

```text
Human UI ───────┐
                │
                ▼
        Application Domain
        ├─ form state
        ├─ evidence state
        ├─ validation
        ├─ provenance
        └─ change history
                ▲
                │
WebMCP tools ───┘
```

This ensures that agent actions are visible, reviewable, and reversible in the same workspace the human sees.

## Suggested stack

Keep the stack intentionally small:

- React + TypeScript
- Vite or Next.js (choose one during scaffold; either is sufficient)
- local/in-memory seeded application data for the hackathon demo
- optional lightweight persistence only if it improves the demo
- browser-native `document.modelContext` WebMCP API

Do not introduce a backend merely to look production-like.

## Domain model

### Application

```ts
interface ApplicationCase {
  id: string;
  title: string;
  sections: FormSection[];
  evidence: EvidenceDocument[];
  changes: ChangeRecord[];
  requirements: ApplicationRequirement[];
}
```

### Form field

```ts
type FieldStatus =
  | "empty"
  | "verified"
  | "needs_confirmation"
  | "blocked";

interface FormField {
  id: string;
  label: string;
  description: string;
  required: boolean;
  value?: string | number | boolean;
  status: FieldStatus;
  provenance: EvidenceReference[];
  rules: ValidationRule[];
}
```

### Evidence

```ts
interface EvidenceDocument {
  id: string;
  title: string;
  kind: string;
  issuedAt?: string;
  facts: EvidenceFact[];
}

interface EvidenceFact {
  key: string;
  value: string | number | boolean;
  confidence?: number;
  sourceLabel: string;
}
```

For the MVP, facts may be seeded with the demo document rather than extracted using generalized OCR.

### Provenance

```ts
interface EvidenceReference {
  documentId: string;
  factKey: string;
  sourceLabel: string;
}
```

A value should never become `verified` solely because the agent suggested it. Verification requires acceptable evidence or explicit user confirmation under a rule that permits confirmation.

### Change record

```ts
interface ChangeRecord {
  id: string;
  fieldId: string;
  previousValue: unknown;
  nextValue: unknown;
  actor: "human" | "agent";
  provenance?: EvidenceReference[];
  createdAt: string;
}
```

This supports visible agent activity and undo.

## Application services

Keep domain behavior in pure/testable functions where possible:

```text
getApplicationState()
getField(fieldId)
getEvidence()
suggestValue(fieldId)
setFieldValue(...)
findMissingInformation()
checkConsistency()
runPreflight()
undoChange(changeId)
```

Both React components and WebMCP `execute` callbacks call these services.

## Validation layers

### Field validation

Checks type/format/range/required constraints.

### Evidence validation

Checks whether evidence supports a value and remains valid under a requirement such as issue-date recency.

### Cross-field consistency

Checks relationships between fields and evidence, e.g. the income entered in the form differs from the certificate.

### Preflight

Aggregates all validation into:

```ts
interface PreflightResult {
  readyForReview: boolean;
  blockers: Finding[];
  warnings: Finding[];
  unresolved: Finding[];
  verifiedCount: number;
  totalRequired: number;
}
```

`readyForReview` is deliberately not `submitted` or even necessarily `eligible`.

## UI architecture

Suggested high-level components:

```text
AppShell
├── ApplicationHeader
│   └── StatusSummary
├── ApplicationWorkspace
│   ├── FormPanel
│   │   ├── FormSection
│   │   └── FieldRow
│   └── EvidencePanel
│       ├── EvidenceList
│       └── EvidenceInspector
├── AgentChangeTray
└── PreflightPanel
```

A dedicated chat UI is optional. The product should remain useful even when the agent conversation lives in the browser/ChatGPT agent surface. The web app's job is to expose state and render consequences clearly.

## WebMCP layer

Create a small registration module such as:

```text
src/webmcp/registerTools.ts
src/webmcp/toolSchemas.ts
src/webmcp/toolResults.ts
```

Tool callbacks should be thin adapters around application services.

Example shape:

```ts
await document.modelContext.registerTool({
  name: "inspect_field",
  description: "Inspect one application field, including its current value, requirements, status, validation issues, and supporting evidence.",
  inputSchema: {
    type: "object",
    properties: {
      fieldId: { type: "string" }
    },
    required: ["fieldId"],
    additionalProperties: false
  },
  async execute({ fieldId }) {
    return inspectField(fieldId);
  }
});
```

Use `AbortController` registration lifecycle where appropriate so tools can be removed when their owning page/state is no longer active.

## Dynamic tools

Dynamic registration is a stretch, not an MVP dependency.

Possible lifecycle:

```text
Always available
├─ get_application_state
├─ inspect_field
└─ list_evidence

Evidence available
├─ suggest_field_value
└─ check_consistency

Application sufficiently complete
├─ run_preflight
└─ prepare_submission
```

If dynamic registration creates instability, register the stable tool surface for the demo and enforce preconditions inside tool execution.

## Graceful degradation

WebMCP is experimental. The normal human UI must still load when `document.modelContext` is unavailable.

Recommended behavior:

- feature-detect `document.modelContext`;
- show a small "WebMCP unavailable" development/debug notice if useful;
- never crash application initialization due to tool registration failure;
- keep domain logic independent of WebMCP.

## Data/privacy model for hackathon

Use fictional seed data only.

No real:

- government IDs;
- student records;
- bank statements;
- income documents;
- addresses;
- third-party authentication tokens.

This keeps the MVP reproducible and avoids making privacy engineering the hackathon's hidden primary problem.

## Testing priorities

Highest-value tests:

1. verified values require acceptable provenance;
2. uncertain suggestions cannot silently transition to verified;
3. conflicting income values generate a finding;
4. stale income certificate generates a blocker/warning per the seeded requirement;
5. WebMCP mutation calls use the same state transition functions as human UI;
6. undo restores the previous value/status/provenance;
7. preflight output is deterministic for seeded demo data.
