export const getPageContentHTML = (title, content, controls = "") => `
${
  title
    ? `<div class="page-header">
        <h1>${title}</h1>
        <div class="page-header-actions">${controls}</div>
     </div>`
    : ""
}
<div class="page-body page-fade-in">
    ${content}
</div>
`;

export const showGlobalLoader = (label = "Loading...") => {
  try {
    if (typeof document === "undefined") return;
    let overlay = document.getElementById("global-loader-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "global-loader-overlay";
      overlay.className = "global-loader-overlay";
      overlay.innerHTML = `
        <div class="global-loader-blobs" aria-hidden="true">
          <div class="global-loader-blob blob-a"></div>
          <div class="global-loader-blob blob-b"></div>
        </div>
        <div class="global-loader-card" role="status" aria-live="polite">
          <div class="global-loader-orbit-shell">
            <div class="global-loader-orbit"></div>
            <div class="global-loader-core"></div>
          </div>
          <div class="global-loader-ring">
            <div class="global-loader-ring-fill"></div>
          </div>
          <div class="global-loader-text">
            <p class="global-loader-label"></p>
            <p class="global-loader-subtext">Fetching workspace data, timesheets & analytics...</p>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      // Allow CSS transition to apply
      requestAnimationFrame(() => {
        overlay.classList.add("is-visible");
      });
    } else {
      overlay.classList.add("is-visible");
    }
    const labelEl = overlay.querySelector(".global-loader-label");
    if (labelEl) {
      labelEl.textContent = label;
    }
  } catch {
    // UI helper only; fail silently
  }
};

export const hideGlobalLoader = () => {
  try {
    if (typeof document === "undefined") return;
    const overlay = document.getElementById("global-loader-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    const removeAfter = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
    // Match CSS transition duration (approx)
    setTimeout(removeAfter, 260);
  } catch {
    // UI helper only; fail silently
  }
};

try {
  if (typeof window !== "undefined") {
    if (!window.__vtabShowGlobalLoader) {
      window.__vtabShowGlobalLoader = showGlobalLoader;
    }
    if (!window.__vtabHideGlobalLoader) {
      window.__vtabHideGlobalLoader = hideGlobalLoader;
    }
  }
} catch {
  // Ignore binding errors in non-browser contexts
}

// export const getPageContentHTML = (title, content, controls = '') => `
//     <div class="page-header">
//         <h1>${title}</h1>
//         <div class="page-header-actions">${controls}</div>
//     </div>
//     <div class="page-body">
//         ${content}
//     </div>
// `;