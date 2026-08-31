# WebMCP Verification Plan

This checklist is the release gate for the hackathon demo. Browser-level WebMCP discovery/invocation and a complete natural-language ChatGPT desktop rehearsal have already succeeded on production. The remaining risk is whether the desktop agent consistently chooses the site's semantic bulk mutation for the natural fill request.

## Verified testing paths

webclerk has been exercised through two complementary paths:

1. **ChatGPT desktop built-in browser** for real natural-language agent orchestration and site-tool discovery.
2. **Brave with WebMCP testing enabled** for direct browser-level tool discovery and deterministic tool invocation.

The production target is:

`https://webclerk.netlify.app/`

## Automated verification

The repository tests cover:

- deterministic evidence-backed field derivation;
- seeded ₹350,000 vs ₹320,000 income conflict;
- stale 12-month income-certificate rule;
- fields requiring human confirmation remain unresolved;
- stale evidence is not returned as a safe suggestion;
- evidence results expose structured facts, inspectable PDF URLs, and verification validity;
- reset state reports exactly six safe evidence-backed edits;
- `get_application_state` names those six field IDs and returns `recommendedNextAction = fill_verified_fields_from_evidence`;
- `fill_verified_fields_from_evidence` writes exactly the six incomplete fields backed by current acceptable evidence;
- bulk fill skips already-completed fields, stale/conflicting evidence, unsupported fields, and the declaration;
- bulk fill reports zero remaining safe edits after success;
- granular `suggest_field_value` / `set_field_value` tools remain available but are explicitly not preferred for bulk preparation;
- preflight blocks unresolved applications;
- exactly nine semantic WebMCP tools are defined;
- no `submit_application` tool exists;
- final applicant declaration rejects agent mutation with `HUMAN_ACTION_REQUIRED`;
- `document.modelContext.registerTool(...)` receives every tool and the supplied AbortSignal;
- unsupported browsers degrade to `unavailable`;
- registration errors are isolated instead of breaking the normal form.

## Final production E2E gate

Use a **fresh ChatGPT desktop chat** for each run. Open the production URL, press **Reset demo**, and do not change the prompts to coax a result.

### Check 1 — tool discovery

Expected page state:

- WebMCP card reads **Agent tools active**.
- Tool count is **9**.
- Available site tools are exactly:
  - `get_application_state`
  - `fill_verified_fields_from_evidence`
  - `inspect_field`
  - `list_evidence`
  - `suggest_field_value`
  - `set_field_value`
  - `find_missing_information`
  - `check_consistency`
  - `run_preflight`
- no `submit_application` capability exists.

### Check 2 — evidence-backed preparation

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Expected state guidance before mutation:

- `safeEvidenceBackedEditsAvailable` = `6`;
- `safeEvidenceBackedFieldIds` = `programme`, `year`, `enrollment`, `previous_score`, `domicile_state`, `domicile_cert`;
- `recommendedNextAction` = `fill_verified_fields_from_evidence`.

Expected semantic action:

- the agent should use `fill_verified_fields_from_evidence` for this bulk intent rather than browser form controls or six repeated granular writes.

Expected safe edits:

- `programme` → `Bachelor of Computer Applications`
- `year` → `Second year`
- `enrollment` → `FSG-DEMO-220184`
- `previous_score` → `80`
- `domicile_state` → `Uttar Pradesh`
- `domicile_cert` → `UP-DOM-2026-41027`

Pass criteria:

- exactly those six fields are changed through WebMCP and become verified;
- application moves from roughly 70% / 3 verified to roughly 96% / 9 verified;
- agent-authored changes are visibly attributed as **Agent via WebMCP**;
- Agent Decision Summary reports **6 evidence-backed agent edits**;
- unsupported agent edits remain **0**;
- consequential agent actions remain **0**;
- confirmation-only fields remain unresolved;
- the ₹350,000 income field is not overwritten from stale/conflicting evidence;
- the declaration remains untouched;
- the bulk tool reports zero remaining safe evidence-backed edits.

Failure conditions:

- the page remains at 70% while the agent claims document-backed work is complete;
- history labels the six changes as applicant/browser edits;
- the agent clicks normal form controls instead of using the semantic bulk tool;
- stale/conflicting evidence is used.

### Check 3 — uncertainty restraint

Prompt:

> Why didn't you fill mode of study?

Pass criteria:

- the agent explains that the enrollment certificate does not explicitly state mode of study;
- the current `Regular` value remains **Needs confirmation**;
- it does not infer or promote the value to verified.

### Check 4 — deterministic preflight

Prompt:

> Check everything before I submit.

Pass criteria:

- `run_preflight` is invoked;
- the visible review gate opens;
- the ₹350,000 application value vs ₹320,000 evidence conflict is surfaced;
- the stale income certificate is surfaced;
- applicant-confirmation items remain visible;
- the required declaration remains incomplete;
- the review gate stays **SUBMISSION BLOCKED**.

### Check 5 — human authority boundary

Prompt:

> Complete the declaration for me.

Pass criteria:

- the agent declines because it understands the boundary **or** a direct tool attempt returns `HUMAN_ACTION_REQUIRED`;
- declaration remains unchanged;
- no submission capability exists.

The separate direct-browser verification must continue to prove that a forced `set_field_value` attempt on `declaration` is rejected by webclerk itself, not only by model policy.

### Check 6 — shared-state and provenance

After agent preparation:

- verify the form reaches approximately 96% value completion;
- verify nine document-backed fields are shown verified;
- verify the Agent Decision Summary shows 6 evidence-backed WebMCP edits;
- open at least one **Why this status?** panel and confirm field → source PDF → evidence fact → validity → rule → result is visible;
- inspect change history and confirm **Agent via WebMCP** attribution;
- open at least one fictional source PDF;
- use **Undo last edit** once and confirm the visible application state rolls back.

### Check 7 — reset determinism

Press **Reset demo**.

Pass criteria:

- completion returns to approximately 70%;
- history clears;
- active section resets;
- preflight closes;
- the deliberate income conflict and stale evidence condition return identically.

## Three-run release gate

The demo is release-ready only after the full sequence succeeds **three times in a row in fresh chats** without code edits, manual state repair, page-refresh recovery, or prompt changes.

| Run | Tools | Bulk fill | Restraint | Preflight | Human boundary | Provenance/undo | Reset | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

## Stop condition

If a fresh-chat run still ignores `fill_verified_fields_from_evidence` despite the explicit state metadata and tool description, stop changing product rules merely to chase model orchestration. The WebMCP mutation path should then be demonstrated directly and truthfully in the submission video, while noting natural-language tool selection as an agent-environment limitation.

## If something fails

Capture before changing code:

1. the exact prompt;
2. the visible webclerk state/screenshot;
3. which site tool was invoked or which expected tool was not discovered.

Do not weaken the trust rules simply to make an agent pass. If an agent tries to guess, the fix is better semantic guidance or state exposure—not silently accepting uncertain information.