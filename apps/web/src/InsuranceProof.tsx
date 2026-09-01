import { useEffect, useMemo, useRef, useState } from "react";
import type { ApplicationField } from "../../../webmcp/data";
import { deriveFields, runPreflight } from "../../../webmcp/domain";
import {
  registerWebMcpTools,
  type WebMcpAvailability,
  type WebMcpWorkflowContext,
} from "../../../webmcp/webmcp";
import {
  insuranceClaim,
  insuranceEvidence,
  insuranceFields,
  insuranceTrustRules,
} from "../../../webmcp/workflows/insurance";

const insuranceContext: WebMcpWorkflowContext = {
  application: {
    id: insuranceClaim.applicationId,
    title: insuranceClaim.name,
  },
  evidenceDocuments: insuranceEvidence,
  trustRules: insuranceTrustRules,
  humanOnlyFieldIds: ["fraud_declaration"],
  evidenceAccess: "Four fictional insurance records are attached to this proof workspace as structured evidence.",
};

function statusLabel(status: ApplicationField["status"]) {
  if (status === "verified") return "Verified";
  if (status === "blocked") return "Blocked";
  if (status === "needs_confirmation") return "Human confirmation";
  return "Incomplete";
}

function agentStatus(status: WebMcpAvailability) {
  if (status === "available") return "WebMCP tools active";
  if (status === "registering") return "Registering WebMCP tools…";
  if (status === "error") return "WebMCP registration failed";
  return "WebMCP unavailable in this browser";
}

export default function InsuranceProof() {
  const [rawFields, setRawFields] = useState(() => insuranceFields.map((field) => ({ ...field })));
  const [webMcpStatus, setWebMcpStatus] = useState<WebMcpAvailability>("registering");
  const rawRef = useRef(rawFields);
  rawRef.current = rawFields;

  const fields = useMemo(
    () => deriveFields(rawFields, insuranceEvidence, new Date(), insuranceTrustRules),
    [rawFields],
  );
  const preflight = useMemo(
    () => runPreflight(rawFields, insuranceEvidence, new Date(), insuranceTrustRules),
    [rawFields],
  );

  useEffect(() => {
    const controller = new AbortController();
    registerWebMcpTools({
      getFields: () => deriveFields(rawRef.current, insuranceEvidence, new Date(), insuranceTrustRules),
      setFieldFromAgent: (fieldId, value) => {
        const current = rawRef.current;
        const previous = current.find((field) => field.id === fieldId);
        if (!previous) return { ok: false, message: `Unknown insurance field: ${fieldId}` };
        if (previous.value === value) {
          return {
            ok: true,
            field: deriveFields(current, insuranceEvidence, new Date(), insuranceTrustRules)
              .find((field) => field.id === fieldId),
            message: "The field already contains that value.",
          };
        }

        const next = current.map((field) => field.id === fieldId ? { ...field, value } : field);
        rawRef.current = next;
        setRawFields(next);
        return {
          ok: true,
          field: deriveFields(next, insuranceEvidence, new Date(), insuranceTrustRules)
            .find((field) => field.id === fieldId),
          message: "Evidence-backed insurance field updated through WebMCP.",
        };
      },
    }, controller.signal, insuranceContext).then((registration) => {
      if (!controller.signal.aborted) setWebMcpStatus(registration.status);
    });

    return () => controller.abort();
  }, []);

  const counts = fields.reduce(
    (result, field) => {
      result[field.status] += 1;
      return result;
    },
    { verified: 0, needs_confirmation: 0, blocked: 0, empty: 0 },
  );

  function updateField(id: string, value: string) {
    setRawFields((current) => {
      const next = current.map((field) => field.id === id ? { ...field, value } : field);
      rawRef.current = next;
      return next;
    });
  }

  function reset() {
    const next = insuranceFields.map((field) => ({ ...field }));
    rawRef.current = next;
    setRawFields(next);
  }

  return (
    <main className="insurance-proof-shell">
      <header className="insurance-proof-header">
        <div>
          <a href="/" className="proof-back-link">← webclerk</a>
          <span className="proof-kicker">Generalization proof · same trust engine, different domain</span>
          <h1>Motor Insurance Claim</h1>
          <p>
            This secondary workspace proves that webclerk's deterministic trust model and the same nine semantic
            WebMCP tools are not hard-coded to the scholarship demo.
          </p>
        </div>
        <div className={`proof-agent-status proof-agent-${webMcpStatus}`}>
          <strong>{agentStatus(webMcpStatus)}</strong>
          <span>Claim {insuranceClaim.applicationId}</span>
        </div>
      </header>

      <section className="proof-callout">
        <strong>Try with a WebMCP-capable agent:</strong>
        <code>Fill everything you can verify from the claim evidence. Don't guess anything.</code>
        <p>
          Expected: claimant, policy, vehicle and incident date are filled. The ₹85,000 vs ₹78,500 repair conflict,
          fault admission, first-person narrative and fraud declaration remain under human review.
        </p>
      </section>

      <section className="proof-metrics" aria-label="Insurance trust status">
        <div><strong>{counts.verified}</strong><span>Verified</span></div>
        <div><strong>{counts.needs_confirmation}</strong><span>Human confirmation</span></div>
        <div><strong>{counts.blocked}</strong><span>Blocked</span></div>
        <div><strong>{counts.empty}</strong><span>Incomplete</span></div>
        <div><strong>{preflight.critical.length}</strong><span>Critical preflight</span></div>
      </section>

      <div className="proof-grid">
        <section className="proof-panel">
          <div className="proof-panel-heading">
            <div>
              <span className="proof-kicker">Shared browser state</span>
              <h2>Claim fields</h2>
            </div>
            <button type="button" onClick={reset}>Reset proof</button>
          </div>

          <div className="proof-fields">
            {fields.map((field) => {
              const humanOnly = insuranceContext.humanOnlyFieldIds.includes(field.id)
                || insuranceTrustRules.confirmationOnlyFields.has(field.id);
              return (
                <label key={field.id} className={`proof-field proof-field-${field.status}`}>
                  <span className="proof-field-title">
                    <strong>{field.label}</strong>
                    <em>{statusLabel(field.status)}</em>
                  </span>
                  {field.type === "select" ? (
                    <select value={field.value} onChange={(event) => updateField(field.id, event.target.value)}>
                      <option value="">Select</option>
                      {field.options?.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type}
                      value={field.value}
                      onChange={(event) => updateField(field.id, event.target.value)}
                    />
                  )}
                  {field.source && <small>Evidence: {field.source}</small>}
                  {field.issue && <small className="proof-issue">{field.issue}</small>}
                  {humanOnly && <small className="proof-human-only">Human authority preserved</small>}
                </label>
              );
            })}
          </div>
        </section>

        <aside className="proof-sidebar">
          <section className="proof-panel">
            <span className="proof-kicker">Evidence</span>
            <h2>Claim records</h2>
            <div className="proof-evidence-list">
              {insuranceEvidence.map((document) => (
                <article key={document.id}>
                  <strong>{document.name}</strong>
                  <span>{document.kind}</span>
                  <p>{document.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="proof-panel">
            <span className="proof-kicker">Deterministic gate</span>
            <h2>Preflight</h2>
            <p>{preflight.ready ? "Ready for claimant review." : "Human review is still required."}</p>
            <ul className="proof-issues">
              {[...preflight.critical, ...preflight.warnings].map((issue) => (
                <li key={issue.id}><strong>{issue.title}</strong><span>{issue.detail}</span></li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <footer className="proof-footer">
        <strong>Same engine. Same WebMCP tool factory. Different consequential workflow.</strong>
        <a href="/demo">Open the primary scholarship demo →</a>
      </footer>
    </main>
  );
}
