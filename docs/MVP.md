# MVP Scope

## Goal

Ship one polished, deterministic WebMCP experience that proves a human and an AI agent can complete a consequential form together more safely than either generic autofill or copy/paste chat.

## Hard scope

The MVP contains exactly one fictional workflow:

**Future Scholars Grant 2026** — a scholarship application with roughly 20–25 fields and five supporting documents.

Do not add a second application type until every acceptance criterion below is complete.

## Required screens

### 1. Landing / entry

Purpose: explain the product in seconds and launch the seeded demo.

Minimum content:

- webclerk name
- "Never guess on consequential forms."
- one-sentence explanation
- `Try demo application` action

### 2. Application workspace

This is the main product.

Must show:

- application sections and fields;
- overall completion/status summary;
- field state: empty / verified / needs confirmation / blocked;
- evidence/source attached to populated fields;
- supporting-document panel;
- visible record of agent-originated changes;
- direct human editing/confirmation.

### 3. Preflight state

May be a mode/panel rather than a separate route.

Must show:

- blocking issues;
- warnings;
- unresolved confirmations;
- stale evidence;
- conflicting values;
- whether the application is ready for human submission.

## Seeded application data

### Sections

**Personal**
- full name
- date of birth
- current address
- state of domicile

**Education**
- institution
- program
- current year
- enrollment number
- previous-year score

**Financial**
- annual family income
- number of dependents
- primary earning member

**Eligibility**
- category/status fields needed by the fictional grant
- existing scholarship status
- domicile confirmation

Add enough supporting fields to reach roughly 20–25 without introducing unrelated complexity.

## Seeded evidence

- Identity document
- Enrollment certificate
- Marksheet
- Income certificate
- Domicile certificate

Evidence should be represented internally as structured facts. Real generalized OCR is optional and must not become a dependency for the core demo.

## Deliberate demo conditions

The seed dataset must include:

### Conflict

Existing form value:

`annual_family_income = 350000`

Income certificate:

`annual_family_income = 320000`

Expected result: preflight marks this as a conflict and does not silently choose one value.

### Stale evidence

The income certificate is older than the fictional scholarship's allowed 12-month recency window.

Expected result: preflight marks the evidence invalid/stale even though a value can be extracted from it.

### Human confirmation

At least one field must have evidence that supports a likely interpretation but not an automatic verified value.

Expected result: agent suggests, UI marks `needs_confirmation`, human confirms or rejects.

## Required WebMCP interactions

The demo must support these user intents:

1. **"Fill everything you can verify from my documents. Don't guess anything."**
2. **"Why didn't you fill this field?"**
3. **"Where did this answer come from?"**
4. **"What am I missing?"**
5. **"Check everything before I submit."**

The exact natural-language phrasing is not part of the product contract; the underlying WebMCP tool behaviors are.

## Minimum WebMCP tool set

Required:

- `get_application_state`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

Optional if time permits:

- `prepare_submission`
- state-aware dynamic registration/unregistration

Explicitly excluded:

- `submit_application`

## Definition of done

### Product

- [ ] Landing page launches the seeded scenario.
- [ ] Scholarship form has ~20–25 realistic fields.
- [ ] Five evidence documents/fact sets are visible.
- [ ] Every field has a semantic status.
- [ ] Agent-populated fields show provenance.
- [ ] Uncertain values remain unverified until the user confirms.
- [ ] Human can undo/reject agent changes.
- [ ] Seeded income conflict is detected.
- [ ] Seeded stale certificate is detected.
- [ ] Preflight produces blockers/warnings/summary.
- [ ] No autonomous submission exists.

### WebMCP

- [ ] Tools are registered through the current `document.modelContext` API.
- [ ] Tool descriptions and input schemas are precise enough for reliable agent selection.
- [ ] Tools call the same application logic used by the UI; no parallel hidden state.
- [ ] Tool results return concise structured/useful feedback.
- [ ] Unsupported WebMCP environments fail gracefully rather than breaking the normal UI.

### Demo quality

- [ ] Fresh judge can launch the demo without account setup.
- [ ] Happy path is deterministic.
- [ ] Core value appears within 30 seconds.
- [ ] Three visible "aha" moments fit under three minutes.
- [ ] WebMCP usage can be shown briefly in code/devtools without derailing the story.

## Scope guardrails

Do **not** spend hackathon time on these until definition-of-done is green:

- arbitrary PDF OCR accuracy;
- authentication;
- database infrastructure;
- real scholarship APIs;
- payments;
- browser extension support;
- generalized website/form parsing;
- multiple user accounts;
- dashboards/admin portals;
- complex agent frameworks;
- vector databases/RAG unless a concrete MVP requirement emerges.

## Stretch ideas

Only after MVP completion:

1. Dynamic WebMCP tool availability based on application state.
2. Agent-change review tray with accept/reject-all and per-field undo.
3. A second fictional form to prove generality.
4. Declarative WebMCP for simple form controls alongside imperative tools.
5. Document upload/extraction beyond seeded structured evidence.
