const EVIDENCE_BASE = "/evidence/";

function evidenceUrl(name: string) {
  return `${EVIDENCE_BASE}${encodeURIComponent(name)}`;
}

function openEvidence(name: string) {
  window.open(evidenceUrl(name), "_blank", "noopener,noreferrer");
}

function enhanceSourceLinks() {
  document.querySelectorAll<HTMLElement>(".source-line").forEach((source) => {
    if (source.dataset.evidenceLinked === "true") return;

    const match = source.textContent?.match(/^Source:\s*(.+\.pdf)$/i);
    if (!match) return;

    const filename = match[1].trim();
    source.dataset.evidenceLinked = "true";
    source.classList.add("source-document-link");
    source.setAttribute("role", "link");
    source.setAttribute("tabindex", "0");
    source.setAttribute("aria-label", `Open ${filename}`);
    source.textContent = `Source: ${filename} ↗`;
    source.addEventListener("click", () => openEvidence(filename));
    source.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEvidence(filename);
      }
    });
  });
}

function enhanceEvidenceCards() {
  const list = document.querySelector<HTMLElement>(".document-list");
  if (!list) return;

  const panelIntro = list.previousElementSibling;
  if (panelIntro?.classList.contains("panel-intro") && !document.querySelector(".evidence-demo-note")) {
    const note = document.createElement("p");
    note.className = "evidence-demo-note";
    note.textContent = "Demo evidence is pre-extracted for deterministic verification. Open the fictional PDFs below to inspect the underlying source records.";
    panelIntro.insertAdjacentElement("afterend", note);
  }

  list.querySelectorAll<HTMLElement>(".document-card").forEach((card) => {
    if (card.querySelector(".document-open-link")) return;

    const filename = card.querySelector(".document-copy strong")?.textContent?.trim();
    if (!filename?.toLowerCase().endsWith(".pdf")) return;

    const link = document.createElement("a");
    link.className = "document-open-link";
    link.href = evidenceUrl(filename);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open source PDF ↗";
    link.setAttribute("aria-label", `Open ${filename} in a new tab`);
    card.appendChild(link);
  });
}

function enhance() {
  enhanceSourceLinks();
  enhanceEvidenceCards();
}

export function enableEvidenceDocumentLinks() {
  enhance();

  const observer = new MutationObserver(() => enhance());
  observer.observe(document.getElementById("root") ?? document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
