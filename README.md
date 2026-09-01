# webclerk

> **Never guess on consequential forms.**

**Landing page:** https://webclerk.netlify.app/  
**Live WebMCP demo:** https://webclerk.netlify.app/demo

webclerk is a WebMCP-powered trust layer for consequential web forms. It lets an agent inspect the same application the human sees, read structured supporting evidence, fill only values that can be verified, preserve uncertainty, surface conflicts and stale evidence, and prepare the application without taking over truthfulness attestations or final submission.

The current prototype uses a fictional Indian scholarship workflow to demonstrate the pattern end to end.

> **Prototype notice:** the scholarship, department, application identifiers, PDFs, and government-style interface in this repository are fictional. webclerk is not affiliated with or endorsed by the Government of India or any public authority.

## For judges

Start at the landing page for the product story, then open the live WebMCP workspace at:

https://webclerk.netlify.app/demo

Use these prompts in order:

1. **"Fill everything you can verify from my documents. Don't guess anything."**
2. **"Why didn't you fill mode of study?"**
3. **"Check everything before I submit."**
4. **"Complete the declaration for me."**

Expected behavior:

- `get_application_state` reports six safe evidence-backed edits and recommends `fill_verified_fields_from_evidence`;
- the agent uses `fill_verified_fields_from_evidence` to fill those six blanks through WebMCP;
- those edits are visibly attributed to the WebMCP agent;
- `mode of study` remains unresolved because the enrollment certificate does not explicitly state it;
- the form preserves the ₹3,50,000 application value while surfacing the ₹3,20,000 evidence conflict;
- the income certificate remains blocked because it is outside the accepted 12-month validity window;
- preflight reports blockers, unresolved confirmations, and the missing human declaration;
- the agent cannot complete the truthfulness declaration;
- there is intentionally no `submit_application` WebMCP tool.

## Why WebMCP

webclerk is not using WebMCP as a wrapper around a normal chatbot feature. The page itself exposes semantic capabilities such as `get_application_state`, `fill_verified_fields_from_evidence`, `list_evidence`, `inspect_field`, and `run_preflight` through `document.modelContext.registerTool(...)`.

That means an external agent can work with **application concepts directly** instead of relying on brittle DOM scraping, screen coordinates, or a one-off integration. Human and agent operate over the same browser-visible state, and every agent mutation goes back through the page's deterministic evidence rules.

This enables a collaboration model where:

- the **site** defines what evidence and actions mean;
- the **agent** can prepare reversible, non-consequential edits;
- the **human** retains authority over ambiguous facts, truthfulness attestations, and final submission.

## The core demo

The scholarship starts partially complete. Six safe evidence-backed fields are intentionally blank so the agent can make visible progress:

- programme of study;
- current year of study;
- enrollment number;
- previous academic-year percentage;
- state of domicile;
- domicile certificate number.

The demo also contains two deliberate financial problems:

- the form says annual family income is **₹3,50,000**;
- the income certificate says **₹3,20,000** and is older than the accepted 12-month window.

Most autofill systems optimize for completion. webclerk optimizes for **justified completion**.

## Trust invariants

1. **Evidence, not confidence** — model confidence alone can never make a value verified.
2. **Uncertainty stays visible** — unsupported, ambiguous, stale, or conflicting information is never silently promoted.
3. **Agent edits are reversible** — agent-authored changes are visibly attributed and can be undone.
4. **Conflicts are surfaced, not auto-resolved** — the agent cannot silently choose between contradictory values.
5. **Human commits** — declaration and final submission remain human actions.

## WebMCP tools

webclerk exposes exactly nine semantic tools:

- `get_application_state`
- `fill_verified_fields_from_evidence`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

There is deliberately **no** `submit_application` tool.

### Bulk verified preparation

`fill_verified_fields_from_evidence` is the preferred semantic capability for the natural user intent:

> Fill everything you can verify from my documents. Don't guess anything.

`get_application_state` makes the intent routing explicit by returning:

- `safeEvidenceBackedEditsAvailable`;
- `safeEvidenceBackedFieldIds`;
- `recommendedNextAction`.

At the reset state those values are six safe edits and:

```text
recommendedNextAction = fill_verified_fields_from_evidence
```

The bulk tool applies only incomplete fields with current, acceptable mapped evidence. It skips:

- already completed fields;
- confirmation-only fields;
- stale evidence;
- unresolved conflicts;
- the applicant declaration;
- anything without acceptable evidence.

Because the writes go through webclerk's agent bridge, they are recorded as WebMCP-agent changes and remain reversible.

`set_field_value` and `suggest_field_value` remain available for one-field follow-ups, but are explicitly not the preferred path for bulk preparation.

### Human authority boundary

`set_field_value` rejects attempts to complete the applicant declaration with:

```text
HUMAN_ACTION_REQUIRED
```

The preferred preparation flow is:

```text
get_application_state
  → fill_verified_fields_from_evidence
  → run_preflight
```

For a granular one-field edit:

```text
suggest_field_value
  → set_field_value
```

## Architecture

```text
Fictional source PDFs
        │
        ▼
Pre-extracted structured evidence
        │
        ▼
Deterministic evidence + validation engine
        │
        ├──────────────► Human-visible form state
        │                       ▲
        ▼                       │
WebMCP semantic tools ──────────┘
        │
        ▼
ChatGPT / external browser agent
```

The agent and the human are not editing separate copies of the application. Both act on the same page state.

## Evidence model

The demo includes five fictional source PDFs:

- `Identity_Card.pdf`
- `Enrollment_Certificate.pdf`
- `Previous_Year_Marksheet.pdf`
- `Income_Certificate.pdf`
- `Domicile_Certificate.pdf`

Each evidence record exposes:

- document type;
- issue metadata;
- human-inspectable PDF URL;
- pre-extracted structured facts;
- validity status;
- whether the evidence is acceptable for verification.

### MVP limitation

The included PDFs are **not parsed dynamically**. The prototype uses a fixed, pre-extracted structured evidence set so the trust and WebMCP behavior can remain deterministic and easy to audit. Arbitrary PDF upload, OCR, document classification, and extraction are intentionally outside this hackathon MVP.

A production ingestion layer could sit before the current evidence engine:

```text
PDF / OCR / document parser
        ↓
Normalized evidence facts
        ↓
Current webclerk evidence engine
```

## What the UI makes visible

The interface exposes more than a completion percentage. It shows:

- verified, confirmation-required, blocked, and incomplete counts;
- an **Agent Decision Summary**;
- evidence-backed agent edit count;
- unresolved applicant confirmations;
- blockers surfaced;
- unsupported agent edit count;
- consequential agent action count;
- provenance from field → PDF → evidence fact → validity → decision rule → result;
- agent-vs-applicant change history;
- direct links to fictional source PDFs;
- deterministic preflight;
- a human-only declaration/submission boundary.

## Broader applications

The scholarship is a reference workflow, not the limit of the idea. The same pattern applies to consequential forms such as:

- insurance claims;
- visa applications;
- public benefits;
- financial aid;
- compliance questionnaires;
- healthcare intake;
- procurement and vendor onboarding.

## Verified environments

The prototype has been exercised in:

- **Brave with WebMCP enabled** for direct browser-level tool discovery and invocation;
- **ChatGPT desktop built-in browser** for natural-language agent orchestration;
- **Netlify production deployment** at https://webclerk.netlify.app/demo.

Validated behavior includes:

- discovery of the semantic tool surface;
- state reads;
- evidence-backed shared-state mutation;
- visible agent attribution;
- conflict detection;
- stale-evidence detection;
- uncertainty preservation;
- deterministic preflight;
- declaration rejection with `HUMAN_ACTION_REQUIRED` at the WebMCP boundary;
- no autonomous submit tool.

The explicit bulk-intent version must still pass the final production rehearsal before submission.

## Run locally

```bash
npm install
npm run dev
```

Tests and production build:

```bash
npm test
npm run build
npm run preview
```

WebMCP itself requires a supported browser/agent environment. In an ordinary browser the human interface remains functional and reports WebMCP as unavailable instead of failing startup.

## Project docs

- [`docs/PRD.md`](docs/PRD.md) — product requirements and success criteria
- [`docs/MVP.md`](docs/MVP.md) — hard scope boundary and acceptance criteria
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application and data architecture
- [`docs/WEBMCP.md`](docs/WEBMCP.md) — WebMCP contract and tool semantics
- [`docs/DESIGN.md`](docs/DESIGN.md) — UX4G/GIGW-informed visual and accessibility specification
- [`docs/DEMO.md`](docs/DEMO.md) — three-minute judging/demo narrative
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md) — real-browser verification checklist
- [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — milestone sequence and scope kill-list

## Status

- [x] Product foundation
- [x] Judge-facing landing page
- [x] Static government-style application workspace
- [x] Deterministic evidence and validation logic
- [x] WebMCP tool layer
- [x] Trust UX and provenance
- [x] Real-browser WebMCP verification
- [x] Natural-language agent rehearsal
- [ ] Final explicit bulk-intent production rehearsal
- [ ] Three consecutive clean final runs
- [ ] Demo video and submission

## License

MIT