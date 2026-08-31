# Agent evidence behavior

webclerk exposes the demo application's five supporting records directly through the `list_evidence` WebMCP tool.

When a user says "my documents", "uploaded documents", "supporting documents", or asks the agent to fill values from evidence, the agent should treat `list_evidence` as the authoritative source for this demo rather than searching for external ChatGPT workspace attachments.

The intended orchestration is:

1. Read the current application state.
2. Read the site's supporting evidence with `list_evidence`.
3. Use `suggest_field_value` for evidence-backed candidates.
4. Apply only supported values with `set_field_value`.
5. Leave ambiguous, stale, conflicting, or human-only values unresolved.

The final declaration remains human-only and returns `HUMAN_ACTION_REQUIRED` when an agent tries to complete it.
