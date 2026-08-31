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

**Returns:**

- application id/title;
- completion summary;
- field-state counts;
- section summaries;
- blocker/warning counts;
- whether evidence is available;
- whether preflight has been run.

**Read-only.**

---

### `inspect_field`

**Purpose:** Inspect one field in semantic detail.

**Input:**

```json
{ "fieldId": "annual_family_income" }
```

**Returns:**

- label and description;
- required status;
- current value;
- semantic status;
- requirements/rules;
- supporting evidence;
- conflicts/findings;
- whether agent mutation is currently allowed.

**Read-only.**

---

### `list_evidence`

**Purpose:** Discover the documents/facts available to support answers.

**Input:** optional document kind/filter.

**Returns:** document metadata and structured facts, including issue date where relevant.

**Read-only.**

---

### `suggest_field_value`

**Purpose:** Ask the application domain layer for an evidence-backed candidate for a field.

**Input:** field id.

**Returns:**

```json
{
  "fieldId": "institution",
  "suggestedValue": "Deen Dayal Upadhyaya Gorakhpur University",
  "status": "verified",
  "provenance": [
    {
      "documentId": "enrollment-certificate",
      "factKey": "institution"
    }
  ]
}
```

If the system cannot support a value, it returns an explicit reason rather than guessing.

**Read-only with respect to form state.**

---

### `set_field_value`

**Purpose:** Apply a value to a field through normal domain logic.

**Input:**

- field id;
- proposed value;
- provenance reference(s) when evidence-backed;
- intended status (`verified` or `needs_confirmation`) subject to domain validation.

**Behavior:**

- reject invalid field ids;
- reject impossible status transitions;
- preserve previous value for undo;
- create an agent-authored change record;
- never mark unsupported values verified.

**Mutating.**

---

### `find_missing_information`

**Purpose:** Tell the agent what prevents the application from being complete/review-ready.

**Returns:** unresolved required fields, missing evidence, blocked requirements, and confirmation requests grouped by priority.

**Read-only.**

---

### `check_consistency`

**Purpose:** Compare related form values and supporting evidence.

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

**Returns:**

- readiness state;
- blockers;
- warnings;
- unresolved confirmations;
- stale evidence;
- consistency conflicts;
- verification counts.

Must detect the seeded stale income certificate requirement.

**Read-only with respect to user-entered field values.** It may store/display the latest preflight result.

---

### `prepare_submission` (stretch)

**Purpose:** Freeze or present a review snapshot after successful preflight.

It may organize the final review state but **must not submit** the application externally.

---

## Tool intentionally omitted

There is no:

```text
submit_application
```

This is an explicit product and safety decision, not an unfinished feature.

The agent can prepare; the human commits.

## Registration pattern

The implementation should use the current browser-side producer API:

```ts
const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "inspect_field",
    description:
      "Inspect one field in the current application, including its value, requirements, status, validation issues, and supporting evidence.",
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

// controller.abort() unregisters this registration lifecycle.
```

## Tool naming

Prefer clear snake_case verbs/nouns that state one capability:

```text
get_application_state
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

## Tool descriptions matter

Descriptions should tell the agent **when** to use the tool, not simply repeat the name.

Bad:

> Inspect field.

Better:

> Inspect one application field when you need its current value, meaning, requirements, validation state, or supporting evidence before explaining or modifying it.

## Safe mutation model

For a field to become `verified`, one of these must hold:

1. accepted evidence directly supports the value and all relevant evidence rules pass; or
2. the product rule explicitly permits user confirmation and the human has confirmed the value.

An agent confidence score by itself is never sufficient.

## Dynamic registration

Dynamic tools are a stretch feature.

Potential progression:

```text
Initial
  get_application_state
  inspect_field
  list_evidence

Evidence loaded
  suggest_field_value
  set_field_value
  check_consistency

Review stage
  find_missing_information
  run_preflight
  prepare_submission
```

If this harms reliability, keep all safe tools registered and enforce state preconditions in `execute`.

## Failure behavior

Tool calls should fail loudly and semantically:

```json
{
  "ok": false,
  "code": "EVIDENCE_CONFLICT",
  "message": "The requested value cannot be verified because the form and income certificate contain different amounts.",
  "fieldId": "annual_family_income"
}
```

Avoid raw stack traces or generic `Something went wrong` responses for expected domain failures.

## Graceful WebMCP fallback

Because WebMCP is experimental:

```ts
if (!("modelContext" in document)) {
  // Keep the human UI functional; skip agent tool registration.
}
```

Registration errors should be isolated from normal app startup.

## Judging proof

The demo should make three things visible:

1. the agent discovers/uses structured webclerk tools;
2. tool calls visibly update the same form state the human sees;
3. semantic constraints stop the agent from guessing or bypassing human control.

That is the WebMCP story. Tool count alone is not.
