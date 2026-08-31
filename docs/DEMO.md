# Demo Plan

## Objective

Tell one complete story in under three minutes:

> A student is completing an important scholarship form. webclerk lets an agent use supporting evidence to help, visibly refuses to guess where evidence is insufficient, and catches problems before the human submits.

The demo should feel like a product interaction, not an API showcase.

## Target runtime

Aim for **2:30–2:45** so editing, pauses, or network delay do not push the final video beyond three minutes.

## Script

### 0:00–0:15 — Problem

Show the scholarship application with multiple sections and documents.

Narration idea:

> Important forms don't usually fail because people can't type. They fail because people don't know exactly what a field means, which document supports it, or whether two pieces of information conflict.

### 0:15–0:30 — Product setup

Show webclerk's form and evidence panel.

Narration:

> webclerk turns the form into a shared workspace for the applicant and an AI agent, with the form itself exposing its semantic state through WebMCP.

### 0:30–1:05 — Aha #1: evidence-backed completion

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Expected visible behavior:

- agent inspects application/evidence;
- several fields populate;
- populated values receive provenance;
- at least one uncertain field stays unresolved;
- agent-authored changes appear in the UI.

Briefly open provenance for one field.

### 1:05–1:30 — Aha #2: uncertainty

Prompt:

> Why didn't you fill this field?

Expected behavior:

- agent inspects the exact field;
- explains what the application requires;
- shows the supporting but insufficient/ambiguous evidence;
- presents a suggestion as `needs_confirmation`, not verified.

Human confirms or leaves unresolved.

Narration point:

> webclerk treats uncertainty as product state instead of hiding it inside model confidence.

### 1:30–2:10 — Aha #3: preflight

Prompt:

> Check everything before I submit.

Expected preflight findings:

1. annual family income conflict — form says ₹350,000, certificate says ₹320,000;
2. income certificate is older than the fictional 12-month requirement;
3. any remaining confirmation item.

Show blockers/warnings in the application itself.

Narration:

> The agent doesn't choose a convenient answer. It surfaces the conflict before the user makes a consequential submission.

### 2:10–2:30 — Human authority

Show that the user can review/undo an agent-originated change and that final submission remains a human action.

Narration:

> The agent can inspect, explain, fill, and validate. It cannot silently submit the application for you.

### 2:30–2:45 — WebMCP proof

Very briefly show the code or tool inspector with a few registered tools:

```text
get_application_state
inspect_field
list_evidence
set_field_value
run_preflight
```

Narration:

> With WebMCP, the agent interacts with the form's meaning and state through structured tools instead of guessing how to operate the page.

### 2:45–2:55 — Close

End card:

**webclerk**

**Never guess on consequential forms.**

## Demo requirements

- Seed state must reset deterministically.
- No account/login should be necessary.
- Do not depend on uploading private user documents during judging.
- Avoid long model-generated paragraphs; the UI should communicate state visually.
- Keep browser zoom and layout readable at video resolution.
- All three aha moments should work even if the narrator says very little.

## Failure fallback

Prepare a `Reset demo` control.

If live agent behavior becomes nondeterministic during recording/judging, domain operations must remain deterministic so the same tool sequence produces the expected state.

Do not fake tool calls; instead make the underlying demo data and validations stable enough that the real tool calls are reliable.

## Judge takeaway

By the end of the video, a judge should be able to say:

> webclerk isn't another form autofiller. It gives an agent structured access to the application's requirements and evidence while making uncertainty and human approval first-class parts of the experience.
