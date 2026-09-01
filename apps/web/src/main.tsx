import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import "./styles.css";
import "./domain.css";
import "./trust.css";
import "./demo-polish.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isDemo = path === "/demo";

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
    {isDemo ? <DemoRoute /> : <LandingPage />}
  </React.StrictMode>,
);
