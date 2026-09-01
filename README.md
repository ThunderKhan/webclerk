<div align="center">

<img src="docs/assets/readme/webclerk-readme-hero.png" alt="webclerk — Never guess on consequential forms" width="100%" />

<br />

[![CI](https://github.com/ThunderKhan/webclerk/actions/workflows/ci.yml/badge.svg)](https://github.com/ThunderKhan/webclerk/actions/workflows/ci.yml)
![WebMCP](https://img.shields.io/badge/WebMCP-semantic%20tools-d7b76a)
![Tools](https://img.shields.io/badge/tools-9-2f81f7)
![Read / Write](https://img.shields.io/badge/read%20%2F%20write-7%20%2F%202-8250df)
![Tests](https://img.shields.io/badge/tests-25%20passing-2ea44f)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-2ea44f)

Evidence-backed WebMCP automation that preserves uncertainty and keeps consequential decisions human-controlled.

**OpenAI WebMCP Challenge · Trust-first browser automation · Human-in-the-loop**

[Live site](https://webclerk.vercel.app/) · [WebMCP demo](https://webclerk.vercel.app/demo) · [WebMCP implementation](webmcp/index.ts) · [Architecture](#architecture) · [Verification](docs/VERIFICATION.md) · [Docs](docs/WEBMCP.md)

</div>

---

> ### Judges: start with the WebMCP implementation
> **[`webmcp/index.ts`](webmcp/index.ts)** is the actual semantic tool surface registered with `document.modelContext`.  
> **[`webmcp/domain.ts`](webmcp/domain.ts)** contains the deterministic evidence, validation, conflict, and human-authority rules.  
> The React/Vite experience is intentionally secondary and lives under **[`apps/web/`](apps/web/)**.

webclerk is a WebMCP-powered trust layer for consequential web forms. It lets an agent inspect the same application the human sees, read structured supporting evidence, fill only values that can be verified, preserve uncertainty, surface conflicts and stale evidence, and prepare the application without taking over truthfulness attestations or final submission.

The current prototype uses a fictional Indian scholarship workflow to demonstrate the pattern end to end.

> **Prototype notice:** the scholarship, department, application identifiers, PDFs, and government-style interface in this repository are fictional. webclerk is not affiliated with or endorsed by the Government of India or any public authority.

## Repository layout

```text
webmcp/                 WebMCP tool surface + deterministic trust engine
├── index.ts            9 semantic WebMCP tools and registration lifecycle
├── domain.ts           evidence, validation, conflict and preflight rules
├── data.ts             deterministic reference application/evidence model
├── types.d.ts          browser WebMCP type declarations
└── *.test.ts           domain + registration contract tests

apps/web/               Vite/React landing page and reference demo UI
docs/                   product, architecture, verification and submission docs
```

The UI imports the top-level `webmcp/` modules; it does not contain a separate copy of the trust logic.

## Verified production flow

The natural-language WebMCP path has been verified end to end in the ChatGPT desktop built-in browser using **5.6 Sol Medium**.

<p align="center">
  <img src="docs/assets/readme/webclerk-seal-wordmark.png" alt="webclerk verified agent flow from user intent through WebMCP to human-only declaration" width="100%" />
</p>

Starting from the deterministic reset state:

- completion: **70%**
- verified: **3**
- review: **11**
- blocked: **2**
- incomplete: **7**

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

The agent identifies six safe evidence-backed edits, asks for approval before the write, then invokes the site's bulk semantic write capability. After approval:

- completion becomes **96%**;
- verified becomes **9**;
- **6 evidence-backed agent edits** are recorded;
- **11 applicant confirmations** remain preserved;
- **2 blockers** remain surfaced;
- unsupported agent edits remain **0**;
- consequential agent actions remain **0**;
- history attributes the six changes as **WebMCP · Agent via WebMCP**.

The six WebMCP edits are:

- programme of study;
- current year of study;
- enrollment number;
- previous academic-year percentage;
- state of domicile;
- domicile certificate number.

The agent deliberately leaves stale/conflicting income evidence, confirmation-only fields, the truthfulness declaration, and final submission untouched.

> **Demo environment note:** use a model/runtime that supports ChatGPT Site Tools write execution. The verified production run used **5.6 Sol Medium**. Lighter runtimes tested during development could discover tools but did not consistently execute the WebMCP write path.

## For judges

Open the live workspace at:

**https://webclerk.vercel.app/demo**

Use this sequence:

1. **"Fill everything you can verify from my documents. Don't guess anything."**
2. Approve the requested site write.
3. **"Why didn't you fill mode of study?"**
4. **"Check everything before I submit."**
5. **"Complete the declaration for me."**

Expected behavior:

- the bulk preparation request routes to `fill_verified_fields_from_evidence`;
- six safe fields are written through WebMCP and visibly attributed to the agent;
- `mode of study` remains unresolved because the enrollment certificate does not explicitly state it;
- the form preserves the ₹3,50,000 application value while surfacing the ₹3,20,000 evidence conflict;
- the income certificate remains blocked because it is outside the accepted 12-month validity window;
- preflight reports blockers, unresolved confirmations, and the missing human declaration;
- the agent cannot complete the truthfulness declaration;
- there is intentionally no `submit_application` WebMCP tool.

## Why WebMCP

webclerk is not using WebMCP as a wrapper around a normal chatbot feature. The page itself exposes semantic capabilities such as `get_application_state`, `fill_verified_fields_from_evidence`, `list_evidence`, `inspect_field`, and `run_preflight` through `document.modelContext.registerTool(...)`.

That means an external agent can work with **application concepts directly** instead of relying on brittle DOM scraping, screen coordinates, or a one-off integration. Human and agent operate over the same browser-visible state, and every WebMCP mutation goes back through the page's deterministic evidence rules.

This enables a collaboration model where:

- the **site** defines what evidence and actions mean;
- the **agent** can prepare reversible, non-consequential edits;
- the **human** explicitly approves writes and retains authority over ambiguous facts, truthfulness attestations, and final submission.

## Trust invariants

1. **Evidence, not confidence** — model confidence alone can never make a value verified.
2. **Uncertainty stays visible** — unsupported, ambiguous, stale, or conflicting information is never silently promoted.
3. **Agent edits are reversible** — agent-authored changes are visibly attributed and can be undone.
4. **Conflicts are surfaced, not auto-resolved** — the agent cannot silently choose between contradictory values.
5. **Human commits** — declaration and final submission remain human actions.

## WebMCP tools

The complete implementation is in [`webmcp/index.ts`](webmcp/index.ts).

webclerk exposes exactly nine semantic tools:

| Tool | Type | Purpose |
|---|---|---|
| `get_application_state` | Read | Read completion, section state, blockers, and safe next actions |
| `fill_verified_fields_from_evidence` | **Write** | Bulk-fill only incomplete fields backed by current acceptable evidence |
| `inspect_field` | Read | Inspect one field's value, provenance, evidence and validation state |
| `list_evidence` | Read | Read supporting evidence and its validity |
| `suggest_field_value` | Read | Suggest a value only when acceptable evidence supports it |
| `set_field_value` | **Write** | Apply one reversible field edit through deterministic evidence rules |
| `find_missing_information` | Read | Find incomplete, blocked, or confirmation-required fields |
| `check_consistency` | Read | Surface contradictions between form state and evidence |
| `run_preflight` | Read | Run deterministic final checks before human review |

The Site Tools surface classifies them as **7 read tools and 2 write tools**. There is deliberately **no** `submit_application` tool.

### Bulk verified preparation

`fill_verified_fields_from_evidence` is the preferred semantic capability for:

> Fill everything you can verify from my documents. Don't guess anything.

At reset, `get_application_state` reports six safe edits and recommends the bulk tool. The bulk tool applies only incomplete fields with current, acceptable mapped evidence and skips confirmation-only fields, stale evidence, unresolved conflicts, the declaration, and unsupported values.

### Human authority boundary

A direct agent attempt to complete the applicant declaration is rejected with:

```text
HUMAN_ACTION_REQUIRED
```

The preferred preparation flow is:

```text
get_application_state
  → fill_verified_fields_from_evidence
  → run_preflight
```

## Architecture

<p align="center">
  <img src="docs/assets/readme/webclerk-architecture-flow.png" alt="webclerk architecture — evidence, deterministic validation, WebMCP semantic tools and shared human-visible form state" width="100%" />
</p>

The architecture is deliberately site-centered: evidence is interpreted by deterministic rules, WebMCP exposes semantic capabilities over those rules, and both the agent and applicant operate on the same human-visible application state.

The agent and the human are **not editing separate copies** of the application.

## Evidence model

The demo includes five fictional source PDFs:

- `Identity_Card.pdf`
- `Enrollment_Certificate.pdf`
- `Previous_Year_Marksheet.pdf`
- `Income_Certificate.pdf`
- `Domicile_Certificate.pdf`

The PDFs are human-inspectable, while the MVP uses a fixed pre-extracted structured evidence set so the trust and WebMCP behavior stays deterministic and auditable. Arbitrary PDF ingestion/OCR is intentionally outside the hackathon MVP.

## Broader applications

The scholarship is a reference workflow. The same trust pattern applies to:

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
- **ChatGPT desktop built-in browser with 5.6 Sol Medium** for natural-language WebMCP orchestration and approved write execution;
- the verified **Netlify production deployment**, with Vercel now hosting the current release.

Verified behavior includes:

- discovery of exactly nine semantic tools;
- correct 7-read / 2-write classification;
- natural-language selection of the semantic bulk-fill tool;
- explicit user approval before the write;
- evidence-backed shared-state mutation;
- visible **WebMCP · Agent via WebMCP** attribution;
- conflict detection;
- stale-evidence detection;
- uncertainty preservation;
- deterministic preflight;
- declaration rejection with `HUMAN_ACTION_REQUIRED`;
- no autonomous submit capability.

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

Root scripts orchestrate the `apps/web` workspace, while the WebMCP implementation remains top-level under `webmcp/`.

## Project docs

- [`docs/PRD.md`](docs/PRD.md) — product requirements
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture and data model
- [`docs/WEBMCP.md`](docs/WEBMCP.md) — WebMCP contract
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md) — browser and release verification
- [`docs/DEMO.md`](docs/DEMO.md) — exact sub-three-minute demo script
- [`docs/RECORDING_PLAN.md`](docs/RECORDING_PLAN.md) — shot-by-shot recording plan
- [`docs/SUBMISSION.md`](docs/SUBMISSION.md) — ready-to-paste submission copy
- [`docs/RELEASE_FREEZE.md`](docs/RELEASE_FREEZE.md) — frozen implementation baseline

## Status

- [x] Product foundation
- [x] Deterministic evidence and validation logic
- [x] WebMCP semantic tool layer
- [x] Trust UX and provenance
- [x] Direct browser-level WebMCP verification
- [x] Natural-language semantic tool selection
- [x] Approved WebMCP write execution in production
- [x] Agent-vs-applicant provenance
- [x] Conflict/stale-evidence preflight
- [x] Human-only declaration boundary
- [x] WebMCP implementation frozen
- [ ] Final clean release rehearsal
- [ ] Record and publish final demo video
- [ ] Submit hackathon entry

## License

MIT
