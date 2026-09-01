# Final Demo Script

## Goal

Tell one complete story in under three minutes:

> A consequential form should not be optimized for completion alone. webclerk lets an agent prepare what can be justified by evidence, keeps uncertainty visible, and leaves consequential commitments to the human — using a WebMCP trust layer that generalizes across workflows.

Target runtime: **2:40–2:55**.

Use a ChatGPT browser/runtime that supports Site Tools write execution for the recorded WebMCP flow.

---

## 0:00–0:12 — Hook

**Visual:** scholarship application at reset state, showing the incomplete/conflicting case.

**Narration:**

> Autofill systems optimize for filling more fields. On consequential forms, that becomes dangerous when evidence is incomplete, stale, or contradictory.

---

## 0:12–0:27 — WebMCP-native trust

**Visual:** briefly show the WebMCP/Site Tools surface.

**Narration:**

> webclerk makes the website expose semantic capabilities through WebMCP. The site defines evidence, validation, and agent authority instead of asking the model to infer everything from the interface.

On-screen proof:

- 9 semantic tools
- 7 read / 2 write
- machine-readable agent authority
- no submission capability

---

## 0:27–1:02 — Evidence-backed preparation

**Prompt:**

> Fill everything you can verify from my documents. Don't guess anything.

The agent should identify six safe fields and request approval before the write.

**Approve the write.**

Show:

- completion **70% → 96%**
- verified **3 → 9**
- **6 evidence-backed agent edits**
- **0 unsupported edits**
- **0 consequential agent actions**

**Narration:**

> The site authorizes exactly six values backed by current accepted evidence. The agent writes them into the same state the applicant sees, while unsupported and consequential actions remain outside its authority.

---

## 1:02–1:18 — Provenance

**Visual:** show one agent-authored history entry and one field explanation.

**Narration:**

> The changes are visibly attributed to WebMCP, and the field state remains traceable to the evidence and deterministic rule that justified it.

---

## 1:18–1:36 — Uncertainty is state

**Prompt:**

> Why didn't you fill mode of study?

**Visual:** mode of study remains **Needs confirmation**.

**Narration:**

> The enrollment certificate never states the study mode, so webclerk keeps it uncertain instead of turning a plausible guess into a verified fact.

---

## 1:36–2:05 — Preflight catches what completion hides

**Prompt:**

> Check everything before I submit.

Show:

- form income **₹3,50,000**
- evidence income **₹3,20,000**
- stale income certificate
- remaining confirmations
- declaration incomplete
- readiness blocked

**Narration:**

> Preflight exposes the evidence conflict and stale certificate rather than silently choosing a convenient answer. Completion percentage is not treated as truth.

---

## 2:05–2:23 — Human authority

**Prompt:**

> Complete the declaration for me.

**Visual:** structured refusal / declaration unchanged.

**Narration:**

> The agent can prepare the case, but it cannot make the applicant's truthfulness attestation. Final submission is not even present in the WebMCP capability surface.

---

## 2:23–2:42 — Prove it is not a scholarship script

**Visual:** switch to `https://webclerk.vercel.app/proof/insurance`.

Show the motor-insurance workspace and, if timing allows, the WebMCP tools or a prepared safe-fill result.

**Narration:**

> And the scholarship is not the architecture. The same deterministic engine and the same nine-tool WebMCP factory run this motor-insurance claim, with different evidence, a repair-estimate conflict, and claimant-only legal decisions.

Key visible proof:

- insurance title / claim ID;
- repair estimate conflict: ₹85,000 vs ₹78,500;
- fault admission or fraud declaration marked human authority.

---

## 2:42–2:55 — Close

**Visual:** clean webclerk branding / architecture summary.

**Narration:**

> WebMCP gives websites a language for agents. webclerk uses that language to expose not only capability, but the limits of delegated authority.

End card:

**webclerk**  
**Never guess on consequential forms.**

---

## Recording rules

- Stay below three minutes; do not depend on anything after 2:59.
- Keep the approval interaction: it demonstrates the write boundary.
- Do not imply arbitrary PDFs are dynamically parsed; the hackathon core uses deterministic pre-extracted evidence.
- Do not claim the agent can submit.
- Do not fake tool calls or manually edit state to manufacture the result.
- Do not over-explain implementation. Let the shared-state mutation, uncertainty, refusal, and second workflow prove the architecture.
- If the run deviates from the verified baseline, restart from a fresh chat/reset rather than repairing it during the recording.
