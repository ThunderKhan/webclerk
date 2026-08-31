# webclerk

> Never guess on consequential forms.

webclerk is a WebMCP-powered application workspace for completing high-stakes online forms with an AI agent that can understand fields, verify suggested answers against supporting evidence, surface uncertainty and inconsistencies, and prepare an application without silently guessing or submitting on the user's behalf.

Built for the OpenAI WebMCP Challenge.

> **Prototype notice:** the scholarship, department, application identifiers and government-style interface in this repository are fictional. webclerk is not affiliated with or endorsed by the Government of India or any public authority.

## Current prototype

The current prototype implements a realistic Indian public-service-style scholarship application inspired by the official UX4G Design System and GIGW 3.0 guidance. The UI contains 23 fields, four application sections, five seeded evidence records, deterministic field-state derivation, conflict/staleness checks, preflight validation, undoable change history, and a real WebMCP tool layer.

When the experimental browser API is available, webclerk registers eight semantic tools through `document.modelContext`. The same domain functions power both the human-facing form and the agent tools, so the agent cannot bypass the application's evidence and validation rules.

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

WebMCP itself requires a supported browser/agent environment. In ordinary browsers the human interface remains fully functional and displays WebMCP as unavailable rather than failing startup.

## MVP

The hackathon MVP focuses on one realistic fictional scholarship application with 23 fields and five supporting documents. The experience demonstrates three core ideas:

1. **Evidence-backed answers** — every suggested value should be traceable to a source.
2. **Uncertainty is visible** — fields can be verified, require confirmation, or be blocked by missing/conflicting evidence.
3. **Human authority** — the agent may inspect, explain, suggest, validate, and prepare; consequential attestation and submission remain human actions.

## Core demo flow

1. Open the scholarship application.
2. Ask the agent: **"Fill everything you can verify from my documents. Don't guess anything."**
3. Watch verified fields update while unsupported fields remain unresolved.
4. Ask why a field was not completed and inspect its requirements/evidence.
5. Run a full application preflight through WebMCP.
6. Detect the deliberate income conflict and stale income certificate before submission.
7. See every agent-authored mutation appear in the same visible change history as human edits.

## WebMCP

webclerk exposes the application's semantic state through `document.modelContext.registerTool(...)`, allowing an agent to work with fields, evidence, validation results, and application state directly instead of inferring intent from UI structure alone.

Implemented tool surface:

- `get_application_state`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

The adapter includes feature detection and isolated registration failure handling. `set_field_value` records agent-originated edits visibly and then re-runs normal domain derivation. The final applicant declaration is explicitly rejected with `HUMAN_ACTION_REQUIRED` when an agent attempts to complete it.

There is intentionally **no autonomous `submit_application` tool** in the MVP.

## Project docs

- [`docs/PRD.md`](docs/PRD.md) — product requirements and success criteria
- [`docs/MVP.md`](docs/MVP.md) — hard scope boundary and acceptance criteria
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application and data architecture
- [`docs/WEBMCP.md`](docs/WEBMCP.md) — WebMCP contract and tool semantics
- [`docs/DESIGN.md`](docs/DESIGN.md) — UX4G/GIGW-informed visual and accessibility specification
- [`docs/DEMO.md`](docs/DEMO.md) — three-minute judging/demo narrative
- [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — milestone sequence and scope kill-list

## Status

- [x] Milestone 0 — product foundation
- [x] Milestone 1 — static government-style application workspace
- [x] Milestone 2 — deterministic domain logic
- [x] Milestone 3 — WebMCP tool layer
- [ ] Milestone 4 — trust UX hardening
- [ ] Milestone 5 — demo hardening
- [ ] Milestone 6 — submission

## License

MIT
