# Final Submission Checklist

Use this only after the implementation has stopped changing.

## Repository and deployment

- [ ] `main` is the intended submission commit.
- [ ] GitHub Actions is green on the submission commit.
- [ ] Vercel production deployment is green on the submission commit.
- [ ] Landing page loads: `https://webclerk.vercel.app/`.
- [ ] Scholarship demo loads: `https://webclerk.vercel.app/demo`.
- [ ] Insurance proof loads: `https://webclerk.vercel.app/proof/insurance`.
- [ ] Repository is public.
- [ ] MIT license is visible.
- [ ] README links resolve correctly.

## WebMCP contract

- [ ] Exactly 9 semantic tools are discoverable.
- [ ] 7 tools are read-only and 2 are writes.
- [ ] Evidence-derived tools expose `untrustedContentHint`.
- [ ] `get_application_state` exposes machine-readable `AGENT_AUTHORITY`.
- [ ] `run_preflight` exposes the same authority contract.
- [ ] `set_field_value` rejects unsupported values before mutation.
- [ ] Human-only declarations return `HUMAN_ACTION_REQUIRED`.
- [ ] No submission capability is registered.

## Scholarship final rehearsal

- [ ] Reset state is 70% / 3 verified / 11 review / 2 blocked / 7 incomplete.
- [ ] Prompt: `Fill everything you can verify from my documents. Don't guess anything.`
- [ ] Agent selects the semantic bulk-fill tool.
- [ ] Runtime requests approval before the write.
- [ ] Exactly 6 fields are filled through WebMCP.
- [ ] Completion becomes 96%.
- [ ] Verified becomes 9.
- [ ] Agent changes are visibly attributed.
- [ ] Mode of study remains human-confirmation only.
- [ ] ₹3,50,000 vs ₹3,20,000 income conflict remains visible.
- [ ] Stale income certificate remains blocked.
- [ ] Preflight is not ready.
- [ ] Declaration remains human-only.

## Insurance generalization rehearsal

- [ ] Route registers the same nine semantic tools.
- [ ] Claimant name can be filled from evidence.
- [ ] Policy number can be filled from evidence.
- [ ] Vehicle registration can be filled from evidence.
- [ ] Incident date can be filled from evidence.
- [ ] ₹85,000 vs ₹78,500 repair-estimate conflict remains blocked.
- [ ] Fault admission remains claimant-confirmation only.
- [ ] Incident narrative remains claimant-confirmation only.
- [ ] Fraud declaration remains human-only.

## Video

- [ ] Public YouTube video.
- [ ] Audio narration is present.
- [ ] Runtime is under 3:00.
- [ ] First 15 seconds establish the problem.
- [ ] WebMCP tool surface is visibly demonstrated.
- [ ] Approval boundary is visible.
- [ ] Shared-state mutation is visible.
- [ ] Uncertainty/refusal behavior is visible.
- [ ] Conflict + stale evidence are visible.
- [ ] Human-only declaration refusal is visible.
- [ ] Insurance generalization proof appears briefly.
- [ ] Video does not claim arbitrary PDF OCR.
- [ ] Video does not claim autonomous submission.

## Devpost / submission form

- [ ] Project name: `webclerk`.
- [ ] Public GitHub repository URL added.
- [ ] Live application URL added.
- [ ] Public YouTube demo URL added.
- [ ] Open-source license requirement satisfied.
- [ ] Description explains why the problem is a good fit for WebMCP.
- [ ] Description explains how WebMCP improves the human-agent UX.
- [ ] Description explains what humans + agents can do together.
- [ ] Description explains the actual WebMCP implementation.
- [ ] Submission explicitly mentions machine-readable authority.
- [ ] Submission explicitly mentions pre-mutation authorization.
- [ ] Submission explicitly mentions second live insurance workflow.
- [ ] Submission explicitly states final submission is not an agent capability.
- [ ] Screenshots are current.
- [ ] All submission materials are in English or include English explanation.

## Freeze

Once every release-critical box above passes:

1. do not add new product features;
2. record the final video;
3. upload/publish it;
4. paste from `docs/SUBMISSION.md` into the submission form;
5. submit before the deadline;
6. avoid changing submitted artifacts after the submission window closes.
