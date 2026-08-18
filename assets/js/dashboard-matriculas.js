import {
  byId,
  clamp,
  escapeHtml,
  formatInteger,
  formatPercent,
  normalizeText,
  safeRatio,
} from "./utils.js";

const headers = [
  ["name", "Programa"],
  ["meta", "Meta institucional"],
  ["online", "Meta online"],
  ["financial", "Matrícula financiera"],
  ["academic", "Matrícula académica"],
  ["gap", "Brecha"],
  ["progress", "Cumplimiento financiero"],
  ["remaining", "Faltantes"],
  ["status", "Estado"],
];

let dashboardData;
let sortKey = "progress";
let sortDirection = -1;

function onlineMeta(program) {
  return program.online;
}

function metrics(program) {
  const financial = program.financial;
  const progress = financial === null ? null : safeRatio(financial, program.meta);
  const remaining = progress === null ? null : Math.max(program.meta - financial, 0);
  const gap = financial === null ? null : program.academic - financial;
  let status = "Sin meta";
  let tone = "muted";

  if (program.meta > 0 && financial === null) status = "Sin dato financiero";
  else if (program.meta > 0 && financial > program.meta) { status = "Superada"; tone = "success"; }
  else if (program.meta > 0 && financial === program.meta) { status = "Cumplida"; tone = "success"; }
  else if (progress !== null && progress >= .8) { status = "Cerca"; tone = "warning"; }
  else if (progress !== null && progress >= .5) { status = "En progreso"; tone = "progress"; }
  else if (program.meta > 0) { status = "Rezagada"; tone = "danger"; }

  return { financial, progress, remaining, gap, status, tone };
}

function renderMetadata(data) {
  const { metadata, totals, warnings } = data;
  document.title = `Dashboard de Matrículas CUC ${metadata.period}`;
  byId("periodLabel").textContent = metadata.period;
  byId("eyebrowPeriod").textContent = `Admisiones · Periodo ${metadata.period}`;
  byId("lastCut").textContent = metadata.cutDate;
  byId("funnelCutText").textContent = `Corte institucional: ${metadata.cutDate} · Conversión calculada con el detalle validado`;
  byId("funnelBaseText").textContent = `El ancho representa el avance frente a ${formatInteger(totals.pre)} preinscritos`;
  byId("sourceFooter").textContent = [
    "Fuentes institucionales CUC",
    metadata.programSubtitle,
    metadata.funnelSubtitle,
    `Periodo ${metadata.period}`,
  ].filter(Boolean).join(" · ");

  const status = byId("dataStatus");
  const statusText = status.querySelector("span");
  if (warnings.length) {
    status.classList.add("warning");
    statusText.textContent = `${warnings.length} alerta${warnings.length === 1 ? "" : "s"} de datos`;
    status.title = warnings.join("\n");
  } else {
    status.classList.remove("warning");
    statusText.textContent = `Datos validados · ${metadata.cutDate}`;
    status.title = "Los totales del detalle coinciden con el resumen institucional.";
  }
}

function renderKpis(data) {
  const { totals } = data;
  const progress = totals.progress;
  const remaining = Math.max(totals.meta - totals.financial, 0);
  const gapText = totals.academicGap >= 0
    ? `${formatInteger(totals.academicGap)} por convertir a financiera`
    : `${formatInteger(Math.abs(totals.academicGap))} financieras por encima de académicas`;

  byId("kpis").innerHTML = `
    <article class="kpi">
      <div class="kpi-icon">◎</div>
      <div><span>Meta institucional</span><strong>${formatInteger(totals.meta)}</strong><small>Proyección de primer semestre</small></div>
    </article>
    <article class="kpi primary">
      <div class="kpi-icon green">◉</div>
      <div><span>Matrícula financiera</span><strong>${formatInteger(totals.financial)}</strong><small>Indicador oficial de cumplimiento</small></div>
    </article>
    <article class="kpi">
      <div class="kpi-icon green">↗</div>
      <div><span>Cumplimiento financiero</span><strong class="green-text">${formatPercent(progress)}</strong><small>Pagados frente a la meta</small></div>
    </article>
    <article class="kpi">
      <div class="kpi-icon orange">⚑</div>
      <div><span>Faltantes para la meta</span><strong class="orange-text">${formatInteger(remaining)}</strong><small>${formatPercent(progress === null ? null : Math.max(1 - progress, 0))} por alcanzar</small></div>
    </article>
    <article class="kpi academic">
      <div class="kpi-icon blue">◈</div>
      <div><span>Matrícula académica</span><strong>${formatInteger(totals.academic)}</strong><small>${gapText}</small></div>
    </article>`;
}

function renderProgress(data) {
  const progress = data.totals.progress;
  const displayedProgress = progress === null ? null : Math.max(progress, 0);
  const donutDegrees = clamp((displayedProgress ?? 0) * 360, 0, 360);
  byId("donut").style.background = `conic-gradient(var(--green) ${donutDegrees}deg, #edf0f2 0)`;
  byId("donutValue").textContent = formatPercent(displayedProgress);

  const counts = {};
  data.programs.forEach(program => {
    const status = metrics(program).status;
    counts[status] = (counts[status] ?? 0) + 1;
  });
  byId("statusSummary").innerHTML = `
    <div><span><i style="background:var(--green)"></i>Meta cumplida o superada</span><b>${(counts.Superada ?? 0) + (counts.Cumplida ?? 0)}</b></div>
    <div><span><i style="background:#e99a09"></i>Cerca de cumplir</span><b>${counts.Cerca ?? 0}</b></div>
    <div><span><i style="background:#dc7215"></i>En progreso</span><b>${counts["En progreso"] ?? 0}</b></div>
    <div><span><i style="background:var(--red)"></i>Rezagada</span><b>${counts.Rezagada ?? 0}</b></div>`;
}

function renderBars(data) {
  const selected = [...data.programs]
    .filter(program => program.meta > 0)
    .sort((a, b) => b.meta - a.meta)
    .slice(0, 6);
  const maxValue = Math.max(1, ...selected.flatMap(program => [
    program.meta,
    program.financial ?? 0,
    program.academic,
  ]));
  const width = value => clamp((Number(value) || 0) / maxValue * 92, 0, 92);

  byId("bars").innerHTML = selected.map(program => `
    <div class="bar-row">
      <div class="bar-label">${escapeHtml(program.name)}</div>
      <div class="bars">
        <div class="bar meta" style="width:${width(program.meta)}%"><b>${formatInteger(program.meta)}</b></div>
        <div class="bar fin" style="width:${width(program.financial)}%"><b>${formatInteger(program.financial)}</b></div>
        <div class="bar aca" style="width:${width(program.academic)}%"><b>${formatInteger(program.academic)}</b></div>
      </div>
    </div>`).join("");
}

function renderFunnelSummary(data) {
  const { totals } = data;
  const stages = [
    { label: "Preinscritos", value: totals.pre, previous: totals.pre, suffix: "Base del proceso · 100%" },
    { label: "Inscritos", value: totals.registered, previous: totals.pre, suffix: "de preinscritos" },
    { label: "Admitidos", value: totals.admitted, previous: totals.registered, suffix: "de inscritos" },
    { label: "Matrícula financiera", value: totals.funnelFinancial, previous: totals.admitted, suffix: "de admitidos" },
  ];

  byId("funnelKpis").innerHTML = stages.map((stage, index) => `
    <article>
      <span>${stage.label}</span>
      <strong>${formatInteger(stage.value)}</strong>
      <small>${index === 0 ? stage.suffix : `${formatPercent(safeRatio(stage.value, stage.previous))} ${stage.suffix}`}</small>
    </article>`).join("");

  byId("funnelChart").innerHTML = stages.map(stage => {
    const overall = safeRatio(stage.value, totals.pre);
    const width = overall === null ? 38 : Math.max(overall * 100, 38);
    return `<div class="funnel-stage" style="width:${clamp(width, 38, 100)}%">
      <span>${stage.label}</span><strong>${formatInteger(stage.value)}</strong><small>${formatPercent(overall)}</small>
    </div>`;
  }).join("");

  byId("funnelNote").innerHTML = `
    <h2>Lectura del proceso</h2>
    <div><span>Por admitir</span><strong>${formatInteger(totals.pending)}</strong></div>
    <div><span>Rechazados</span><strong>${formatInteger(totals.rejected)}</strong></div>
    <div><span>Conversión total</span><strong>${formatPercent(safeRatio(totals.funnelFinancial, totals.pre))}</strong></div>
    <p><b>Criterio de cumplimiento:</b> las ${formatInteger(totals.financial)} matrículas financieras determinan el avance frente a la meta. Las ${formatInteger(totals.academic)} matrículas académicas se muestran como indicador complementario.</p>`;
}

function renderFunnelRows() {
  const query = normalizeText(byId("funnelSearch").value);
  const list = dashboardData.funnel
    .filter(program => normalizeText(program.name).includes(query))
    .sort((a, b) => (safeRatio(b.enrolled, b.pre) ?? -1) - (safeRatio(a.enrolled, a.pre) ?? -1));

  byId("funnelCount").textContent = `${list.length} de ${dashboardData.funnel.length} programas del reporte`;
  byId("funnelRows").innerHTML = list.map(program => {
    const conversion = safeRatio(program.enrolled, program.pre);
    return `<tr>
      <td>${escapeHtml(program.name)}</td>
      <td>${formatInteger(program.pre)}</td>
      <td>${formatInteger(program.registered)}</td>
      <td>${formatInteger(program.admitted)}</td>
      <td><strong>${formatInteger(program.enrolled)}</strong></td>
      <td><div class="cell-progress"><span>${formatPercent(conversion)}</span><i><b style="width:${clamp((conversion ?? 0) * 100, 0, 100)}%"></b></i></div></td>
    </tr>`;
  }).join("");
}

function sortValue(program, key) {
  const details = metrics(program);
  if (key === "name") return program.name;
  if (key === "meta") return program.meta;
  if (key === "online") return onlineMeta(program);
  if (key === "financial") return details.financial ?? -1;
  if (key === "academic") return program.academic;
  if (key === "gap") return details.gap ?? -1;
  if (key === "progress") return details.progress ?? -1;
  return details.remaining ?? -1;
}

function renderProgramRows() {
  const query = normalizeText(byId("programSearch").value);
  const filter = byId("statusFilter").value;
  const list = dashboardData.programs
    .filter(program => normalizeText(program.name).includes(query))
    .filter(program => filter === "Todos" || metrics(program).status === filter)
    .sort((a, b) => {
      const first = sortValue(a, sortKey);
      const second = sortValue(b, sortKey);
      const comparison = typeof first === "string"
        ? first.localeCompare(second, "es", { sensitivity: "base" })
        : first - second;
      return comparison * sortDirection;
    });

  byId("programCount").textContent = `${list.length} de ${dashboardData.programs.length} programas visibles · Cumplimiento calculado con matrícula financiera`;
  byId("programRows").innerHTML = list.map(program => {
    const details = metrics(program);
    return `<tr>
      <td>${escapeHtml(program.name)}</td>
      <td>${formatInteger(program.meta)}</td>
      <td><strong class="online-meta">${formatInteger(onlineMeta(program))}</strong></td>
      <td><strong>${formatInteger(details.financial)}</strong></td>
      <td><strong class="academic-value">${formatInteger(program.academic)}</strong></td>
      <td>${formatInteger(details.gap)}</td>
      <td><div class="cell-progress"><span>${formatPercent(details.progress)}</span><i><b style="width:${clamp((details.progress ?? 0) * 100, 0, 100)}%"></b></i></div></td>
      <td>${formatInteger(details.remaining)}</td>
      <td><span class="badge ${details.tone}"><i></i>${details.status}</span></td>
    </tr>`;
  }).join("");
}

function renderProgramHeaders() {
  byId("programHeaders").innerHTML = headers.map(([key, label]) => {
    if (key === "status") return `<th>${label}</th>`;
    const active = key === sortKey;
    const arrow = active ? (sortDirection === 1 ? "↑" : "↓") : "↕";
    return `<th><button type="button" data-sort="${key}" aria-label="Ordenar por ${label}">${label} ${arrow}</button></th>`;
  }).join("");

  document.querySelectorAll("[data-sort]").forEach(button => {
    button.addEventListener("click", () => {
      const nextKey = button.dataset.sort;
      if (sortKey === nextKey) sortDirection *= -1;
      else {
        sortKey = nextKey;
        sortDirection = nextKey === "name" ? 1 : -1;
      }
      renderProgramHeaders();
      renderProgramRows();
    });
  });
}

function bindFilters() {
  byId("funnelSearch").addEventListener("input", renderFunnelRows);
  byId("programSearch").addEventListener("input", renderProgramRows);
  byId("statusFilter").addEventListener("change", renderProgramRows);
}

export function renderMatriculasDashboard(data) {
  dashboardData = data;
  renderMetadata(data);
  renderKpis(data);
  renderProgress(data);
  renderBars(data);
  renderFunnelSummary(data);
  renderProgramHeaders();
  renderFunnelRows();
  renderProgramRows();
  bindFilters();
}
