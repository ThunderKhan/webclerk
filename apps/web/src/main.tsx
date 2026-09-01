import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import InsuranceProof from "./InsuranceProof";
import LandingPage from "./LandingPage";
import "./styles.css";
import "./domain.css";
import "./trust.css";
import "./demo-polish.css";
import "./insurance-proof.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isDemo = path === "/demo";
const isInsuranceProof = path === "/proof/insurance";

function DemoRoute() {
  return (
    <>
      <div className="project-links" aria-label="Project links">
        <a className="github-link" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer" aria-label="Open webclerk on GitHub">GitHub ↗</a>
        <a className="github-star-link" href="https://github.com/ThunderKhan/webclerk" target="_blank" rel="noreferrer" aria-label="Star webclerk on GitHub">☆ Star</a>
      </div>
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isDemo ? <DemoRoute /> : isInsuranceProof ? <InsuranceProof /> : <LandingPage />}
  </React.StrictMode>,
);
