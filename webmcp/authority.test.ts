import { describe, expect, it } from "vitest";
import { AGENT_AUTHORITY } from "./authority";
import { WEBMCP_TOOL_NAMES } from "./webmcp";

describe("agent authority policy", () => {
  it("allows reversible evidence-backed preparation capabilities", () => {
    expect(AGENT_AUTHORITY).toMatchObject({
      inspectEvidence: true,
      inspectApplicationState: true,
      suggestVerifiedValues: true,
      mutateVerifiedFields: true,
      runPreflight: true,
    });
  });

  it("denies inference and consequential authority", () => {
    expect(AGENT_AUTHORITY).toMatchObject({
      inferUnsupportedValues: false,
      resolveConflicts: false,
      confirmApplicantKnowledge: false,
      attestTruthfulness: false,
      submitApplication: false,
    });
  });

  it("does not expose declaration or submission capabilities as WebMCP tools", () => {
    expect(WEBMCP_TOOL_NAMES).not.toContain("complete_declaration");
    expect(WEBMCP_TOOL_NAMES).not.toContain("submit_application");
  });
});
