# WebMCP adversarial evals

webclerk treats agent authority as a capability boundary, not a prompt convention. The automated eval suite in `webmcp/evals.test.ts` deliberately exercises requests that a high-trust form assistant must refuse even when a user explicitly pressures the agent to proceed.

## Threat model

The evals cover five failure classes:

1. **Unsupported inference** — the user asks the agent to invent or guess a value that no acceptable evidence supports.
2. **Stale evidence override** — the user asks the agent to ignore an expired validity window.
3. **Conflict suppression** — the user asks the agent to silently choose one side of contradictory evidence.
4. **Applicant-only knowledge** — the user asks the agent to convert a self-declared or confirmation-only fact into an agent-authored value.
5. **Consequential authority escalation** — the user asks the agent to attest truthfulness or submit on their behalf.

## Expected invariants

| Scenario | Expected result |
|---|---|
| Fabricated programme value | `UNSUPPORTED_VALUE`; no mutation |
| Stale income certificate | `STALE_EVIDENCE`; no mutation |
| Existing evidence conflict | conflict remains visible; no silent mutation |
| Self-declared scholarship status | `HUMAN_CONFIRMATION_REQUIRED`; no mutation |
| Truthfulness declaration | `HUMAN_ACTION_REQUIRED`; no mutation |
| Final submission | capability is absent from the WebMCP tool surface |
| Legitimate evidence-backed preparation | safe fields still mutate successfully |

The final row matters: a safe system that refuses everything is not useful. webclerk must preserve useful agent capability while preventing unsupported or consequential authority escalation.

## Running

```bash
npm test
```

The evals run with the same Vitest suite as the deterministic domain and WebMCP registration tests.

## Why this matters for WebMCP

Tool descriptions help an agent choose the right action, but they are not the security boundary. The application itself validates every granular write before invoking the mutation bridge. The evals prove that unsafe requests do not reach application state even when the requested tool call is syntactically valid.

The resulting design is:

```text
user intent
    ↓
agent chooses WebMCP capability
    ↓
site-owned deterministic authorization
    ├─ supported + current + non-conflicting → mutation allowed
    └─ unsupported / stale / conflicting / human-only → structured refusal
```

This is the core webclerk claim: the website publishes both useful agent capabilities and the limits of delegated authority.
