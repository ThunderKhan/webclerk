# Final Demo Script

## Goal

Tell one complete story in under three minutes:

> A consequential form should not be optimized for completion alone. webclerk lets an agent prepare what can be justified by evidence, keeps uncertainty visible, surfaces conflicts, and leaves consequential commitments to the human.

Target runtime: **2:35–2:50**.

Use **ChatGPT desktop + 5.6 Sol Medium** for the recorded agent flow because that is the environment in which the natural-language WebMCP write path was verified end to end.

---

## 0:00–0:12 — Hook

**Visual:** webclerk application at reset state, showing 70% completion and the evidence panel.

**Narration:**

> Most form autofill systems optimize for one thing: filling more fields. That becomes dangerous when the form is consequential and the evidence is incomplete, stale, or contradictory.

---

## 0:12–0:27 — What webclerk changes

**Visual:** briefly show the WebMCP card / Site Tools list.

**Narration:**

> webclerk makes the form itself expose semantic tools through WebMCP. The agent works with application state, evidence, consistency rules, and preflight checks instead of guessing from labels or coordinates.

On-screen proof if convenient:

- 9 site tools
- 7 read / 2 write
- no `submit_application`

---

## 0:27–1:05 — Evidence-backed preparation

**Prompt:**

> Fill everything you can verify from my documents. Don't guess anything.

**Visual:** keep the page on the application summary while the agent reasons.

The agent should identify six safe fields and ask permission before using the site write tool.

**Approve the write.**

**Narration while the state updates:**

> The agent found six fields supported by current accepted evidence. Because this changes the draft, it asks before writing.

Then show:

- completion **70% → 96%**
- verified **3 → 9**
- Agent Decision Summary: **6 / 11 / 2 / 0 / 0**

**Narration:**

> Six fields were written through WebMCP. Eleven applicant confirmations remain. Two evidence blockers remain. Unsupported edits: zero. Consequential actions: zero.

---

## 1:05–1:23 — Provenance

**Visual:** scroll to **Who changed what** and one **Why this status?** panel.

Show:

- `WebMCP · Agent via WebMCP`
- source PDF
- evidence fact
- evidence validity
- decision rule
- verified result

**Narration:**

> Every agent write is attributed and traceable back to the source document, the extracted fact, its validity, and the rule that accepted it.

---

## 1:23–1:42 — Uncertainty is state

**Prompt:**

> Why didn't you fill mode of study?

**Visual:** mode of study remains **Needs confirmation**.

**Narration:**

> The enrollment certificate never explicitly states the study mode, so webclerk does not promote “Regular” to verified just because it looks plausible.

Optional agent explanation should reinforce that the value requires applicant confirmation.

---

## 1:42–2:15 — Preflight catches what completion hides

**Prompt:**

> Check everything before I submit.

**Visual:** deterministic preflight / final review gate.

Make sure these are visible:

- annual family income blocked
- form: **₹3,50,000**
- evidence: **₹3,20,000**
- income certificate outside accepted 12-month validity window
- remaining confirmations
- declaration incomplete
- **SUBMISSION BLOCKED**

**Narration:**

> Before submission, deterministic preflight catches the things a normal autofill system might hide: the form says three lakh fifty thousand, the certificate says three lakh twenty thousand, and that certificate is stale. webclerk surfaces the conflict instead of choosing a convenient answer.

---

## 2:15–2:34 — Human authority

**Prompt:**

> Complete the declaration for me.

**Visual:** declaration remains untouched / human-only boundary.

**Narration:**

> The agent can prepare the application. It cannot attest truthfulness for the applicant, and final submission is intentionally not exposed as a WebMCP tool.

---

## 2:34–2:48 — Close

**Visual:** return to the summary / clean webclerk branding.

**Narration:**

> webclerk turns consequential forms into shared human-agent workspaces where every filled value has evidence, every uncertainty stays visible, and the human keeps the final authority.

End card:

**webclerk**  
**Never guess on consequential forms.**

---

## Recording rules

- Do not mention development failures or unsupported lightweight runtimes in the video.
- Do not imply arbitrary PDFs are dynamically parsed; the MVP uses pre-extracted deterministic evidence.
- Do not claim the agent can submit.
- Keep the approval interaction in the video: it demonstrates the write boundary.
- Do not fake tool calls or edit state manually during the recording.
- If the run deviates from the verified baseline, stop and restart from a fresh chat/reset rather than repairing it mid-recording.
