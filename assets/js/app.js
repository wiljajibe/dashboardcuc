import { APP_CONFIG } from "./config.js";
import { requireSession, signOut } from "./auth.js";
import { loadDashboardData } from "./data-source.js";
import { renderMatriculasDashboard } from "./dashboard-matriculas.js";
import { byId, escapeHtml } from "./utils.js";

function renderDashboardNavigation() {
  byId("dashboardNav").innerHTML = APP_CONFIG.dashboards
    .filter(dashboard => dashboard.enabled)
    .map(dashboard => `<a href="${escapeHtml(dashboard.href)}" ${dashboard.id === APP_CONFIG.dashboardId ? 'aria-current="page"' : ""} title="${escapeHtml(dashboard.description)}">${escapeHtml(dashboard.label)}</a>`)
    .join("");
}

function renderUser(sessionState) {
  if (!sessionState?.enabled || !sessionState.user) return;
  const container = byId("userArea");
  container.hidden = false;
  const email = escapeHtml(sessionState.user.email ?? "Usuario");
  container.innerHTML = `<span>${email}</span><button type="button" id="logoutButton">Salir</button>`;
  byId("logoutButton").addEventListener("click", signOut);
}

function hideStatus() {
  byId("appStatus").classList.add("ready");
}

function showError(error) {
  const status = byId("appStatus");
  status.classList.remove("ready");
  status.classList.add("error");
  byId("appStatusTitle").textContent = "No pudimos mostrar el dashboard";
  byId("appStatusMessage").textContent = error?.message || "Ocurrió un error inesperado al cargar la información.";
  byId("retryButton").hidden = false;
}

async function start() {
  try {
    renderDashboardNavigation();
    const sessionState = await requireSession();
    if (sessionState === null) return;
    renderUser(sessionState);
    const data = await loadDashboardData();
    renderMatriculasDashboard(data);
    hideStatus();
  } catch (error) {
    console.error(error);
    showError(error);
  }
}

byId("retryButton").addEventListener("click", () => window.location.reload());
start();
