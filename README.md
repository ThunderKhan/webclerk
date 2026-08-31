# webclerk

> Never guess on consequential forms.

webclerk is a WebMCP-powered application workspace for completing high-stakes online forms with an AI agent that can understand fields, verify suggested answers against supporting evidence, surface uncertainty and inconsistencies, and prepare an application without silently guessing or submitting on the user's behalf.

Built for the OpenAI WebMCP Challenge.

## MVP

The hackathon MVP focuses on one realistic fictional scholarship application with roughly 20–25 fields and five supporting documents. The experience demonstrates three core ideas:

1. **Evidence-backed answers** — every suggested value should be traceable to a source.
2. **Uncertainty is visible** — fields can be verified, require confirmation, or be blocked by missing/conflicting evidence.
3. **Human authority** — the agent may inspect, explain, suggest, validate, and prepare; the human performs consequential submission.

## Core demo flow

1. Open the scholarship application.
2. Ask the agent: **"Fill everything you can verify from my documents. Don't guess anything."**
3. Watch verified fields populate while uncertain fields remain unresolved.
4. Ask why a field was not completed and inspect its requirements/evidence.
5. Run a full application preflight.
6. Detect a deliberate income conflict and an expired document before submission.

## WebMCP

webclerk exposes the application's semantic state through `document.modelContext.registerTool(...)`, allowing an agent to work with fields, evidence, validation results, and application state directly instead of inferring intent from UI structure alone.

Planned tool surface includes:

- `get_application_state`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`
- `prepare_submission`

There is intentionally **no autonomous `submit_application` tool** in the MVP.

## Project docs

- [`docs/PRD.md`](docs/PRD.md) — product requirements and success criteria
- [`docs/MVP.md`](docs/MVP.md) — hard scope boundary and acceptance criteria
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application and data architecture
- [`docs/WEBMCP.md`](docs/WEBMCP.md) — WebMCP contract and tool semantics
- [`docs/DEMO.md`](docs/DEMO.md) — three-minute judging/demo narrative

## Status

Project foundation and implementation planning.

## License

MIT
