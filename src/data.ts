export type FieldStatus = "verified" | "needs_confirmation" | "blocked" | "empty";

export type FieldType = "text" | "date" | "number" | "select";

export interface ApplicationField {
  id: string;
  section: "personal" | "education" | "financial" | "eligibility";
  label: string;
  hint?: string;
  required: boolean;
  type: FieldType;
  value: string;
  status: FieldStatus;
  source?: string;
  issue?: string;
  options?: string[];
}

export interface EvidenceDocument {
  id: string;
  name: string;
  kind: string;
  reference: string;
  status: "accepted" | "warning";
  note: string;
  issuedAt?: string;
  maxAgeMonths?: number;
}

export const scholarship = {
  name: "Future Scholars Grant 2026",
  applicationId: "FSG26-DEMO-10482",
  closingDate: "15 September 2026",
  department: "National Student Support Directorate (Fictional Demo)",
};

// Seed values represent the state of the fictional application before webclerk
// derives trust state from evidence. `status`, `source`, and `issue` are initial
// display fallbacks only; Milestone 2 recomputes them through the domain engine.
export const initialFields: ApplicationField[] = [
  { id: "full_name", section: "personal", label: "Full name", hint: "As printed on the identity document", required: true, type: "text", value: "Ayan Khan", status: "empty" },
  { id: "dob", section: "personal", label: "Date of birth", required: true, type: "date", value: "2006-04-12", status: "empty" },
  { id: "gender", section: "personal", label: "Gender", required: true, type: "select", value: "Male", status: "empty", options: ["Male", "Female", "Other", "Prefer not to say"] },
  { id: "mobile", section: "personal", label: "Mobile number", required: true, type: "text", value: "9876543210", status: "empty" },
  { id: "email", section: "personal", label: "Email address", required: true, type: "text", value: "ayan@example.in", status: "empty" },
  { id: "address", section: "personal", label: "Current correspondence address", required: true, type: "text", value: "North Humayunpur, Gorakhpur, Uttar Pradesh", status: "empty" },

  { id: "institution", section: "education", label: "Institution / University", required: true, type: "text", value: "Deen Dayal Upadhyaya Gorakhpur University", status: "empty" },
  { id: "programme", section: "education", label: "Programme of study", required: true, type: "text", value: "Bachelor of Computer Applications", status: "empty" },
  { id: "year", section: "education", label: "Current year of study", required: true, type: "select", value: "Second year", status: "empty", options: ["First year", "Second year", "Third year", "Fourth year"] },
  { id: "enrollment", section: "education", label: "Enrollment number", required: true, type: "text", value: "FSG-DEMO-220184", status: "empty" },
  { id: "previous_score", section: "education", label: "Previous academic year percentage", hint: "Enter percentage, not CGPA", required: true, type: "number", value: "80", status: "empty" },
  { id: "mode", section: "education", label: "Mode of study", required: true, type: "select", value: "Regular", status: "empty", options: ["Regular", "Distance", "Online"] },

  { id: "family_income", section: "financial", label: "Annual family income (gross)", hint: "Total gross household income for the previous financial year, in INR", required: true, type: "number", value: "350000", status: "empty" },
  { id: "dependents", section: "financial", label: "Number of dependent family members", required: true, type: "number", value: "3", status: "empty" },
  { id: "earning_member", section: "financial", label: "Primary earning member", required: true, type: "text", value: "Parent / Guardian", status: "empty" },
  { id: "bank_account", section: "financial", label: "Bank account ending", hint: "Last four digits only for this demo", required: true, type: "text", value: "4821", status: "empty" },
  { id: "income_cert_no", section: "financial", label: "Income certificate number", required: true, type: "text", value: "UP-INC-2025-88412", status: "empty" },

  { id: "domicile_state", section: "eligibility", label: "State of domicile", hint: "State in which you hold official domicile status", required: true, type: "select", value: "Uttar Pradesh", status: "empty", options: ["Uttar Pradesh", "Bihar", "Delhi", "Madhya Pradesh", "Rajasthan", "Other"] },
  { id: "domicile_cert", section: "eligibility", label: "Domicile certificate number", required: true, type: "text", value: "UP-DOM-2026-41027", status: "empty" },
  { id: "category", section: "eligibility", label: "Applicant category", required: true, type: "select", value: "General", status: "empty", options: ["General", "OBC-NCL", "SC", "ST", "EWS"] },
  { id: "existing_scholarship", section: "eligibility", label: "Receiving another scholarship?", required: true, type: "select", value: "No", status: "empty", options: ["Yes", "No"] },
  { id: "disability", section: "eligibility", label: "Person with benchmark disability?", required: false, type: "select", value: "No", status: "empty", options: ["Yes", "No"] },
  { id: "declaration", section: "eligibility", label: "I confirm that the information is true to the best of my knowledge", required: true, type: "select", value: "", status: "empty", options: ["I confirm"] },
];

export const evidenceDocuments: EvidenceDocument[] = [
  { id: "identity", name: "Identity_Card.pdf", kind: "Identity proof", reference: "ID •••• 4182", status: "accepted", note: "Name and date of birth available." },
  { id: "enrollment", name: "Enrollment_Certificate.pdf", kind: "Education proof", reference: "Issued 05 Aug 2026", status: "accepted", note: "Institution, programme, year and enrollment number available.", issuedAt: "2026-08-05" },
  { id: "marksheet", name: "Previous_Year_Marksheet.pdf", kind: "Academic proof", reference: "Academic year 2025–26", status: "accepted", note: "Previous-year percentage available." },
  { id: "income", name: "Income_Certificate.pdf", kind: "Financial proof", reference: "Issued 10 Jun 2025", status: "warning", note: "Older than 12 months and states ₹320,000, conflicting with the form.", issuedAt: "2025-06-10", maxAgeMonths: 12 },
  { id: "domicile", name: "Domicile_Certificate.pdf", kind: "Residence proof", reference: "Issued 18 Feb 2026", status: "accepted", note: "Uttar Pradesh domicile and certificate number available.", issuedAt: "2026-02-18" },
];

export const sectionLabels: Record<ApplicationField["section"], string> = {
  personal: "Personal Details",
  education: "Academic Details",
  financial: "Family & Income Details",
  eligibility: "Eligibility & Declaration",
};
