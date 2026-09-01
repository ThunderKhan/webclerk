# Recording Plan

Shot-by-shot plan for the final WebMCP Challenge video.

Target duration: **2:40–2:55**. Record at 1080p or better if possible.

## Pre-record setup

- Use a ChatGPT browser/runtime that supports Site Tools write execution.
- Open `https://webclerk.vercel.app/demo`.
- Start a fresh chat.
- Press **Reset demo**.
- Confirm 70% completion / 3 verified / 11 review / 2 blocked / 7 incomplete.
- Open Site Tools once and confirm 9 tools / 7 read / 2 write.
- In another tab, preload `https://webclerk.vercel.app/proof/insurance`.
- Close unrelated tabs and notifications.
- Set browser zoom so status, provenance and blockers remain readable.
- Keep mouse movement deliberate.

## Shot list

### Shot 1 — Problem (0:00–0:12)

Frame:
- scholarship heading
- incomplete/conflicting application state
- trust/evidence context

Narration focus:
- consequential workflows need justified completion, not maximum completion.

### Shot 2 — WebMCP proof (0:12–0:27)

Open Site Tools briefly.

Capture:
- 9 semantic tools
- 7 read / 2 write
- bulk evidence-backed preparation
- preflight

If the runtime exposes annotations, briefly show that evidence-derived tools are read-only/untrusted-content aware. Do not narrate every tool.

### Shot 3 — Natural-language intent (0:27–0:40)

Prompt:

> Fill everything you can verify from my documents. Don't guess anything.

Keep the prompt visible while the agent identifies the safe action.

### Shot 4 — Approval boundary (0:40–0:50)

Capture the approval request before the bulk site write.

Approve it.

This is an intentional trust moment.

### Shot 5 — Shared-state result (0:50–1:02)

Capture:
- 96% completion
- 9 verified
- 6 evidence-backed agent edits
- 0 unsupported edits
- 0 consequential agent actions

Pause briefly so the result is legible.

### Shot 6 — Provenance (1:02–1:18)

Show:
- at least one `WebMCP · Agent via WebMCP` entry;
- one field explanation with supporting evidence and decision state.

Narration focus:
- the agent write is auditable and evidence-grounded.

### Shot 7 — Uncertainty (1:18–1:36)

Prompt:

> Why didn't you fill mode of study?

Show the field still marked **Needs confirmation**.

### Shot 8 — Preflight (1:36–2:05)

Prompt:

> Check everything before I submit.

Capture:
- readiness blocked;
- ₹3,50,000 vs ₹3,20,000 conflict;
- stale income certificate;
- remaining confirmations;
- declaration incomplete.

### Shot 9 — Human boundary (2:05–2:23)

Prompt:

> Complete the declaration for me.

Capture the refusal / unchanged declaration.

Do not manually complete it.

### Shot 10 — Generalization proof (2:23–2:42)

Switch to the preloaded insurance tab:

`https://webclerk.vercel.app/proof/insurance`

Capture:
- **Motor Insurance Claim** title;
- same WebMCP-active status;
- repair estimate blocked at ₹85,000 vs evidence ₹78,500;
- claimant-only fault admission or fraud declaration.

If a clean insurance WebMCP run has already been captured, show the four safe evidence-backed fields populated. Otherwise, do not burn recording time waiting for another agent response — the live workspace + tests prove the architecture.

Narration focus:

> Same trust engine. Same nine-tool factory. Different consequential workflow.

### Shot 11 — End (2:42–2:55)

Return to clean webclerk branding or architecture.

End on:

**webclerk**  
**Never guess on consequential forms.**

## Editing rules

- Hard cap: **under 3:00**.
- Cut model waiting time, but keep the approval interaction visible.
- Prefer simple hard cuts.
- Keep text readable; do not excessively speed UI footage.
- Captions are useful for the four primary prompts.
- Do not imply arbitrary PDF OCR exists.
- Do not imply the agent can attest or submit.
- Do not fake tool calls or manually manufacture agent results.
- The strongest proof is state transition + restraint + refusal + second workflow.

## Backup clips

Capture separate short clips of:

1. Site Tools showing 9 tools / 7 read / 2 write.
2. Scholarship result showing six safe WebMCP edits.
3. `WebMCP · Agent via WebMCP` provenance.
4. Income conflict + stale certificate.
5. Human-only declaration refusal.
6. Insurance route showing the second workflow and repair conflict.

These can replace a bad segment without rerunning the entire presentation.
