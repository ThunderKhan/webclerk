# Hackathon Release Freeze

**Status:** FROZEN  
**Date:** 1 September 2026  
**Scope:** WebMCP implementation, deterministic evidence engine, trust rules, and core scholarship demo behavior.

## Freeze decision

The WebMCP implementation is frozen for the hackathon because the core end-to-end behavior has been verified in production.

A successful ChatGPT desktop run using **5.6 Sol Medium** demonstrated:

- natural-language discovery of the bulk evidence-backed preparation intent;
- selection of the site's semantic WebMCP write capability;
- explicit user approval before draft mutation;
- exactly six safe WebMCP edits;
- completion change from 70% to 96%;
- verified count change from 3 to 9;
- six edits visibly attributed as **WebMCP · Agent via WebMCP**;
- 11 applicant confirmations preserved;
- two blockers surfaced;
- zero unsupported agent edits;
- zero consequential agent actions;
- stale/conflicting income evidence left untouched;
- deterministic preflight remaining blocked;
- human-only truthfulness declaration;
- no `submit_application` capability.

Independent direct-browser testing has also verified the underlying WebMCP registration, invocation, state mutation, preflight, and `HUMAN_ACTION_REQUIRED` declaration boundary.

## What is frozen

Do not change before submission unless a reproducible correctness regression is found:

- the nine-tool WebMCP surface;
- tool names and read/write semantics;
- `fill_verified_fields_from_evidence` behavior;
- declaration protection;
- deterministic evidence acceptance rules;
- stale-evidence rule;
- conflict rule;
- field status model;
- provenance model;
- Agent Decision Summary semantics;
- reset seed data;
- deliberate ₹3,50,000 vs ₹3,20,000 conflict;
- absence of autonomous submission.

## Allowed changes

Safe pre-submission changes are limited to:

- documentation;
- video/submission copy;
- non-functional typo fixes;
- clearly isolated presentation fixes that cannot change the WebMCP demo behavior.

Avoid visual churn immediately before recording.

## Known MVP boundary

The five demo PDFs are fictional and human-inspectable, but the MVP does not dynamically OCR or parse arbitrary uploaded PDFs. Evidence facts are pre-extracted and deterministic by design.

This is intentional. The hackathon contribution is the trusted shared human-agent form workspace and semantic WebMCP contract, not a document-extraction benchmark.

## Runtime note

The verified natural-language write flow uses **ChatGPT desktop with 5.6 Sol Medium**. During development, lighter runtimes could discover the Site Tools surface but did not consistently execute semantic writes.

For judging and recording, use the verified environment rather than changing product behavior to accommodate unsupported or inconsistent runtimes.

## Final gate before recording

Run the checklist in `docs/VERIFICATION.md` once from a fresh chat after usage credits are available.

If it matches the frozen baseline, record immediately. Do not perform additional refactors between the passing rehearsal and the recording.
