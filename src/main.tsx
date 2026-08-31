import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { enableEvidenceDocumentLinks } from "./evidence-links";
import "./styles.css";
import "./domain.css";
import "./trust.css";
import "./demo-polish.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

enableEvidenceDocumentLinks();