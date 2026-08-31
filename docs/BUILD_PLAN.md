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

Exit condition: the full scenario is understandable and manually usable from the UI. **Complete.**

## Milestone 2 — Domain logic

- [x] application state access;
- [x] field inspection;
- [x] evidence lookup;
- [x] suggestion logic;
- [x] value mutation + provenance;
- [x] change history + undo;
- [x] missing-information detection;
- [x] consistency checks;
- [x] preflight aggregation;
- [x] ₹350,000 vs ₹320,000 income conflict;
- [x] stale income certificate;
- [x] ambiguous field remains `needs_confirmation`.

Exit condition: all core behavior works without an LLM or WebMCP. **Complete.**

## Milestone 3 — WebMCP

- [x] `get_application_state`
- [x] `inspect_field`
- [x] `list_evidence`
- [x] `suggest_field_value`
- [x] `set_field_value`
- [x] `find_missing_information`
- [x] `check_consistency`
- [x] `run_preflight`
- [x] feature detection and graceful fallback;
- [x] shared domain rules;
- [x] visible agent-originated changes;
- [x] human-only declaration;
- [x] adapter tests;
- [x] registration-lifecycle tests for `document.modelContext`, AbortSignal, fallback and failure isolation.

Exit condition: the implemented tool surface supports the demo intents through actual WebMCP calls. **Implementation and automated verification complete; supported-browser E2E remains.**

## Milestone 4 — Trust UX

- [x] clear verified / confirmation / blocked states;
- [x] per-field “Why this status?” inspection;
- [x] evidence provenance and evidence-value display;
- [x] conflict and stale-evidence explanation;
- [x] visible WebMCP-agent field highlighting;
- [x] human-vs-agent change history;
- [x] evidence-to-field mapping;
- [x] final review gate;
- [x] explicit human-only declaration/submission boundary.

The UI now makes the trust model visible without requiring a judge to read the agent transcript: evidence is inspectable, uncertainty remains explicit, agent edits are visually attributable, and the final review gate states whether submission is blocked or merely prepared for a human decision.

Exit condition: judge can understand trust/uncertainty behavior without reading chat logs. **Complete.**

## Milestone 5 — Demo hardening

- [x] deterministic seed/reset implementation;
- [x] automated domain/WebMCP registration verification;
- [x] exact E2E prompts and pass/fail expectations documented in `docs/VERIFICATION.md`;
- [ ] test in supported WebMCP browser/agent environment;
- [ ] run complete E2E verification three consecutive times;
- [ ] handle any real-browser tool/discovery errors found during E2E;
- [ ] remove dead UI/actions;
- [ ] tighten copy;
- [ ] verify responsive capture layout;
- [ ] rehearse <3 minute path;
- [ ] capture fallback screenshots/video only as presentation backup, never as substitute for a functioning demo.

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
