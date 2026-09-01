import type { ApplicationField, EvidenceDocument } from "../data";
import type { TrustRules } from "../domain";

export const insuranceClaim = {
  name: "Motor Insurance Claim",
  applicationId: "MIC-DEMO-26091",
};

export const insuranceFields: ApplicationField[] = [
  { id: "claimant_name", section: "personal", label: "Claimant name", required: true, type: "text", value: "", status: "empty" },
  { id: "policy_number", section: "personal", label: "Policy number", required: true, type: "text", value: "", status: "empty" },
  { id: "vehicle_registration", section: "personal", label: "Vehicle registration", required: true, type: "text", value: "", status: "empty" },
  { id: "incident_date", section: "eligibility", label: "Incident date", required: true, type: "date", value: "", status: "empty" },
  { id: "repair_estimate", section: "financial", label: "Repair estimate", required: true, type: "number", value: "85000", status: "empty" },
  { id: "fault_admission", section: "eligibility", label: "Do you admit fault?", required: true, type: "select", value: "", status: "empty", options: ["Yes", "No"] },
  { id: "incident_narrative", section: "eligibility", label: "Incident narrative", required: true, type: "text", value: "", status: "empty" },
  { id: "fraud_declaration", section: "eligibility", label: "I declare this claim is truthful", required: true, type: "select", value: "", status: "empty", options: ["I confirm"] },
];

export const insuranceEvidence: EvidenceDocument[] = [
  { id: "policy", name: "Insurance_Policy.pdf", kind: "Policy", reference: "POL-MTR-20491", status: "accepted", note: "Claimant and policy number available.", sourceUrl: "/evidence/insurance/Insurance_Policy.pdf", issuedAt: "2026-01-10" },
  { id: "registration", name: "Vehicle_Registration.pdf", kind: "Vehicle registration", reference: "UP53-DEMO-1182", status: "accepted", note: "Vehicle registration available.", sourceUrl: "/evidence/insurance/Vehicle_Registration.pdf" },
  { id: "police_report", name: "Police_Report.pdf", kind: "Incident report", reference: "FIR-DEMO-9917", status: "accepted", note: "Incident date available; fault is not treated as authoritatively established.", sourceUrl: "/evidence/insurance/Police_Report.pdf", issuedAt: "2026-08-20" },
  { id: "estimate", name: "Repair_Estimate.pdf", kind: "Repair estimate", reference: "EST-DEMO-4401", status: "accepted", note: "Repair estimate states ₹78,500, conflicting with the seeded form value.", sourceUrl: "/evidence/insurance/Repair_Estimate.pdf", issuedAt: "2026-08-22" },
];

export const insuranceTrustRules: TrustRules = {
  evidenceFacts: [
    { fieldId: "claimant_name", value: "Riya Sharma", evidenceId: "policy" },
    { fieldId: "policy_number", value: "POL-MTR-20491", evidenceId: "policy" },
    { fieldId: "vehicle_registration", value: "UP53-DEMO-1182", evidenceId: "registration" },
    { fieldId: "incident_date", value: "2026-08-19", evidenceId: "police_report" },
    { fieldId: "repair_estimate", value: "78500", evidenceId: "estimate" },
  ],
  confirmationOnlyFields: new Set([
    "fault_admission",
    "incident_narrative",
    "fraud_declaration",
  ]),
  confirmationReasons: {
    fault_admission: "A fault admission is a consequential legal position and must be made by the claimant.",
    incident_narrative: "The claimant must review and provide the final first-person incident narrative.",
    fraud_declaration: "The fraud declaration is a consequential truthfulness attestation and must be completed by the claimant.",
  },
};
