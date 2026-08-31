import { useEffect, useMemo, useRef, useState } from "react";
import {
  ApplicationField,
  evidenceDocuments,
  initialFields,
  scholarship,
  sectionLabels,
} from "./data";
import {
  ChangeRecord,
  deriveFields,
  makeChangeRecord,
  runPreflight,
} from "./domain";
import {
  registerWebMcpTools,
  WEBMCP_TOOL_NAMES,
  type WebMcpAvailability,
} from "./webmcp";

const sectionOrder: ApplicationField["section"][] = ["personal", "education", "financial", "eligibility"];

function statusLabel(status: ApplicationField["status"]) {
  if (status === "verified") return "Verified";
  if (status === "needs_confirmation") return "Needs confirmation";
  if (status === "blocked") return "Blocked";
  return "Not completed";
}

function FieldControl({ field, onChange }: { field: ApplicationField; onChange: (id: string, value: string) => void }) {
  const commonProps = {
    id: field.id,
    value: field.value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field.id, event.target.value),
    "aria-describedby": `${field.id}-help ${field.id}-status`,
  };

  return (
    <div className={`form-field state-${field.status}`}>
      <div className="field-heading">
        <label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="required" aria-label="required"> *</span>}
        </label>
        <span id={`${field.id}-status`} className={`status-badge status-${field.status}`}>
          {statusLabel(field.status)}
        </span>
      </div>

      {field.type === "select" ? (
        <select {...commonProps}>
          <option value="">Select</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input {...commonProps} type={field.type === "number" ? "number" : field.type} />
      )}

      <div id={`${field.id}-help`} className="field-help">
        {field.hint && <span>{field.hint}</span>}
        {field.source && <span className="source-line">Source: {field.source}</span>}
        {field.issue && <span className="issue-line">{field.issue}</span>}
      </div>
    </div>
  );
}

function webMcpStatusCopy(status: WebMcpAvailability) {
  if (status === "available") return "Agent tools active";
  if (status === "registering") return "Registering agent tools…";
  if (status === "error") return "Tool registration failed";
  return "WebMCP unavailable in this browser";
}

function App() {
  const [rawFields, setRawFields] = useState<ApplicationField[]>(initialFields);
  const [activeSection, setActiveSection] = useState<ApplicationField["section"]>("personal");
  const [showNotice, setShowNotice] = useState(true);
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [showPreflight, setShowPreflight] = useState(false);
  const [webMcpStatus, setWebMcpStatus] = useState<WebMcpAvailability>("registering");
  const [registeredToolCount, setRegisteredToolCount] = useState(0);

  const rawFieldsRef = useRef(rawFields);
  const changeSequenceRef = useRef(1);
  rawFieldsRef.current = rawFields;

  const fields = useMemo(() => deriveFields(rawFields, evidenceDocuments), [rawFields]);
  const preflight = useMemo(() => runPreflight(rawFields, evidenceDocuments), [rawFields]);

  useEffect(() => {
    const controller = new AbortController();

    registerWebMcpTools({
      getFields: () => deriveFields(rawFieldsRef.current, evidenceDocuments),
      setFieldFromAgent: (fieldId, value) => {
        const current = rawFieldsRef.current;
        const previous = current.find((field) => field.id === fieldId);
        if (!previous) {
          return { ok: false, message: `No application field exists with id ${fieldId}.` };
        }

        if (previous.value === value) {
          const field = deriveFields(current, evidenceDocuments).find((item) => item.id === fieldId);
          return { ok: true, field, message: "The field already contains that value; no change was needed." };
        }

        const next = current.map((field) => field.id === fieldId ? { ...field, value } : field);
        const change = makeChangeRecord(fieldId, previous.value, value, "agent", changeSequenceRef.current++);
        rawFieldsRef.current = next;
        setRawFields(next);
        setHistory((records) => [...records, change]);
        setShowPreflight(false);
        const derived = deriveFields(next, evidenceDocuments).find((field) => field.id === fieldId);

        return {
          ok: true,
          field: derived,
          change,
          message: derived?.status === "verified"
            ? "Value applied and verified against acceptable evidence."
            : derived?.status === "blocked"
              ? "Value applied, but domain rules marked the field blocked. The conflict remains visible for human review."
              : "Value applied, but it still requires applicant confirmation. The agent did not promote it to verified.",
        };
      },
      onPreflightRun: () => setShowPreflight(true),
    }, controller.signal).then((registration) => {
      if (controller.signal.aborted) return;
      setWebMcpStatus(registration.status);
      setRegisteredToolCount(registration.registered);
    });

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => fields.reduce(
    (acc, field) => {
      acc[field.status] += 1;
      return acc;
    },
    { verified: 0, needs_confirmation: 0, blocked: 0, empty: 0 },
  ), [fields]);

  const completed = fields.filter((field) => field.value.trim() !== "").length;
  const completion = Math.round((completed / fields.length) * 100);

  function updateField(id: string, value: string) {
    setRawFields((current) => {
      const previous = current.find((field) => field.id === id);
      if (!previous || previous.value === value) return current;
      const next = current.map((field) => field.id === id ? { ...field, value } : field);
      rawFieldsRef.current = next;
      setHistory((records) => [
        ...records,
        makeChangeRecord(id, previous.value, value, "human", changeSequenceRef.current++),
      ]);
      return next;
    });
    setShowPreflight(false);
  }

  function undoLastChange() {
    const last = history.at(-1);
    if (!last) return;
    setRawFields((current) => {
      const next = current.map((field) => field.id === last.fieldId ? { ...field, value: last.previousValue } : field);
      rawFieldsRef.current = next;
      return next;
    });
    setHistory((records) => records.slice(0, -1));
    setShowPreflight(false);
  }

  function resetDemo() {
    rawFieldsRef.current = initialFields;
    changeSequenceRef.current = 1;
    setRawFields(initialFields);
    setActiveSection("personal");
    setShowNotice(true);
    setHistory([]);
    setShowPreflight(false);
  }

  const visibleFields = fields.filter((field) => field.section === activeSection);

  return (
    <div className="site-shell">
      <div className="tricolour" aria-hidden="true"><span className="saffron" /><span className="white" /><span className="green" /></div>

      <header className="gov-header">
        <div className="utility-bar">
          <div>भारत सरकार शैली का काल्पनिक डेमो · Fictional Government-style Demo</div>
          <div className="utility-links"><a href="#main-content">Skip to main content</a><span>A-</span><span>A</span><span>A+</span><span>English</span></div>
        </div>
        <div className="brand-row">
          <div className="seal" aria-hidden="true">भारत</div>
          <div className="brand-copy">
            <p className="hindi-title">राष्ट्रीय छात्र सहायता सेवा पोर्टल</p>
            <h1>National Student Support Services Portal</h1>
            <p>Scholarship Application Services · Prototype Environment</p>
          </div>
          <div className="demo-stamp">DEMO<br /><strong>NOT OFFICIAL</strong></div>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#">Home</a><a href="#">Schemes</a><a className="active" href="#main-content">My Application</a><a href="#">Track Status</a><a href="#">Help</a>
        </nav>
      </header>

      <main id="main-content" className="page-wrap">
        <div className="breadcrumb" aria-label="Breadcrumb">Home <span>›</span> Scholarships <span>›</span> Application <span>›</span> {scholarship.name}</div>

        {showNotice && (
          <section className="prototype-notice" role="status">
            <div><strong>Prototype notice:</strong> This is a fictional scholarship portal built for the OpenAI WebMCP Challenge. It is not affiliated with any ministry, department, scholarship scheme, or government service.</div>
            <button type="button" onClick={() => setShowNotice(false)} aria-label="Dismiss prototype notice">×</button>
          </section>
        )}

        <section className="application-heading">
          <div><span className="eyebrow">Application ID: {scholarship.applicationId}</span><h2>{scholarship.name}</h2><p>{scholarship.department}</p></div>
          <div className="deadline-card"><span>Last date</span><strong>{scholarship.closingDate}</strong></div>
        </section>

        <section className="progress-card" aria-label="Application status">
          <div className="progress-copy">
            <div><span>Application completion</span><strong>{completion}%</strong></div>
            <div className="progress-track" aria-hidden="true"><span style={{ width: `${completion}%` }} /></div>
          </div>
          <div className="status-summary">
            <div><strong>{counts.verified}</strong><span>Verified</span></div>
            <div><strong>{counts.needs_confirmation}</strong><span>Review</span></div>
            <div><strong>{counts.blocked}</strong><span>Blocked</span></div>
            <div><strong>{counts.empty}</strong><span>Incomplete</span></div>
          </div>
        </section>

        {showPreflight && (
          <section className="preflight-card" aria-live="polite">
            <div className="preflight-heading">
              <div><span className="step-kicker">Deterministic preflight</span><h3>{preflight.ready ? "Application ready for final review" : "Application needs attention"}</h3></div>
              <div className="preflight-counts"><strong>{preflight.critical.length}</strong> critical · <strong>{preflight.warnings.length}</strong> warnings</div>
            </div>
            {preflight.critical.length === 0 && preflight.warnings.length === 0 ? (
              <p>No unresolved evidence conflicts, missing required fields, or confirmation items were found.</p>
            ) : (
              <div className="preflight-issues">
                {[...preflight.critical, ...preflight.warnings].map((issue) => (
                  <button key={issue.id} className={`preflight-issue ${issue.severity}`} type="button" onClick={() => {
                    if (!issue.fieldId) return;
                    const field = fields.find((item) => item.id === issue.fieldId);
                    if (field) setActiveSection(field.section);
                  }}>
                    <strong>{issue.title}</strong><span>{issue.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="workspace-grid">
          <section className="form-card" aria-labelledby="application-form-title">
            <div className="card-heading">
              <div><span className="step-kicker">Application form</span><h3 id="application-form-title">Applicant Details</h3></div>
              <div className="header-actions">
                <button type="button" className="secondary-button" onClick={undoLastChange} disabled={history.length === 0}>Undo last edit</button>
                <button type="button" className="secondary-button" onClick={resetDemo}>Reset demo</button>
              </div>
            </div>

            <div className="form-instructions">Fields marked with <strong>*</strong> are mandatory. Statuses are derived from deterministic evidence rules. WebMCP agents use those same rules rather than bypassing the form.</div>

            <div className="section-tabs" role="tablist" aria-label="Application sections">
              {sectionOrder.map((section, index) => {
                const sectionFields = fields.filter((field) => field.section === section);
                const hasBlock = sectionFields.some((field) => field.status === "blocked");
                return (
                  <button key={section} role="tab" aria-selected={activeSection === section} className={activeSection === section ? "active" : ""} onClick={() => setActiveSection(section)} type="button">
                    <span className="tab-number">{index + 1}</span><span>{sectionLabels[section]}</span>{hasBlock && <span className="tab-alert" aria-label="contains blocked field">!</span>}
                  </button>
                );
              })}
            </div>

            <div className="fields-grid">{visibleFields.map((field) => <FieldControl key={field.id} field={field} onChange={updateField} />)}</div>

            <div className="form-actions">
              <button type="button" className="secondary-button" disabled={sectionOrder.indexOf(activeSection) === 0} onClick={() => setActiveSection(sectionOrder[Math.max(0, sectionOrder.indexOf(activeSection) - 1)])}>Previous</button>
              <div className="action-right">
                <button type="button" className="secondary-button" onClick={() => setShowPreflight(true)}>Run preflight</button>
                <button type="button" className="secondary-button">Save as draft</button>
                <button type="button" className="primary-button" disabled={sectionOrder.indexOf(activeSection) === sectionOrder.length - 1} onClick={() => setActiveSection(sectionOrder[Math.min(sectionOrder.length - 1, sectionOrder.indexOf(activeSection) + 1)])}>Save & continue</button>
              </div>
            </div>
          </section>

          <aside className="evidence-panel" aria-labelledby="evidence-title">
            <div className="panel-heading"><div><span className="step-kicker">Supporting records</span><h3 id="evidence-title">Uploaded Documents</h3></div><span className="document-count">{evidenceDocuments.length}</span></div>

            <div className={`webmcp-card ${webMcpStatus}`} aria-live="polite">
              <div className="webmcp-status-row">
                <span className="webmcp-dot" aria-hidden="true" />
                <div><strong>WebMCP</strong><span>{webMcpStatusCopy(webMcpStatus)}</span></div>
              </div>
              <p>{webMcpStatus === "available" ? `${registeredToolCount} semantic tools are exposed to the browser agent. Agent edits appear in the same form and change history.` : "The human application remains fully functional even when the experimental browser API is absent."}</p>
              {webMcpStatus === "available" && <small>{WEBMCP_TOOL_NAMES.join(" · ")}</small>}
            </div>

            <p className="panel-intro">These records are active evidence: field status, conflicts and validity are derived from them by the same domain engine used by WebMCP.</p>
            <div className="document-list">
              {evidenceDocuments.map((document) => (
                <article key={document.id} className={`document-card ${document.status}`}>
                  <div className="document-icon" aria-hidden="true">PDF</div>
                  <div className="document-copy"><strong>{document.name}</strong><span>{document.kind}</span><small>{document.reference}</small><p>{document.note}</p></div>
                  <span className={`document-state ${document.status}`}>{document.status === "accepted" ? "Ready" : "Attention"}</span>
                </article>
              ))}
            </div>
            <div className="legend-card"><h4>Field status</h4><ul><li><span className="legend-dot verified" />Verified from evidence</li><li><span className="legend-dot confirmation" />Needs applicant confirmation</li><li><span className="legend-dot blocked" />Conflict or invalid evidence</li></ul></div>
            <div className="history-card">
              <h4>Change history</h4>
              {history.length === 0 ? <p>No edits in this session.</p> : history.slice(-5).reverse().map((record) => {
                const field = fields.find((item) => item.id === record.fieldId);
                return <div key={record.id} className={record.origin === "agent" ? "agent-change" : ""}><strong>{field?.label ?? record.fieldId}</strong><span>{record.origin} · {record.previousValue || "blank"} → {record.nextValue || "blank"}</span></div>;
              })}
            </div>
          </aside>
        </div>
      </main>

      <footer className="gov-footer"><div><strong>webclerk prototype</strong><span>Built for the OpenAI WebMCP Challenge · Fictional interface only</span></div><div><span>Accessibility</span><span>Privacy</span><span>Terms</span><span>Help</span></div></footer>
    </div>
  );
}

export default App;
