export const AGENT_AUTHORITY = {
  inspectEvidence: true,
  inspectApplicationState: true,
  suggestVerifiedValues: true,
  mutateVerifiedFields: true,
  runPreflight: true,
  inferUnsupportedValues: false,
  resolveConflicts: false,
  confirmApplicantKnowledge: false,
  attestTruthfulness: false,
  submitApplication: false,
} as const;

export type AgentAuthority = typeof AGENT_AUTHORITY;
