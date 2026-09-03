import { useRef, type PointerEvent } from "react";
import "./landing.css";
import "./landing-overrides.css";

const tools = [
  ["get_application_state", "read"],
  ["fill_verified_fields_from_evidence", "write"],
  ["inspect_field", "read"],
  ["check_consistency", "read"],
  ["run_preflight", "read"],
] as const;

function DemoChevron() {
  return (
    <svg className="demo-picker-chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4 6.25 8 10l4-3.75" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DemoMenu() {
  return (
    <div className="demo-picker-menu">
      <a href="/demo"><strong>Scholarship application</strong><span>Primary WebMCP workflow · evidence-backed preparation</span></a>
      <a href="/proof/insurance"><strong>Insurance claim</strong><span>Second workflow · same trust engine and tool layer</span></a>
    </div>
  );
}

function LandingPage() {
  const pointerFrame = useRef<number | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shell = event.currentTarget;
    const x = event.clientX;
    const y = event.clientY;

    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      shell.style.setProperty("--pointer-x", `${x}px`);
      shell.style.setProperty("--pointer-y", `${y}px`);
      pointerFrame.current = null;
    });
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.currentTarget.style.setProperty("--pointer-glow-opacity", "1");
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--pointer-glow-opacity", "0");
  };

  return (
    <div
      id="top"
      className="landing-shell"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="webclerk home"><span className="brand-seal">✣</span><span>webclerk</span></a>
        <nav aria-label="Landing navigation"><a href="#why">Why</a><a href="#trust">Trust</a><a href="#workflow">How it works</a><a href="#tools">Tools</a></nav>
        <div className="nav-actions">
          <a className="ghost-btn" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">GitHub</a>
          <details className="demo-picker nav-demo-picker">
            <summary className="primary-btn small"><span>Open live demo</span><DemoChevron /></summary>
            <DemoMenu />
          </details>
        </div>
      </header>

      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="section-kicker">EVIDENCE &gt; CONFIDENCE</span>
            <h1>Never guess on consequential forms.</h1>
            <p>A WebMCP-powered trust layer that lets agents prepare applications from evidence, preserve uncertainty, surface conflicts, and leave consequential decisions to the human.</p>
            <div className="hero-actions">
              <details className="demo-picker">
                <summary className="primary-btn"><span>Explore live demos</span><DemoChevron /></summary>
                <DemoMenu />
              </details>
              <a className="ghost-btn" href="https://www.youtube.com/watch?v=o28JeFA0uCs" target="_blank" rel="noreferrer">Watch 3-min demo</a>
              <a className="ghost-btn" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">View on GitHub</a>
            </div>
            <div className="hero-proof"><span>✓ Evidence-backed</span><span>✓ Semantic WebMCP tools</span><span>✓ Human-first boundaries</span></div>
          </div>
          <aside className="hero-resource-panel" aria-label="Project resources">
            <div className="resource-eyebrow">PROJECT RESOURCES</div>
            <h2>Inspect the implementation.</h2>
            <p>webclerk exposes explicit semantic capabilities instead of relying on brittle DOM scraping or coordinate-based automation.</p>
            <div className="resource-actions">
              <a className="resource-btn" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer"><span>GitHub</span><small>Source, tests, architecture</small></a>
              <a className="resource-btn" href="https://github.com/ThunderKhan/webclerk/blob/main/docs/WEBMCP.md" target="_blank" rel="noreferrer"><span>Read WebMCP documentation</span><small>Tool contracts and trust boundaries</small></a>
            </div>
            <div className="resource-metrics" aria-label="WebMCP capability summary">
              <div><strong>9</strong><span>semantic tools</span></div>
              <div><strong>7 / 2</strong><span>read / write</span></div>
              <div><strong>0</strong><span>submit tools</span></div>
            </div>
            <div className="challenge-note">Built for the OpenAI WebMCP Challenge</div>
          </aside>
        </section>

        <section id="why" className="landing-section split problem-section">
          <div><span className="section-kicker danger">THE PROBLEM</span><h2>Autofill optimizes for completion.</h2><p>Consequential forms need justification. When evidence is stale, ambiguous, missing, or contradictory, a confident guess can create real harm.</p></div>
          <div className="paper-note"><strong>Plausible</strong><span>≠</span><strong>Supported</strong></div>
        </section>

        <section id="trust" className="landing-section">
          <span className="section-kicker">THE RULES</span>
          <div className="rule-grid">
            <article><span className="rule-icon good">✓</span><h3>Evidence, not confidence</h3><p>A value becomes verified only when current, acceptable evidence directly supports it.</p></article>
            <article><span className="rule-icon warn">!</span><h3>Uncertainty stays visible</h3><p>Missing, stale, ambiguous, and conflicting information is preserved instead of guessed.</p></article>
            <article><span className="rule-icon human">◉</span><h3>Human commits</h3><p>The agent prepares. Truthfulness attestations and final submission remain applicant actions.</p></article>
          </div>
        </section>

        <section id="workflow" className="landing-section workflow-section">
          <span className="section-kicker danger">THE WORKFLOW</span><h2>Inspect. Verify. Prepare. Review.</h2><p className="section-lead">A deterministic flow, not a black box.</p>
          <div className="workflow-grid">
            <article><span>1</span><h3>Read application state</h3><p>Understand what is already filled, blocked, missing, or awaiting confirmation.</p></article>
            <article><span>2</span><h3>Match evidence to fields</h3><p>Use explicit provenance and validity rules instead of model confidence.</p></article>
            <article><span>3</span><h3>Apply verified values</h3><p>Write only what current acceptable evidence can support.</p></article>
            <article><span>4</span><h3>Run deterministic preflight</h3><p>Surface stale documents, conflicts, and unresolved human decisions.</p></article>
          </div>
        </section>

        <section className="landing-section proof-section">
          <div><span className="section-kicker danger">LIVE DEMO PROOF</span><h2>See it in action.</h2><p>One shared application state. Real evidence rules. Visible provenance and reversible edits.</p></div>
          <div className="proof-cards"><div><span>Application completion</span><strong>70% → 96%</strong></div><div><span>Verified fields</span><strong>3 → 9</strong></div><div><span>Unsupported guesses</span><strong>0</strong></div><div><span>Consequential agent actions</span><strong>0</strong></div></div>
        </section>

        <section id="tools" className="landing-section tools-section">
          <div><span className="section-kicker danger">WHY WEBMCP</span><h2>Semantic tools, not brittle automation.</h2><p>The page exposes application meaning directly. Agents can reason over form state and evidence instead of scraping labels or guessing coordinates.</p></div>
          <div className="tool-terminal"><div className="terminal-head"><span/><span/><span/><em>webclerk site tools</em></div>{tools.map(([name, mode]) => <div className="tool-row" key={name}><code>{name}()</code><span className={mode}>{mode}</span></div>)}</div>
        </section>

        <section className="landing-section conflict-section">
          <div><span className="section-kicker danger">THE CONFLICT</span><h2>Sometimes the correct action is to stop.</h2><p>Surfacing a conflict is a feature, not a failure.</p></div>
          <div className="conflict-flow"><div><span>APPLICATION</span><strong>₹3,50,000</strong></div><b>≠</b><div><span>EVIDENCE</span><strong>₹3,20,000</strong></div><b>+</b><div><span>CERTIFICATE</span><strong>&gt; 12 months old</strong></div><b>=</b><div className="blocked"><span>RESULT</span><strong>BLOCKED</strong></div></div>
        </section>

        <section className="landing-section boundary-section">
          <div><span className="section-kicker danger">THE BOUNDARY</span><h2>The agent can prepare.<br/>The human commits.</h2></div>
          <div className="boundary-grid"><div><h3>Allowed</h3><p>✓ fill_verified_fields_from_evidence</p><p>✓ inspect / review / preflight</p><p>✓ reversible evidence-backed edits</p></div><div className="not-allowed"><h3>Not allowed</h3><p>✕ complete_truthfulness_declaration</p><p>✕ submit_application</p><small>The submit tool intentionally does not exist.</small></div></div>
        </section>

        <section className="landing-section use-cases"><span className="section-kicker danger">BEYOND SCHOLARSHIPS</span><h2>A trust pattern for many domains.</h2><div className="pill-grid"><span>Insurance claims</span><span>Visa applications</span><span>Public benefits</span><span>Financial aid</span><span>Compliance</span><span>Vendor onboarding</span></div></section>
      </main>

      <footer className="landing-footer"><div className="footer-brand"><span className="brand-seal">✣</span><div><strong>webclerk</strong><span>Evidence. Integrity. Your signature.</span></div></div><blockquote>“A good clerk files what is true, not what is convenient.”</blockquote><div className="footer-links"><a href="/demo">Demo</a><a href="/proof/insurance">Insurance proof</a><a href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">GitHub</a><a href="https://github.com/ThunderKhan/webclerk/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noreferrer">Architecture</a><a href="https://github.com/ThunderKhan/webclerk/blob/main/docs/WEBMCP.md" target="_blank" rel="noreferrer">WebMCP</a></div></footer>
    </div>
  );
}

export default LandingPage;