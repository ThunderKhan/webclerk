# Product Requirements Document

## Product

**webclerk**

**Principle:** Never guess on consequential forms.

## Problem

People completing high-stakes online applications are often forced to interpret ambiguous questions, cross-reference multiple supporting documents, detect inconsistencies, and understand unfamiliar requirements inside interfaces that provide little contextual guidance.

The cost of a mistake is not merely inconvenience. A misunderstood field, stale certificate, inconsistent value, or unsupported assumption can delay or derail a scholarship, benefit, permit, claim, admission, or other important application.

Traditional autofill optimizes for speed. Generic AI chat can explain documents, but it does not naturally share the semantic state of the form being completed. Consequential forms need a different interaction model: evidence provenance, uncertainty awareness, contextual explanation, validation, and human confirmation.

## Product thesis

webclerk turns a consequential web form into a shared human-agent workspace. The application exposes semantic form state and safe actions through WebMCP so an agent can understand what fields mean, inspect supporting evidence, suggest only defensible values, identify conflicts, and prepare the application while leaving consequential decisions to the user.

## Hackathon target user

A student applying for a scholarship that requires identity, education, financial, domicile, and eligibility information supported by uploaded documents.

The scholarship is fictional but realistic so the demo is deterministic, privacy-safe, and does not depend on a live government or third-party portal.

## User job

> Help me complete this important application correctly using the evidence I already have, tell me what you cannot know, and catch problems before I submit.

## Core user stories

### Evidence-backed completion

As an applicant, I can ask the agent to fill everything it can verify from my documents so that repetitive but well-supported fields are completed quickly.

### Visible uncertainty

As an applicant, I can immediately distinguish verified values from suggestions requiring confirmation and fields blocked by missing/conflicting evidence.

### Contextual explanation

As an applicant, I can ask what a specific field means and receive an explanation grounded in the current form, its requirements, and my available evidence.

### Provenance

As an applicant, I can inspect where a suggested or filled value came from before trusting it.

### Consistency checking

As an applicant, I can detect contradictions between form values and supporting documents before submission.

### Preflight

As an applicant, I can run a final audit that reports blocking issues, warnings, missing evidence, and unresolved questions.

### Human control

As an applicant, I must explicitly review consequential changes and perform final submission myself.

## Semantic field states

Every consequential field must be represented by one of these states:

- **Verified** — supported directly by acceptable evidence or explicit user confirmation.
- **Needs confirmation** — a plausible value exists, but interpretation or evidence is insufficient for automatic acceptance.
- **Blocked** — required information is missing, invalid, expired, or contradictory.
- **Empty** — no value has been proposed yet.

The UI should make these states visually obvious without requiring the user to inspect chat history.

## MVP scenario

The fictional **Future Scholars Grant 2026** application contains approximately 20–25 fields across:

- personal information
- education
- financial information
- eligibility
- supporting documents

Seeded supporting evidence:

- identity document
- enrollment certificate
- marksheet
- income certificate
- domicile certificate

The demo dataset intentionally includes:

1. an income value conflict between the existing form and income certificate;
2. an income certificate that fails a recency requirement;
3. at least one field that requires human interpretation/confirmation.

These are product behaviors to demonstrate, not random errors.

## Functional requirements

### Form workspace

- Render all sections and fields with semantic status.
- Support direct human editing.
- Record field provenance when values are suggested or set by the agent.
- Allow agent-originated changes to be reviewed and undone.

### Evidence workspace

- List available supporting documents.
- Expose structured facts extracted/seeded from each document.
- Link evidence facts to the fields they support.
- Show evidence age/validity where relevant.

### Agent collaboration

Through WebMCP, the agent must be able to:

- inspect overall application state;
- inspect one field and its requirements;
- inspect available evidence;
- suggest an evidence-backed value;
- update a field through application logic;
- identify missing information;
- detect consistency problems;
- run preflight validation;
- prepare the application for human review.

### Preflight

The preflight experience must surface:

- blockers;
- warnings;
- unresolved confirmation items;
- evidence conflicts;
- stale/invalid evidence;
- completion summary.

## Safety and trust requirements

- Never invent a value to maximize completion percentage.
- Never silently convert an uncertain suggestion into a verified answer.
- Never hide evidence conflicts.
- Never autonomously submit the application in the MVP.
- Agent-originated mutations must remain visible and reversible.
- Demo data must be fictional; no real identity or government credentials are required.

## Non-goals

The MVP is **not**:

- a universal arbitrary-form browser extension;
- a general OCR engine;
- a real scholarship application portal;
- a government integration;
- an Aadhaar/DigiLocker integration;
- an identity-verification product;
- legal, financial, immigration, or eligibility advice;
- an autonomous application-submission agent.

## Product success criteria

The MVP succeeds if a first-time judge can, within the three-minute demo:

1. understand the real-world problem without technical explanation;
2. see the agent fill multiple fields using evidence;
3. see at least one field deliberately left unresolved instead of guessed;
4. inspect provenance for a suggested value;
5. see the agent detect the seeded conflict and stale document;
6. understand why WebMCP is materially better than generic chat/autofill;
7. observe that the human remains in control of consequential actions.

## Hackathon positioning

The key WebMCP delta is not "AI can fill forms." It is:

> The webpage exposes the meaning, requirements, evidence relationships, validation state, and safe actions of the application directly to the agent, letting the human and agent collaborate on the same structured state rather than forcing either side to infer it from pixels or copy/pasted context.
