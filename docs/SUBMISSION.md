# Hackathon Submission Copy

Use this as the source of truth when filling the final submission form. Adjust only for field-length limits.

## Project name

**webclerk**

## Tagline

**Never guess on consequential forms.**

Alternative short tagline if a field prefers a functional description:

**Evidence-backed AI form preparation with human-controlled commitments.**

## One-line description

webclerk is a WebMCP-powered trust layer that lets agents prepare consequential forms from verifiable evidence while preserving uncertainty, surfacing conflicts, and keeping truthfulness declarations and final submission under human control.

## Short description

Most autofill systems optimize for completion. webclerk optimizes for **justified completion**.

The demo is a fictional scholarship application where ChatGPT can inspect application state and supporting evidence through semantic WebMCP tools, fill only fields backed by current accepted documents, show provenance for every agent edit, detect stale or conflicting evidence, and run deterministic preflight checks before submission.

The agent can prepare the application, but it cannot make truthfulness attestations or submit on the applicant's behalf.

## Full project description

Important web forms are not hard because typing is hard. They are hard because a field may require a particular interpretation, a supporting document may be stale, two sources may disagree, and some answers are facts only the applicant can truthfully confirm.

webclerk explores a different model for agentic form assistance: **the agent can prepare; the human commits.**

The form exposes semantic capabilities through WebMCP rather than forcing an agent to infer meaning from page structure. An agent can inspect the application, list supporting evidence, inspect individual fields, fill document-verified values, check consistency, find missing information, and run preflight.

The demo contains five fictional supporting documents and a deliberately imperfect scholarship application. Six fields are blank but safely recoverable from current evidence. The income section contains a deliberate conflict: the application says ₹3,50,000 while the income certificate says ₹3,20,000, and that certificate is outside the accepted 12-month validity window.

When the user asks, “Fill everything you can verify from my documents. Don't guess anything,” ChatGPT selects webclerk's bulk semantic write tool, asks for approval, and writes exactly six safe fields through WebMCP. The application moves from 70% to 96% completion and records all six changes as **WebMCP · Agent via WebMCP**. Unsupported edits remain zero and consequential agent actions remain zero.

webclerk deliberately preserves values that require applicant confirmation, surfaces the stale/conflicting income evidence, and blocks final readiness. A truthfulness declaration cannot be completed by the agent, and there is intentionally no `submit_application` WebMCP tool.

The scholarship is only the reference workflow. The same trust model can apply to insurance claims, visa applications, financial aid, public benefits, compliance questionnaires, healthcare intake, and other forms where correctness and accountability matter more than filling every blank.

## What makes it different

### Evidence, not confidence

Model confidence alone can never make a value verified. A field is verified only when acceptable mapped evidence supports it.

### Uncertainty stays visible

Unsupported, ambiguous, stale, and conflicting information is represented explicitly instead of silently converted into a plausible answer.

### Shared human-agent state

The human and the agent operate on the same browser-visible application state. Agent edits appear immediately in the form and remain reversible.

### Provenance for every write

webclerk shows who changed a field, the supporting PDF, the structured evidence fact, evidence validity, the deterministic decision rule, and the resulting status.

### Human authority

Writes require approval in the supported ChatGPT Site Tools flow. Truthfulness attestations stay human-only. Final submission is not exposed as an agent tool.

## How WebMCP is used

webclerk registers nine semantic site tools with `document.modelContext.registerTool(...)`:

- `get_application_state`
- `fill_verified_fields_from_evidence`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

Seven are read tools and two are write tools. The write tools are explicitly annotated as mutating capabilities so the agent runtime can request the appropriate approval.

The natural-language bulk-fill flow has been verified in production in the ChatGPT desktop built-in browser using 5.6 Sol Medium.

There is deliberately no `submit_application` tool.

## Technical implementation

- React + TypeScript + Vite frontend
- deterministic evidence/validation engine
- browser-native WebMCP registration through `document.modelContext`
- shared React application state for human and agent edits
- explicit provenance and edit attribution
- fictional source PDFs with fixed pre-extracted structured evidence
- Netlify deployment

The MVP intentionally does not include arbitrary PDF OCR or document extraction. That layer could precede webclerk's normalized evidence engine in a production system.

## Verified demo result

Reset:

- 70% completion
- 3 verified
- 11 review
- 2 blocked
- 7 incomplete

After approved WebMCP bulk preparation:

- 96% completion
- 9 verified
- 11 review
- 2 blocked
- 1 incomplete
- 6 evidence-backed agent edits
- 0 unsupported agent edits
- 0 consequential agent actions

Remaining preflight issues include:

- ₹3,50,000 form income vs ₹3,20,000 evidence conflict
- stale income certificate
- applicant-confirmation fields
- truthfulness declaration

## Impact / potential

The broader opportunity is not a universal autofill bot. It is a reusable trust pattern for consequential workflows where agents should be useful without becoming the authority.

Any form-oriented service could expose its own semantic requirements, evidence mappings, validation rules, and safe actions. Agents could then prepare cases across institutions without each agent having to reverse-engineer page structure or invent its own interpretation of what counts as acceptable evidence.

## Links

**Live demo:** https://webclerk.netlify.app/demo  
**Landing page:** https://webclerk.netlify.app/  
**GitHub:** https://github.com/ThunderKhan/webclerk

## Suggested technologies / tags

WebMCP, React, TypeScript, Vite, Human-in-the-loop AI, AI Agents, Developer Tools, Trust & Safety, Web Applications

## Suggested submission title

**webclerk — Never guess on consequential forms**

## Suggested video title

**webclerk: Evidence-backed AI form preparation with WebMCP**

## Suggested video description

webclerk is a WebMCP-powered trust layer for consequential web forms. In this demo, ChatGPT uses semantic site tools to fill only document-verified scholarship fields, preserve uncertainty, surface stale/conflicting evidence, and leave truthfulness declarations and final submission to the human.

Live demo: https://webclerk.netlify.app/demo  
Source: https://github.com/ThunderKhan/webclerk
