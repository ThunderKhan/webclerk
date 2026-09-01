import "./landing.css";

const tools = [
  ["get_application_state", "read"],
  ["fill_verified_fields_from_evidence", "write"],
  ["inspect_field", "read"],
  ["check_consistency", "read"],
  ["run_preflight", "read"],
] as const;

function ClerkSpider() {
  return (
    <svg className="clerk-spider" viewBox="0 0 560 520" role="img" aria-label="Victorian spider clerk mascot holding a document and magnifying glass">
      <defs>
        <linearGradient id="coat" x1="0" x2="1"><stop stopColor="#7b2634"/><stop offset="1" stopColor="#3e1821"/></linearGradient>
        <linearGradient id="gold" x1="0" x2="1"><stop stopColor="#f1cf7b"/><stop offset="1" stopColor="#b78335"/></linearGradient>
      </defs>
      <g fill="none" stroke="#d8b56c" strokeWidth="8" strokeLinecap="round">
        <path d="M214 270C135 245 110 205 74 168M211 292C135 294 105 315 65 342M346 270C425 245 450 205 486 168M349 292C425 294 455 315 495 342"/>
        <path d="M205 250C145 205 125 158 115 118M355 250C415 205 435 158 445 118M210 310C150 350 120 395 105 435M350 310C410 350 440 395 455 435"/>
      </g>
      <ellipse cx="280" cy="310" rx="116" ry="120" fill="#201820" stroke="#e9d7ae" strokeWidth="7"/>
      <circle cx="280" cy="205" r="98" fill="#2a2028" stroke="#e9d7ae" strokeWidth="7"/>
      <path d="M195 125h170l-18-78H213z" fill="#161215" stroke="#e9d7ae" strokeWidth="7"/>
      <path d="M197 119h166" stroke="#b13a4b" strokeWidth="16"/>
      <ellipse cx="245" cy="197" rx="35" ry="42" fill="#f6efd9"/><ellipse cx="315" cy="197" rx="35" ry="42" fill="#f6efd9"/>
      <circle cx="250" cy="202" r="10" fill="#111"/><circle cx="310" cy="202" r="10" fill="#111"/>
      <circle cx="315" cy="197" r="46" fill="none" stroke="url(#gold)" strokeWidth="7"/><path d="M350 225l36 38" stroke="#d8b56c" strokeWidth="8" strokeLinecap="round"/>
      <path d="M248 250q32 22 64 0" stroke="#d8b56c" strokeWidth="6" strokeLinecap="round"/>
      <path d="M220 292l60 55 60-55 25 130H195z" fill="url(#coat)" stroke="#e9d7ae" strokeWidth="7"/>
      <path d="M280 347v72" stroke="#f1cf7b" strokeWidth="8"/><path d="M258 342l22 24 22-24" fill="#111" stroke="#f1cf7b" strokeWidth="5"/>
      <rect x="330" y="278" width="116" height="142" rx="8" fill="#efe0b7" stroke="#6f4f25" strokeWidth="6" transform="rotate(8 388 349)"/>
      <path d="M352 313h70M349 336h63M346 359h68M343 382h51" stroke="#6f4f25" strokeWidth="5" strokeLinecap="round" transform="rotate(8 388 349)"/>
      <circle cx="140" cy="345" r="48" fill="none" stroke="url(#gold)" strokeWidth="9"/><path d="M176 381l46 48" stroke="#d8b56c" strokeWidth="10" strokeLinecap="round"/>
      <rect x="214" y="437" width="132" height="48" rx="10" fill="#161215" stroke="#d8b56c" strokeWidth="5"/>
      <text x="280" y="468" textAnchor="middle" fill="#f4df9c" fontSize="22" fontFamily="Georgia, serif" fontWeight="700">WEBCLERK</text>
    </svg>
  );
}

function LandingPage() {
  return (
    <div id="top" className="landing-shell">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="webclerk home"><span className="brand-seal">✣</span><span>webclerk</span></a>
        <nav aria-label="Landing navigation"><a href="#why">Why</a><a href="#workflow">How it works</a><a href="#tools">Tools</a><a href="#trust">Trust</a></nav>
        <div className="nav-actions"><a className="ghost-btn" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">GitHub ↗</a><a className="primary-btn small" href="/demo">Open live demo ↗</a></div>
      </header>

      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="section-kicker">EVIDENCE &gt; CONFIDENCE</span>
            <h1>Never guess on consequential forms.</h1>
            <p>A WebMCP-powered trust layer that lets agents prepare applications from evidence, preserve uncertainty, surface conflicts, and leave consequential decisions to the human.</p>
            <div className="hero-actions"><a className="primary-btn" href="/demo">▶ Open the live demo</a><a className="ghost-btn" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">View on GitHub ↗</a></div>
            <div className="hero-proof"><span>✓ Evidence-backed</span><span>✓ Semantic WebMCP tools</span><span>✓ Human-first boundaries</span></div>
          </div>
          <div className="hero-art"><ClerkSpider/><p className="mascot-caption">A meticulous clerk for the web.<br/><strong>Files what is supported. Flags what is not.</strong></p></div>
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

        <section className="landing-section use-cases"><span className="section-kicker danger">BEYOND SCHOLARSHIPS</span><h2>A trust pattern for many domains.</h2><div className="pill-grid"><span>Visa applications</span><span>Insurance claims</span><span>Public benefits</span><span>Financial aid</span><span>Compliance</span><span>Vendor onboarding</span></div></section>
      </main>

      <footer className="landing-footer"><div className="footer-brand"><span className="brand-seal">✣</span><div><strong>webclerk</strong><span>Evidence. Integrity. Your signature.</span></div></div><blockquote>“A good clerk files what is true, not what is convenient.”</blockquote><div className="footer-links"><a href="/demo">Demo</a><a href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer">GitHub</a><a href="https://github.com/ThunderKhan/webclerk/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noreferrer">Architecture</a><a href="https://github.com/ThunderKhan/webclerk/blob/main/docs/WEBMCP.md" target="_blank" rel="noreferrer">WebMCP</a></div></footer>
    </div>
  );
}

export default LandingPage;
