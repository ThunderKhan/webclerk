# WebMCP Contract

## Why WebMCP is core to webclerk

webclerk is not a chatbot pasted beside a form. The webpage itself exposes the semantic application state and safe actions an agent needs to collaborate with the user.

The important shift is:

```text
Agent guesses UI structure
        ↓
Agent operates controls
```

becomes:

```text
Page exposes meaning + state + actions
        ↓
Agent invokes structured tools
        ↓
Same application state updates visibly
```

For the current WebMCP draft, tools are registered through `document.modelContext.registerTool(...)`.

## Design rules

1. **Tools describe user-relevant capabilities, not implementation details.**
2. **Read and write tools are separate where that improves safety and agent planning.**
3. **Mutations go through normal application services.**
4. **No tool may silently elevate uncertainty to verification.**
5. **Tool results should be concise, structured, and useful for the agent's next decision.**
6. **Consequential submission remains outside the agent tool surface in the MVP.**

## Tool catalog

### `get_application_state`

**Purpose:** Give the agent a compact overview of the current case before deciding what to inspect or change.

**Input:** none.

**Returns:** application metadata, completion summary, field-state counts, section summaries, evidence availability, recommended tool flow, and human-authority boundaries.

**Read-only.**

---

### `inspect_field`

**Purpose:** Inspect one field in semantic detail.

**Input:**

```json
{ "fieldId": "family_income" }
```

**Returns:** current value, semantic status, supporting evidence, evidence value, evidence validity, whether it is acceptable for verification, and the deterministic reason for the current state.

**Read-only.**

---

### `list_evidence`

**Purpose:** Discover the supporting documents and pre-extracted facts available to support answers.

**Input:** optional document kind/filter.

**Returns:** document metadata, source PDF URL, structured facts, validity, and `acceptableForVerification`.

**Read-only.**

---

### `suggest_field_value`

**Purpose:** Ask the application domain layer for an evidence-backed candidate for one field.

**Input:** field id.

If the system cannot support a value with current acceptable evidence, it returns an explicit reason rather than guessing.

**Read-only with respect to form state.**

---

### `set_field_value`

**Purpose:** Apply one reversible, non-consequential value through normal domain logic.

**Behavior:**

- reject invalid field ids;
- preserve previous value for undo;
- create an agent-authored change record;
- re-derive the field state from evidence and deterministic rules;
- never mark unsupported values verified;
- reject the applicant declaration with `HUMAN_ACTION_REQUIRED`.

**Mutating.**

---

### `apply_verified_fields`

**Purpose:** Represent the bulk user intent “fill everything you can verify from my documents without guessing” as one semantic WebMCP capability.

**Input:** none.

**Behavior:**

- inspect all currently incomplete fields;
- apply only values backed by current, acceptable mapped evidence;
- use the same agent mutation bridge as `set_field_value` so every write is attributed to the WebMCP agent and remains reversible;
- skip already-completed fields;
- skip confirmation-only fields;
- skip stale evidence;
- skip unresolved conflicts;
- skip the applicant declaration;
- never submit the application.

For the seeded demo, it should apply exactly six fields:

```text
programme
year
enrollment
previous_score
domicile_state
domicile_cert
```

**Mutating, but constrained to evidence-backed preparation.**

---

### `find_missing_information`

**Purpose:** Tell the agent what prevents the application from being complete or review-ready.

**Returns:** unresolved required fields, blocked requirements, and confirmation requests.

**Read-only.**

---

### `check_consistency`

**Purpose:** Compare current form values and supporting evidence.

Must detect the seeded MVP case:

```text
Form annual family income: ₹350,000
Income certificate:        ₹320,000
```

Expected result: explicit conflict; no automatic resolution.

**Read-only.**

---

### `run_preflight`

**Purpose:** Run all relevant validation before the human reviews/submits.

**Returns:** readiness state, blockers, warnings, unresolved confirmations, stale evidence, consistency conflicts, and human-authority boundaries.

Must detect the seeded stale income certificate requirement.

**Read-only with respect to user-entered field values.** It may store/display the latest preflight result.

---

## Tool intentionally omitted

There is no:

```text
submit_application
```

This is an explicit product and safety decision, not an unfinished feature.

The agent can prepare; the human commits.

## Preferred orchestration

For a natural bulk request such as:

> Fill everything you can verify from my documents. Don't guess anything.

prefer:

```text
list_evidence
  → apply_verified_fields
  → run_preflight
```

For a granular one-field task:

```text
suggest_field_value
  → set_field_value
```

`apply_verified_fields` exists because the bulk user intent is a first-class application capability. It is more reliable and semantically clearer than asking an agent to click six controls or orchestrate a dozen granular calls.

## Registration pattern

The implementation uses the browser-side producer API:

```ts
const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "inspect_field",
    description:
      "Inspect one field in the current application, including its value, status, validation issues, and supporting evidence.",
    inputSchema: {
      type: "object",
      properties: {
        fieldId: {
          type: "string",
          description: "Stable identifier of the application field to inspect."
        }
      },
      required: ["fieldId"],
      additionalProperties: false
    },
    async execute({ fieldId }) {
      return inspectField(fieldId);
    }
  },
  { signal: controller.signal }
);
```

`controller.abort()` ends the registration lifecycle.

## Tool naming

Prefer clear snake_case names that state a concrete capability:

```text
get_application_state
inspect_field
list_evidence
apply_verified_fields
check_consistency
run_preflight
```

Avoid vague names such as:

```text
assistant
process
handle_form
do_everything
```

`apply_verified_fields` is intentionally specific: it does not “complete the form.” It only applies values that the deterministic evidence engine can verify.

## Safe mutation model

For a field to become `verified`, accepted current evidence must directly support the value and all relevant evidence rules must pass. Agent confidence alone is never sufficient.

Confirmation-only facts remain applicant decisions. The truthfulness declaration is never agent-authorizable.

## Failure behavior

Tool calls should fail loudly and semantically for expected domain failures. For example:

```json
{
  "ok": false,
  "code": "HUMAN_ACTION_REQUIRED",
  "message": "The declaration is a consequential truthfulness attestation and must be performed by the applicant."
}
```

Avoid raw stack traces or generic errors for expected business-rule failures.

## Graceful WebMCP fallback

Because WebMCP is experimental:

```ts
if (!("modelContext" in document)) {
  // Keep the human UI functional; skip agent tool registration.
}
```

Registration errors are isolated from normal app startup.

## Judging proof

The demo should make three things visible:

1. the agent discovers and uses structured webclerk tools;
2. `apply_verified_fields` visibly updates the same form state the human sees and records those writes as WebMCP-agent edits;
3. semantic constraints stop the agent from guessing, using stale evidence, resolving conflicts silently, or bypassing human control.

That is the WebMCP story. Tool count alone is not.
