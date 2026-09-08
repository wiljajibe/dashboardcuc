import { APP_CONFIG } from "./config.js?v=20260908-periods";
import { requireSession, signOut } from "./auth.js?v=20260908-periods";
import { loadDashboardData } from "./data-source.js?v=20260908-periods";
import { renderMatriculasDashboard } from "./dashboard-matriculas.js";
import { byId, escapeHtml } from "./utils.js";

function renderDashboardNavigation() {
  const period = APP_CONFIG.defaultPeriod;
  document.title = `Dashboard de Matrículas CUC ${period}`;
  byId("periodLabel").textContent = period;
  byId("eyebrowPeriod").textContent = `Admisiones · Periodo ${period}`;
  byId("semesterNav").innerHTML = [
    ["2026-2", "./index.html"], ["2027-1", "./2027-1.html"],
  ].map(([value, href]) => `<a href="${href}" ${value === period ? 'aria-current="page"' : ''}>Semestre ${value}</a>`).join("");
  byId("dashboardNav").innerHTML = APP_CONFIG.dashboards
    .filter(dashboard => dashboard.enabled)
    .map(dashboard => `<a href="${period === '2027-1' ? './2027-1.html' : escapeHtml(dashboard.href)}" ${dashboard.id === APP_CONFIG.dashboardId ? 'aria-current="page"' : ""} title="${escapeHtml(dashboard.description)}">${escapeHtml(dashboard.label)}</a>`)
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
    const authFlow = new URLSearchParams(window.location.hash.slice(1)).get("type");
    if (authFlow === "invite" || authFlow === "recovery") {
      window.location.replace(`./set-password.html${window.location.hash}`);
      return;
    }
    renderDashboardNavigation();
    const sessionState = await requireSession();
    if (sessionState === null) return;
    renderUser(sessionState);
    const data = await loadDashboardData();
    if (data) renderMatriculasDashboard(data);
    else {
      byId("lastCut").textContent = "Pendiente de primer corte";
      byId("dataStatus").querySelector("span").textContent = "Sin datos publicados";
      byId("kpis").innerHTML = `<article class="panel" style="grid-column:1/-1;padding:24px"><h2>Semestre ${APP_CONFIG.defaultPeriod}</h2><p>Pendiente de primer corte. Aquí aparecerán las metas, matrículas y admisiones de este semestre cuando se publique su primer reporte.</p><a href="${APP_CONFIG.defaultPeriod === '2027-1' ? './index.html' : './2027-1.html'}">Consultar el semestre ${APP_CONFIG.defaultPeriod === '2027-1' ? '2026-2' : '2027-1'}</a></article>`;
      for (const id of ["comparativo", "embudo", "programas"]) byId(id).style.display = "none";
      document.querySelector(".section-nav").hidden = true;
      byId("sourceFooter").textContent = `CUC · Periodo ${APP_CONFIG.defaultPeriod} · Pendiente de información`;
    }
    hideStatus();
  } catch (error) {
    console.error(error);
    showError(error);
  }
}

byId("retryButton").addEventListener("click", () => window.location.reload());
start();
