# WebMCP Contract

webclerk uses WebMCP as the native semantic interface between a browser agent and a consequential workflow. The agent does not operate by guessing DOM structure or clicking coordinates. The page publishes the meaning of its current state, safe actions, evidence, conflicts, and delegated authority.

## Core model

```text
human intent
    ↓
agent chooses semantic WebMCP capability
    ↓
site-owned trust rules authorize or refuse
    ↓
shared browser-visible state updates
```

The important distinction is that the **site**, not model confidence, decides what evidence is sufficient and which actions remain human-only.

## Workflow-configurable tool factory

The implementation is in `webmcp/index.ts`.

`createWebMcpTools(bridge, context)` and `registerWebMcpTools(bridge, signal, context)` accept a `WebMcpWorkflowContext`:

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

The default context is the scholarship demo. A second live motor-insurance workspace supplies different fields, evidence, trust rules, conflicts, and human-only actions to the **same tool factory**.

Live routes:

```text
/demo              scholarship reference workflow
/proof/insurance   motor-insurance generalization proof
```

## Tool catalog

webclerk exposes exactly nine semantic tools.

| Tool | Type | Purpose |
|---|---|---|
| `get_application_state` | Read | Read current workflow state, blockers, safe next actions, and delegated authority |
| `fill_verified_fields_from_evidence` | Write | Fill all currently incomplete values supported by acceptable evidence |
| `inspect_field` | Read | Explain one field's state, evidence, provenance, and mutation eligibility |
| `list_evidence` | Read | List evidence records, structured facts, validity, and verification eligibility |
| `suggest_field_value` | Read | Return one evidence-supported candidate value |
| `set_field_value` | Write | Apply one exact value only after deterministic site-side authorization |
| `find_missing_information` | Read | Find incomplete, blocked, and human-confirmation requirements |
| `check_consistency` | Read | Surface contradictions and invalid evidence without resolving them |
| `run_preflight` | Read | Run the deterministic final review gate |

There is deliberately **no submission tool**.

## Preferred orchestration

For a bulk preparation request:

> Fill everything you can verify from my documents. Don't guess anything.

preferred flow:

```text
get_application_state
  → fill_verified_fields_from_evidence
  → run_preflight
```

For one field:

```text
inspect_field / suggest_field_value
  → set_field_value
```

The bulk capability exists because "prepare every safely verifiable field" is a first-class application operation. It is more semantic and reliable than a sequence of browser-control edits.

## Machine-readable authority

`webmcp/authority.ts` defines `AGENT_AUTHORITY`:

```text
inspect evidence             allowed
inspect application state    allowed
suggest verified values      allowed
mutate verified fields       allowed
run preflight                allowed

infer unsupported values     denied
resolve conflicts             denied
confirm applicant knowledge  denied
attest truthfulness           denied
submit                       denied
```

`get_application_state` and `run_preflight` return this policy to the agent.

Each workflow also supplies `humanOnlyFieldIds`. For the scholarship demo that includes `declaration`; for the insurance proof it includes `fraud_declaration`.

## Hard write boundary

`set_field_value` does not trust the agent's requested value merely because the tool call is syntactically valid.

Before invoking the application mutation bridge, the site checks:

1. the field exists;
2. the field is not human-only;
3. authoritative evidence is mapped;
4. the evidence is current;
5. the evidence is accepted;
6. an existing conflict is not being silently overwritten;
7. the requested value exactly matches the current evidence-backed suggestion.

Possible structured refusals include:

```text
FIELD_NOT_FOUND
HUMAN_ACTION_REQUIRED
HUMAN_CONFIRMATION_REQUIRED
STALE_EVIDENCE
EVIDENCE_REQUIRES_ATTENTION
CONFLICT_REQUIRES_HUMAN
UNSUPPORTED_VALUE
```

The refusal occurs **before state mutation**.

This makes the trust boundary capability-enforced rather than prompt-only.

## Evidence security semantics

Evidence can contain user-provided or externally sourced text. That content is data, not instructions to the agent.

Evidence-derived tools therefore use WebMCP's `untrustedContentHint` annotation:

- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `check_consistency`
- `run_preflight`

Write tools remain explicitly writable with `readOnlyHint: false`; read tools use `readOnlyHint: true`.

Metadata tests also enforce concise descriptions and parameter-description budgets so the tool surface remains legible to agents.

## Deterministic trust rules

`webmcp/domain.ts` defines reusable `TrustRules`:

```ts
interface TrustRules {
  evidenceFacts: FieldFact[];
  confirmationOnlyFields: ReadonlySet<string>;
  confirmationReasons: Readonly<Record<string, string>>;
}
```

The deterministic engine derives four field states:

```text
verified
needs_confirmation
blocked
empty
```

Model confidence is never part of the transition to `verified`.

Time-sensitive evidence uses runtime time in production. Tests inject a fixed reference clock so staleness behavior remains deterministic.

## Scholarship reference workflow

At reset, the scholarship demo intentionally contains:

- six blank fields that can be safely recovered from current accepted evidence;
- applicant-confirmation fields such as mode of study;
- a ₹3,50,000 form value vs ₹3,20,000 evidence conflict;
- a stale income certificate;
- a human-only truthfulness declaration.

A successful bulk preparation writes exactly the six safe values and leaves everything else unresolved.

## Insurance generalization proof

The live insurance workspace uses the same domain engine and WebMCP factory with:

- claimant identity and policy evidence;
- vehicle registration evidence;
- incident-date evidence;
- a seeded ₹85,000 vs ₹78,500 repair-estimate conflict;
- claimant-only fault admission;
- claimant-only first-person narrative;
- a human-only fraud declaration.

The safe bulk path can fill claimant name, policy number, vehicle registration, and incident date while preserving the conflict and human-only decisions.

This is executable proof that the WebMCP layer is workflow-configurable rather than scholarship-specific.

## Adversarial evals

`webmcp/evals.test.ts` exercises requests that should not gain authority simply because a user pressures the agent to proceed:

- fabricate a plausible value;
- ignore stale evidence;
- overwrite a conflict;
- convert self-declared information into an agent-authored fact;
- complete a truthfulness declaration;
- submit.

Unsafe requests must fail before mutation. A positive control verifies that legitimate evidence-backed preparation still succeeds.

See `docs/EVALS.md`.

## Registration lifecycle

Because WebMCP is experimental, registration degrades cleanly:

```ts
if (!document.modelContext) {
  return { status: "unavailable", registered: 0 };
}
```

Tools are registered with an `AbortSignal`, and registration failures are isolated from normal human UI startup.

## Design invariant

webclerk's WebMCP contract is intentionally asymmetric:

```text
Agent capability can be broad enough to help.
Human authority remains narrow enough to matter.
```

The point is not to make an agent powerless. It is to make useful delegation explicit, inspectable, and bounded by the website itself.
