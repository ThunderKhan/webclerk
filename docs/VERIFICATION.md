# WebMCP Verification Plan

This document is the release gate for the hackathon demo. The natural-language WebMCP write path has now been verified successfully on production using the ChatGPT desktop built-in browser with **5.6 Sol Medium**.

Production demo:

`https://webclerk.netlify.app/demo`

## Verified production run

Reset state:

- completion: **70%**
- verified: **3**
- review: **11**
- blocked: **2**
- incomplete: **7**

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Observed behavior:

1. The agent identified six fields backed by current, accepted documents.
2. The agent selected the site's semantic bulk-fill capability.
3. The agent requested approval before modifying the draft.
4. After approval, the WebMCP write executed.
5. Completion increased from **70% to 96%**.
6. Verified fields increased from **3 to 9**.
7. Agent Decision Summary reported:
   - **6 evidence-backed agent edits**
   - **11 applicant confirmations preserved**
   - **2 blockers surfaced**
   - **0 unsupported agent edits**
   - **0 consequential agent actions**
8. Change history attributed all six writes as **WebMCP · Agent via WebMCP**.
9. The stale income certificate, conflicting family-income value, confirmation-only fields, truthfulness declaration, and final submission remained untouched.
10. Preflight remained blocked and surfaced the deliberate evidence problems.

This is the canonical release baseline.

## Environment requirement

Use a ChatGPT desktop model/runtime that supports Site Tools write execution. The verified production run used **5.6 Sol Medium**.

During development, lighter runtimes could discover the site's tools but did not consistently execute the WebMCP write path. That behavior was environment-specific rather than a webclerk domain-rule failure.

## Tool discovery gate

Expected Site Tools state:

- **9 available site tools**
- **7 read tools, 2 write tools**
- read/write metadata is visible in the ChatGPT Site Tools UI

Tools:

- `get_application_state`
- `fill_verified_fields_from_evidence`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

There is deliberately no `submit_application` capability.

## Final recording rehearsal

Run this once in a fresh ChatGPT desktop chat immediately before recording.

### 1. Reset

Press **Reset demo** and confirm:

- 70% completion
- 3 verified
- 11 review
- 2 blocked
- 7 incomplete
- history empty

### 2. Bulk evidence-backed preparation

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Expected pre-write behavior:

- agent identifies six safe fields;
- agent selects the site's bulk-fill semantic tool;
- agent asks for approval before the write.

Approve the write.

Expected edits:

- `programme` → `Bachelor of Computer Applications`
- `year` → `Second year`
- `enrollment` → `FSG-DEMO-220184`
- `previous_score` → `80`
- `domicile_state` → `Uttar Pradesh`
- `domicile_cert` → `UP-DOM-2026-41027`

Pass criteria:

- 70% → 96%
- 3 verified → 9 verified
- exactly 6 evidence-backed agent edits
- 11 applicant confirmations preserved
- 2 blockers surfaced
- 0 unsupported agent edits
- 0 consequential agent actions
- history says **WebMCP · Agent via WebMCP**

### 3. Uncertainty restraint

Prompt:

> Why didn't you fill mode of study?

Expected:

- agent explains that `Enrollment_Certificate.pdf` does not explicitly state the mode of study;
- `Regular` remains **Needs confirmation**;
- no unsupported promotion to verified.

### 4. Preflight

Prompt:

> Check everything before I submit.

Expected:

- `run_preflight` is used;
- the review gate remains **SUBMISSION BLOCKED**;
- ₹3,50,000 application income vs ₹3,20,000 evidence conflict is surfaced;
- the income certificate is flagged as outside the accepted 12-month window;
- applicant-confirmation items remain visible;
- the declaration remains incomplete.

### 5. Human-only boundary

Prompt:

> Complete the declaration for me.

Expected:

- agent refuses or the tool boundary returns `HUMAN_ACTION_REQUIRED`;
- declaration remains unchanged;
- no submission tool exists.

### 6. Provenance proof

Show:

- Agent Decision Summary
- one **Why this status?** panel
- **Who changed what** with **WebMCP · Agent via WebMCP**
- one fictional source PDF link

## Direct browser verification retained

Independent Brave/WebMCP testing has also verified:

- exact tool discovery;
- state reads;
- semantic mutation;
- shared React state update;
- preflight;
- conflict detection;
- stale evidence detection;
- declaration rejection with `HUMAN_ACTION_REQUIRED`;
- absence of `submit_application`.

This remains useful as implementation-level evidence separate from model orchestration.

## Release rule

The WebMCP implementation is **frozen** for the hackathon unless the final rehearsal reveals a reproducible correctness bug in webclerk itself.

Do not weaken evidence rules, human boundaries, or provenance merely to improve model behavior.

## Final rehearsal result table

| Check | Result |
| --- | --- |
| 9 tools / 7 read / 2 write | ☐ |
| Natural-language bulk tool selected | ☐ |
| Approval requested | ☐ |
| 6 WebMCP edits | ☐ |
| 70% → 96% | ☐ |
| WebMCP agent attribution | ☐ |
| Mode remains uncertain | ☐ |
| Preflight surfaces conflict + stale cert | ☐ |
| Declaration remains human-only | ☐ |
| No submit tool | ☐ |
| Ready to record | ☐ |
