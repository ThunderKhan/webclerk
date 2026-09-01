# Judge verification guide

This file is a fast path for evaluating webclerk against the OpenAI WebMCP Challenge criteria.

## 1. WebMCP leverage

Start with:

- `webmcp/index.ts` — the nine semantic WebMCP tools and registration lifecycle
- `webmcp/authority.ts` — explicit machine-readable agent authority
- `webmcp/webmcp.metadata.test.ts` — read/write and untrusted-content annotations
- `webmcp/authority.webmcp.test.ts` — authority contract surfaced to the agent

Key properties:

- semantic tools operate on application concepts, not DOM coordinates;
- human and agent share the same browser-visible state;
- granular writes are authorized by site-owned deterministic rules before mutation;
- evidence-derived output is marked with `untrustedContentHint`;
- final submission is absent from the capability surface;
- the same WebMCP tool factory accepts workflow-specific evidence and trust rules.

## 2. Execution

Primary live demo:

`https://webclerk.vercel.app/demo`

Suggested prompt sequence:

1. `Fill everything you can verify from my documents. Don't guess anything.`
2. approve the requested write;
3. `Why didn't you fill mode of study?`
4. `Check everything before I submit.`
5. `Complete the declaration for me.`

Expected behavior:

- six current evidence-backed fields are filled;
- uncertain fields stay unresolved;
- the income conflict and stale certificate remain visible;
- agent edits are visibly attributed and reversible;
- preflight blocks readiness;
- the declaration is rejected as a human-only action;
- there is no WebMCP submission tool.

## 3. Potential impact

The product problem is consequential form preparation where plausible inference can be harmful. webclerk optimizes for justified completion rather than maximum completion.

The trust model separates:

- evidence-backed facts;
- confirmation-only facts;
- stale evidence;
- contradictory evidence;
- human-only commitments.

The intended pattern applies to workflows such as financial aid, claims, visas, public benefits, compliance, healthcare intake, and procurement.

## 4. Creativity and ambition

The important abstraction is not scholarship autofill. It is a website publishing both **capabilities and delegated authority** to an agent.

To prove that this is not hard-coded to scholarship logic, inspect:

- `webmcp/workflows/insurance.ts`
- `webmcp/workflows/insurance.test.ts`
- `webmcp/workflows/insurance.webmcp.test.ts`

The motor-insurance fixture uses the same deterministic trust engine and the same WebMCP semantic tool factory with a different field set, evidence set, conflicts, and human-only legal decisions.

## 5. Adversarial verification

Inspect:

- `webmcp/evals.test.ts`
- `docs/EVALS.md`

The suite verifies that syntactically valid but unsafe requests are refused before state mutation, including fabricated values, stale evidence, self-declared facts, truthfulness attestations, and nonexistent submission capability.

## Core design invariant

```text
human intent
    ↓
agent selects semantic WebMCP capability
    ↓
site-owned deterministic trust policy
    ├─ authorized → reversible mutation in shared UI state
    └─ unsupported / stale / conflicting / human-only → structured refusal
```

The website, not the language model, defines what counts as sufficient evidence and which decisions remain human authority.
