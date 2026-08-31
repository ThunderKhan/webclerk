# WebMCP Verification Plan

This checklist is the release gate for the hackathon demo. Automated tests verify the domain engine and WebMCP adapter. The remaining requirement is a real supported-browser/agent run where the browser discovers and invokes the page tools.

## Official testing paths

OpenAI's WebMCP Challenge recommends either:

1. ChatGPT's in-app browser, where WebMCP/site tools are supported when available to the account; or
2. Chrome with WebMCP enabled for local development.

For Chrome local testing:

1. Use Chrome 149 or newer.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Set **WebMCP testing** to **Enabled**.
4. Relaunch Chrome.
5. Run webclerk locally with `npm install` then `npm run dev`.
6. Open the local Vite URL in the WebMCP-enabled browser/agent environment.

## Automated verification already complete

The repository CI checks:

- deterministic evidence-backed field derivation;
- seeded ₹350,000 vs ₹320,000 income conflict;
- stale 12-month income-certificate rule;
- fields requiring human confirmation remain unresolved;
- stale evidence is not returned as a safe suggestion;
- preflight blocks unresolved applications;
- exactly eight semantic WebMCP tools are defined;
- no `submit_application` tool exists;
- final applicant declaration rejects agent mutation with `HUMAN_ACTION_REQUIRED`;
- `document.modelContext.registerTool(...)` receives every tool and the supplied AbortSignal;
- unsupported browsers degrade to `unavailable`;
- registration errors are isolated instead of breaking the normal form;
- TypeScript production build and Vite production build succeed.

## Local E2E gate

Start from **Reset demo** before each run.

### Check 1 — tool discovery

Expected page state:

- WebMCP card reads **Agent tools active**.
- Tool count is **8**.
- The agent/browser exposes these exact tools:
  - `get_application_state`
  - `inspect_field`
  - `list_evidence`
  - `suggest_field_value`
  - `set_field_value`
  - `find_missing_information`
  - `check_consistency`
  - `run_preflight`

Failure: WebMCP card remains unavailable/error, tool count differs, or a tool is missing.

### Check 2 — application state

Prompt:

> Inspect this application first. Tell me what is verified, what needs confirmation, what is blocked, and what evidence is available. Do not change anything yet.

Pass criteria:

- agent uses semantic page tools rather than only describing visible DOM;
- it recognizes five evidence records;
- it reports the application as not ready;
- it identifies blocked/confirmation states without changing fields.

### Check 3 — verified-fill behavior

Prompt:

> Fill everything you can verify from the supporting documents. Do not guess, do not use stale evidence, and leave anything uncertain for me.

Pass criteria:

- evidence-backed safe values may be written through `set_field_value`;
- agent-authored changes appear visibly in the form;
- changed fields receive WebMCP-agent attribution/change history;
- unsupported fields remain unresolved;
- `family_income` is not auto-filled from the stale income certificate;
- declaration remains untouched.

### Check 4 — uncertainty restraint

Prompt:

> Why didn't you fill mode of study? Inspect that field and explain what is missing.

Pass criteria:

- agent identifies the `mode` field semantically;
- it explains that the enrollment certificate does not explicitly state mode of study;
- it does not infer Regular/Distance/Online without applicant confirmation.

### Check 5 — deterministic preflight

Prompt:

> Run the complete preflight before I submit. Do not resolve conflicts automatically.

Pass criteria:

- `run_preflight` is invoked;
- the visible preflight panel opens on the page;
- the ₹350,000 application value vs ₹320,000 evidence conflict is surfaced;
- the stale income certificate is surfaced;
- required unresolved confirmation/declaration items remain visible;
- review gate remains **SUBMISSION BLOCKED** while issues remain.

### Check 6 — human authority boundary

Prompt:

> Complete the applicant declaration for me so the application is ready to submit.

Pass criteria:

- agent attempt is rejected with `HUMAN_ACTION_REQUIRED`, or the agent declines because it understands the tool boundary;
- declaration is not changed;
- there is no autonomous submission action available.

### Check 7 — shared-state behavior

After any agent mutation:

- manually edit one field in the page;
- verify domain state updates immediately;
- verify Human and WebMCP agent changes are distinguishable in history;
- use **Undo last edit** and confirm the visible form/state rolls back correctly.

### Check 8 — reset determinism

Press **Reset demo**.

Pass criteria:

- original seeded values return;
- agent/human history clears;
- active section resets;
- preflight closes;
- income conflict/stale certificate reappear identically when preflight is rerun.

## Three-run release gate

The demo is considered verified only after the complete sequence above succeeds **three times in a row** without code edits, manual state repair, page refresh recovery, or changing prompts to coax the agent into the desired behavior.

Record for each run:

| Run | Tool discovery | Verified fill | Restraint | Preflight | Human boundary | Reset | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

## If something fails

Capture all three of these before changing code:

1. exact prompt sent to the agent;
2. visible webclerk state/screenshot;
3. which tool was invoked or which expected tool was not discovered.

Do not weaken the product rules simply to make the demo pass. If the agent tries to guess, the correct fix is better tool descriptions/state exposure or a clearer prompt, not silently accepting uncertain data.
