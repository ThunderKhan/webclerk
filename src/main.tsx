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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isDemo ? <App /> : <LandingPage />}
  </React.StrictMode>,
);
