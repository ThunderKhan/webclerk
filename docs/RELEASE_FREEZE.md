# Hackathon Release Freeze

**Status:** READY TO FREEZE AFTER FINAL REHEARSAL  
**Date:** 1 September 2026  
**Scope:** generalized WebMCP tool factory, deterministic trust engine, authority model, scholarship demo, insurance proof, security annotations, and adversarial evals.

## Current release baseline

The implementation now has two executable consequential workflows powered by the same trust architecture:

1. scholarship application — primary polished demo;
2. motor-insurance claim — live generalization proof.

The release baseline includes:

- exactly nine semantic WebMCP tools;
- 7 read tools / 2 write tools;
- workflow-configurable `WebMcpWorkflowContext`;
- workflow-configurable `TrustRules`;
- explicit `AGENT_AUTHORITY` contract;
- granular writes authorized before mutation;
- `untrustedContentHint` on evidence-derived tool output;
- runtime-time evidence validity with deterministic injected clocks in tests;
- adversarial authority evals;
- no final submission capability;
- human-only consequential attestations;
- CI-enforced test and production-build gate.

## Primary scholarship baseline

From reset:

- completion: 70%;
- verified: 3;
- review: 11;
- blocked: 2;
- incomplete: 7.

A successful evidence-backed bulk preparation should:

- apply exactly six safe WebMCP edits;
- move completion from 70% to 96%;
- move verified fields from 3 to 9;
- preserve 11 applicant-confirmation items;
- preserve two evidence blockers;
- produce zero unsupported agent edits;
- produce zero consequential agent actions;
- retain the ₹3,50,000 vs ₹3,20,000 income conflict;
- retain the stale income certificate;
- keep the declaration human-only;
- expose no submission tool.

## Insurance generalization baseline

The live route is:

`https://webclerk.vercel.app/proof/insurance`

The same semantic tool factory should:

- expose the motor-insurance application context;
- identify four safe blank evidence-backed values;
- safely fill claimant name, policy number, vehicle registration, and incident date;
- preserve the ₹85,000 vs ₹78,500 repair-estimate conflict;
- preserve claimant-only fault admission;
- preserve claimant-only first-person narrative;
- reject the fraud declaration as a human-only action;
- expose no submission capability.

## Security baseline

The following must remain true:

- unsupported granular values are refused before mutation;
- stale evidence cannot authorize an agent write;
- unresolved conflicts cannot be silently overwritten by the evidence-authorized path;
- confirmation-only facts cannot be promoted into evidence-backed agent facts;
- human-only fields return `HUMAN_ACTION_REQUIRED`;
- evidence-derived outputs use `untrustedContentHint`;
- evidence content cannot extend the registered capability surface;
- submission remains absent rather than merely discouraged.

See `docs/SECURITY.md` and `docs/EVALS.md`.

## Freeze trigger

The release becomes **FROZEN** after one final clean rehearsal confirms:

- GitHub Actions is green;
- production Vercel deployment is green;
- scholarship WebMCP flow matches the baseline;
- insurance route loads and exposes the same nine-tool surface;
- declaration/fraud-attestation boundaries remain intact;
- recording environment is stable.

After that point, do not refactor core architecture before submission.

## Allowed post-freeze changes

Only land changes that are necessary for:

- a reproducible correctness bug;
- broken deployment;
- inaccurate documentation;
- recording-blocking presentation defects;
- mandatory submission compliance.

Avoid feature expansion and visual churn after the clean rehearsal.

## Known prototype boundary

The demo uses fictional, human-inspectable evidence with deterministic pre-extracted facts. Arbitrary OCR or document parsing is intentionally outside the hackathon core.

That boundary is deliberate: webclerk is demonstrating the **trust, evidence, authority, and shared-state layer after evidence exists**, not competing as a document-extraction benchmark.

A production deployment would additionally require authentication, server-side enforcement, encrypted/durable evidence storage, durable audit logs, privacy controls, file scanning, and domain-specific compliance.

## Final gate

Use `docs/VERIFICATION.md` as the canonical final rehearsal checklist.

When every release-critical item passes, record the demo immediately and avoid further architectural changes.
