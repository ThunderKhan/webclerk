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
5. **Tool results should make the recommended next action explicit when safe work remains.**
6. **Consequential submission remains outside the agent tool surface in the MVP.**

## Tool catalog

### `get_application_state`

**Purpose:** Give the agent a compact overview of the current case and make unfinished safe evidence-backed work explicit.

**Input:** none.

**Returns:** application metadata, completion summary, field-state counts, section summaries, evidence availability, human-authority boundaries, and:

- `safeEvidenceBackedEditsAvailable`;
- `safeEvidenceBackedFieldIds`;
- `recommendedNextAction`;
- preferred bulk preparation flow.

At the seeded reset state, the expected values are:

```text
safeEvidenceBackedEditsAvailable = 6
recommendedNextAction = fill_verified_fields_from_evidence
```

The state contract explicitly tells an agent not to conclude that document-backed preparation is complete while `safeEvidenceBackedEditsAvailable > 0`.

**Read-only.**

---

### `fill_verified_fields_from_evidence`

**Purpose:** Represent the natural user intent “fill/autofill/complete/populate everything that can be verified from my documents without guessing” as one first-class semantic WebMCP capability.

This tool is intentionally the second registered capability, immediately after `get_application_state`.

**Input:** none.

**Behavior:**

- use the site's deterministic evidence model rather than browser form controls;
- inspect all currently incomplete fields;
- apply only values backed by current, acceptable mapped evidence;
- write through the same agent mutation bridge as `set_field_value` so every edit is attributed to the WebMCP agent and remains reversible;
- skip already-completed fields;
- skip confirmation-only fields;
- skip stale evidence;
- skip unresolved conflicts;
- skip the applicant declaration;
- never submit the application;
- report how many safe edits remain after the operation.

For the seeded demo, it should apply exactly six fields:

```text
programme
year
enrollment
previous_score
domicile_state
domicile_cert
```

After a successful reset-state run:

```text
appliedCount = 6
remainingSafeEvidenceBackedEdits = 0
```

**Mutating, but constrained to evidence-backed preparation.**

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

For a bulk fill request, this tool is informational only; `fill_verified_fields_from_evidence` is the preferred mutation path.

**Read-only.**

---

### `suggest_field_value`

**Purpose:** Ask the application domain layer for an evidence-backed candidate for one specific field.

**Input:** field id.

If the system cannot support a value with current acceptable evidence, it returns an explicit reason rather than guessing.

This is a granular helper and is explicitly **not** the preferred path for bulk preparation.

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

This is a granular mutation and is explicitly **not** the preferred path for “fill everything verifiable” requests.

**Mutating.**

---

### `find_missing_information`

**Purpose:** Tell the agent what prevents the application from being complete or review-ready after safe preparation.

**Returns:** unresolved required fields, blocked requirements, and confirmation requests.

It should not be treated as a substitute for bulk fill while `get_application_state` reports safe evidence-backed edits available.

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

If safe evidence-backed edits are still available, bulk preparation is not yet complete.

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
get_application_state
  → fill_verified_fields_from_evidence
  → run_preflight
```

The state read is useful because it explicitly returns six safe edits and names `fill_verified_fields_from_evidence` as the recommended next action.

For a granular one-field task:

```text
suggest_field_value
  → set_field_value
```

The bulk capability exists because this user intent is a first-class application operation. It is semantically clearer than asking an agent to click six controls or orchestrate a dozen granular calls.

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

Prefer clear snake_case names that make the user intent obvious:

```text
get_application_state
fill_verified_fields_from_evidence
inspect_field
list_evidence
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

`fill_verified_fields_from_evidence` is deliberately explicit: it does not “complete the form.” It only fills fields the deterministic evidence engine can verify from acceptable evidence.

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

1. the agent discovers the structured webclerk state and sees that safe document-backed work remains;
2. `fill_verified_fields_from_evidence` visibly updates the same form state the human sees and records those writes as WebMCP-agent edits;
3. semantic constraints stop the agent from guessing, using stale evidence, resolving conflicts silently, or bypassing human control.

That is the WebMCP story. Tool count alone is not.