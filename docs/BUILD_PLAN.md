# Build Plan

## Principle

Build the deterministic product core first, then the WebMCP adapter, then visual polish. The agent should never become the source of truth for application rules.

## Milestone 0 — Foundation

- [x] Product requirements
- [x] MVP boundary
- [x] Architecture
- [x] WebMCP contract
- [x] Demo narrative

Exit condition: implementation can begin without unresolved product-scope questions.

## Milestone 1 — Static application workspace

Build:

- [x] app shell;
- [x] scholarship sections and ~20–25 fields;
- [x] evidence panel with five seeded documents/fact sets;
- [x] semantic field states;
- [x] status summary;
- [x] reset-demo control;
- [x] realistic Indian public-service visual language informed by UX4G/GIGW;
- [x] conspicuous fictional-demo/non-affiliation labeling.

No agent required yet.

Exit condition: the full scenario is understandable and manually usable from the UI. **Complete.**

## Milestone 2 — Domain logic

Implement/test:

- [x] application state access;
- [x] field inspection;
- [x] evidence lookup;
- [x] suggestion logic;
- [x] value mutation + provenance;
- [x] change history + undo;
- [x] missing-information detection;
- [x] consistency checks;
- [x] preflight aggregation.

Required deterministic checks:

- [x] ₹350,000 vs ₹320,000 income conflict;
- [x] stale income certificate;
- [x] ambiguous field remains `needs_confirmation`.

The domain engine is intentionally independent from both React and WebMCP. Seed data describes application values and evidence; trust state is derived at runtime from deterministic rules. Vitest coverage locks the required demo invariants, and CI runs both tests and the production build.

Exit condition: all core behavior works without an LLM or WebMCP. **Complete.**

## Milestone 3 — WebMCP

Register the MVP tool surface using `document.modelContext`:

- `get_application_state`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

Requirements:

- feature detection;
- registration failure does not break UI;
- precise JSON schemas;
- same domain functions as human UI;
- visible agent-originated change records.

Exit condition: an agent can complete the five required demo intents through actual WebMCP tools.

## Milestone 4 — Trust UX

Polish the core differentiators:

- clear verified / confirmation / blocked states;
- provenance inspection;
- conflict presentation;
- stale-evidence presentation;
- agent-change review/undo;
- final human-review state.

Exit condition: judge can understand trust/uncertainty behavior without reading chat logs.

## Milestone 5 — Demo hardening

- deterministic seed/reset;
- test in supported WebMCP browser/agent environment;
- handle tool errors cleanly;
- remove dead UI/actions;
- tighten copy;
- verify responsive capture layout;
- rehearse <3 minute path;
- capture fallback screenshots/video only as presentation backup, never as substitute for a functioning demo.

Exit condition: three complete demo runs in a row without manual repair.

## Milestone 6 — Submission

- deploy public live URL;
- README setup/run instructions;
- verify MIT license;
- public repository cleanup;
- record <3 minute public YouTube demo;
- Devpost description emphasizes WebMCP delta, impact, execution, and human control;
- verify source clearly contains WebMCP registration.

## Kill list

If schedule pressure appears, cut in this order:

1. dynamic tool registration;
2. real document extraction/OCR;
3. second application workflow;
4. persistence/backend;
5. fancy landing-page animation.

Never cut:

- provenance;
- visible uncertainty;
- conflict detection;
- real WebMCP tool use;
- deterministic preflight;
- human control.

Those are the product.
