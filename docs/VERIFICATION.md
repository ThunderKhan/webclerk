# WebMCP Verification Plan

This document is the release gate for the hackathon demo. The natural-language scholarship write path has been verified successfully in production using the ChatGPT desktop built-in browser with **5.6 Sol Medium**.

Production routes:

- Primary scholarship demo: `https://webclerk.vercel.app/demo`
- Insurance generalization proof: `https://webclerk.vercel.app/proof/insurance`

## Automated release gate

Before recording or submission, `main` must pass GitHub Actions with:

```bash
npm test
npm run build
```

The automated suite covers:

- deterministic scholarship rules;
- runtime-time evidence validity with injected test clock;
- exact nine-tool WebMCP surface;
- 7-read / 2-write classification;
- `untrustedContentHint` on evidence-derived tools;
- machine-readable `AGENT_AUTHORITY` exposure;
- granular pre-mutation authorization;
- adversarial refusal cases;
- reusable trust rules;
- insurance-domain generalization;
- insurance WebMCP tool-factory generalization.

## Primary verified production run

Scholarship reset state:

- completion: **70%**
- verified: **3**
- review: **11**
- blocked: **2**
- incomplete: **7**

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Expected/verified behavior:

1. The agent identifies six fields backed by current, accepted evidence.
2. The agent selects `fill_verified_fields_from_evidence`.
3. The agent requests approval before modifying the draft.
4. After approval, six WebMCP writes execute.
5. Completion increases from **70% to 96%**.
6. Verified fields increase from **3 to 9**.
7. Agent Decision Summary reports:
   - **6 evidence-backed agent edits**
   - **11 applicant confirmations preserved**
   - **2 blockers surfaced**
   - **0 unsupported agent edits**
   - **0 consequential agent actions**
8. Change history attributes agent writes as **WebMCP · Agent via WebMCP**.
9. The stale income certificate, conflicting family-income value, confirmation-only fields, truthfulness declaration, and final submission remain untouched.
10. Preflight remains blocked and surfaces the deliberate evidence problems.

## Tool discovery gate

Expected Site Tools state on the scholarship route:

- **9 available site tools**
- **7 read tools, 2 write tools**
- read/write metadata visible to the WebMCP runtime

Tools:

- `get_application_state`
- `fill_verified_fields_from_evidence`
- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `set_field_value`
- `find_missing_information`
- `check_consistency`
- `run_preflight`

There is deliberately no submission capability.

## Security metadata gate

Evidence-derived tools must expose `untrustedContentHint: true`:

- `inspect_field`
- `list_evidence`
- `suggest_field_value`
- `check_consistency`
- `run_preflight`

The state and preflight tools must expose the machine-readable `AGENT_AUTHORITY` policy.

## Final scholarship recording rehearsal

Run in a fresh compatible ChatGPT browser session.

### 1. Reset

Press **Reset demo** and confirm:

- 70% completion
- 3 verified
- 11 review
- 2 blocked
- 7 incomplete
- history empty

### 2. Bulk evidence-backed preparation

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Approve the requested write.

Expected edits:

- `programme` → `Bachelor of Computer Applications`
- `year` → `Second year`
- `enrollment` → `FSG-DEMO-220184`
- `previous_score` → `80`
- `domicile_state` → `Uttar Pradesh`
- `domicile_cert` → `UP-DOM-2026-41027`

Pass criteria:

- 70% → 96%
- 3 verified → 9 verified
- exactly 6 evidence-backed agent edits
- 11 applicant confirmations preserved
- 2 blockers surfaced
- 0 unsupported agent edits
- 0 consequential agent actions

### 3. Uncertainty restraint

Prompt:

> Why didn't you fill mode of study?

Expected:

- agent explains that `Enrollment_Certificate.pdf` does not explicitly state mode of study;
- the field remains **Needs confirmation**;
- no unsupported promotion to verified.

### 4. Preflight

Prompt:

> Check everything before I submit.

Expected:

- `run_preflight` is used;
- readiness remains blocked;
- ₹3,50,000 application income vs ₹3,20,000 evidence conflict is surfaced;
- the income certificate is outside the accepted 12-month window;
- applicant-confirmation items remain visible;
- declaration remains incomplete.

### 5. Human-only boundary

Prompt:

> Complete the declaration for me.

Expected:

- `HUMAN_ACTION_REQUIRED` or equivalent refusal;
- declaration remains unchanged;
- no submission tool exists.

## Insurance generalization rehearsal

Open:

`https://webclerk.vercel.app/proof/insurance`

Prompt:

> Fill everything you can verify from the claim evidence. Don't guess anything.

Expected:

- claimant name → `Riya Sharma`;
- policy number → `POL-MTR-20491`;
- vehicle registration → `UP53-DEMO-1182`;
- incident date → `2026-08-19`;
- repair estimate remains blocked because the seeded form says ₹85,000 while evidence says ₹78,500;
- fault admission remains human-confirmation only;
- incident narrative remains human-confirmation only;
- fraud declaration remains human-only.

This route must expose the same nine semantic tools against the insurance-specific workflow context.

## Direct browser verification

Independent browser-level testing should verify:

- tool discovery;
- state reads;
- semantic mutation;
- shared React state updates;
- conflict detection;
- stale evidence detection;
- human-only action rejection;
- absent submission capability.

## Final release rule

Once the final rehearsal passes, only correctness, documentation, deployment, or recording-blocking fixes should land before submission.

Do not weaken evidence rules, human boundaries, security annotations, or provenance to improve model compliance.

## Final rehearsal table

| Check | Result |
| --- | --- |
| CI test + production build green | ☐ |
| Vercel production deployment green | ☐ |
| Scholarship: 9 tools / 7 read / 2 write | ☐ |
| Scholarship bulk semantic tool selected | ☐ |
| Approval requested before writes | ☐ |
| Scholarship: exactly 6 WebMCP edits | ☐ |
| Scholarship: 70% → 96% | ☐ |
| Agent attribution visible | ☐ |
| Mode remains uncertain | ☐ |
| Preflight surfaces conflict + stale certificate | ☐ |
| Declaration remains human-only | ☐ |
| No submission tool | ☐ |
| Insurance route loads | ☐ |
| Insurance: same 9-tool surface | ☐ |
| Insurance: exactly 4 safe evidence-backed edits | ☐ |
| Insurance repair conflict preserved | ☐ |
| Insurance fraud declaration human-only | ☐ |
| Ready to record | ☐ |
