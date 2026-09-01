# Architecture

## Principle

webclerk keeps the human UI and WebMCP agent on the **same browser-visible workflow state**.

```text
Human UI ─────────────┐
                     │
                     ▼
              Shared raw fields
                     │
                     ▼
        Deterministic trust engine
        ├─ evidence mappings
        ├─ validity / staleness
        ├─ conflicts
        ├─ confirmation-only rules
        └─ preflight
                     ▲
                     │
          WebMCP semantic tools
                     ▲
                     │
                   Agent
```

There is no agent-only shadow copy of the application.

## Repository architecture

```text
webmcp/
├── index.ts                     workflow-configurable WebMCP tool factory
├── domain.ts                    reusable deterministic trust engine
├── authority.ts                 machine-readable delegated authority
├── data.ts                      scholarship reference workflow data
├── types.d.ts                   browser WebMCP declarations
├── evals.test.ts                adversarial authority verification
├── *.test.ts                    domain / adapter / metadata tests
└── workflows/
    ├── insurance.ts             second workflow definition
    ├── insurance.test.ts        trust-engine generalization tests
    └── insurance.webmcp.test.ts WebMCP-factory generalization tests

apps/web/src/
├── App.tsx                      scholarship shared-state workspace
├── InsuranceProof.tsx           insurance shared-state workspace
├── LandingPage.tsx              public project entry point
└── main.tsx                     route selection
```

## Workflow definition

The trust engine is not tied to scholarship field IDs.

Each domain supplies `TrustRules`:

```ts
interface TrustRules {
  evidenceFacts: FieldFact[];
  confirmationOnlyFields: ReadonlySet<string>;
  confirmationReasons: Readonly<Record<string, string>>;
}
```

A `FieldFact` connects a workflow field to an authoritative evidence record/value:

```ts
interface FieldFact {
  fieldId: string;
  value: string;
  evidenceId: string;
}
```

The scholarship uses `DEFAULT_TRUST_RULES`. The motor-insurance proof supplies `insuranceTrustRules` to the same domain functions.

## Field state model

Every field is deterministically re-derived as one of:

```text
verified
needs_confirmation
blocked
empty
```

A field becomes `verified` only when current acceptable evidence directly supports the value.

### `verified`

The current field value matches a mapped evidence fact and the evidence passes validity checks.

### `needs_confirmation`

The fact belongs to the human, or no designated evidence can establish it.

Examples:

- scholarship mode of study;
- self-declared household details;
- insurance fault admission;
- first-person incident narrative.

### `blocked`

The value conflicts with evidence or its evidence cannot currently establish the value.

Examples:

- scholarship income conflict;
- stale income certificate;
- insurance repair-estimate conflict.

### `empty`

The field has no value. Some empty fields may still have evidence-backed suggestions that an agent can safely apply.

## Time model

Production validity checks use runtime time:

```ts
isEvidenceStale(document, new Date())
```

Tests inject `TEST_REFERENCE_NOW` so expected staleness remains deterministic.

This avoids using a frozen demo date as production semantics while preserving reproducible tests.

## WebMCP workflow context

`createWebMcpTools` is configured by `WebMcpWorkflowContext`:

```ts
interface WebMcpWorkflowContext {
  application: {
    id: string;
    title: string;
    closingDate?: string;
  };
  evidenceDocuments: EvidenceDocument[];
  trustRules: TrustRules;
  humanOnlyFieldIds: readonly string[];
  evidenceAccess?: string;
}
```

This context controls what evidence, rules and human-only actions the nine semantic tools operate over.

Default context:

```text
Future Scholars Grant 2026
```

Second live context:

```text
Motor Insurance Claim
```

The tool names and semantics remain stable while the workflow data/rules change.

## WebMCP tool factory

`webmcp/index.ts` exposes:

```ts
createWebMcpTools(bridge, context)
registerWebMcpTools(bridge, signal, context)
```

The page supplies a bridge into the current React state:

```ts
interface WebMcpBridge {
  getFields(): ApplicationField[];
  setFieldFromAgent(fieldId: string, value: string): AgentMutationResult;
  onPreflightRun?(): void;
}
```

The same pattern is used by both live workspaces.

## Read / write separation

Seven capabilities are read-only; two mutate shared state.

Read:

```text
get_application_state
inspect_field
list_evidence
suggest_field_value
find_missing_information
check_consistency
run_preflight
```

Write:

```text
fill_verified_fields_from_evidence
set_field_value
```

There is no submission capability.

## Hard authorization boundary

A granular `set_field_value` request passes through site-owned authorization before the React mutation bridge is called.

```text
requested field/value
      ↓
field exists?
      ↓
human-only?
      ↓
mapped evidence exists?
      ↓
evidence current and accepted?
      ↓
existing conflict?
      ↓
requested value exactly supported?
      ↓
mutation bridge
```

Unsafe outcomes return structured errors without state mutation.

This means an agent cannot gain write authority simply by constructing a valid tool call.

## Bulk semantic write

`fill_verified_fields_from_evidence` represents a first-class user intent:

> Fill everything that can be verified without guessing.

The tool considers only incomplete fields and applies only values that have current acceptable evidence. It skips:

- already-completed values;
- stale evidence;
- conflicts;
- confirmation-only fields;
- human-only actions;
- unsupported values.

This avoids repeated DOM edits or many granular tool calls for one semantic operation.

## Machine-readable authority

`webmcp/authority.ts` publishes `AGENT_AUTHORITY`.

It separates useful delegated capability from denied consequential authority:

```text
allowed
├─ inspect state/evidence
├─ suggest verified values
├─ mutate verified values
└─ run preflight

denied
├─ invent unsupported values
├─ silently resolve conflicts
├─ confirm human-only knowledge
├─ attest truthfulness
└─ submit
```

The policy is included in `get_application_state` and `run_preflight` results.

## Untrusted evidence semantics

Evidence-derived tool results use:

```ts
untrustedContentHint: true
```

This applies to:

- field inspection;
- evidence listing;
- evidence-backed suggestions;
- consistency output;
- preflight output.

Evidence is therefore explicitly classified as data that may originate outside the trusted site logic, while deterministic code retains authority over how that data affects field state.

## Human-visible provenance

In the scholarship workspace, WebMCP-authored edits are visibly identified as agent changes and remain undoable.

The UI also exposes:

- supporting evidence;
- field status;
- conflict/staleness explanations;
- agent vs applicant activity;
- final preflight state.

The key UX goal is that agent action is not invisible automation.

## Two live workflows

### Scholarship

`/demo`

Demonstrates:

- six safe evidence-backed edits;
- ambiguous study mode;
- stale/conflicting financial evidence;
- human-only truthfulness declaration.

### Motor insurance

`/proof/insurance`

Demonstrates:

- four safe evidence-backed edits;
- independent policy/vehicle/incident evidence;
- repair-estimate conflict;
- claimant-only legal judgement/narrative;
- human-only fraud declaration.

The second route is architectural proof that both the domain engine and WebMCP factory are reusable.

## Graceful degradation

WebMCP remains experimental. If `document.modelContext` is unavailable:

- the normal human UI still renders;
- registration returns `unavailable`;
- application startup does not fail.

Registration uses `AbortSignal` so tool lifecycle remains tied to the owning page.

## Test architecture

Tests cover three layers:

### Domain

Pure deterministic behavior:

- evidence-backed verification;
- staleness;
- conflicts;
- confirmation-only fields;
- preflight;
- workflow-specific rules.

### WebMCP adapter

- exact tool surface;
- read/write metadata;
- semantic bulk fill;
- granular authorization;
- registration lifecycle;
- shared-state mutation bridge.

### Adversarial / platform semantics

- unsupported-value pressure;
- stale-evidence override attempts;
- self-declared fact escalation;
- human-only attestations;
- absent submit capability;
- `untrustedContentHint`;
- machine-readable authority;
- metadata size budgets;
- insurance WebMCP generalization.

## Prototype boundary

The evidence files are fictional, and the normalized facts are pre-extracted for deterministic demonstration.

The architecture intentionally begins at:

```text
normalized evidence available
              ↓
trust / authority / WebMCP layer
```

Arbitrary OCR, authentication, encrypted persistent storage, and production compliance controls are separate layers and are not claimed by this prototype.
