import { APP_CONFIG, WORKBOOK_SCHEMA } from "./config.js";
import {
  extractDateLabel,
  extractPeriod,
  numberOrZero,
  optionalNumber,
  safeRatio,
  unique,
} from "./utils.js";

function assertXlsxAvailable() {
  if (!globalThis.XLSX) {
    throw new Error("No se pudo iniciar el lector de Excel. Comprueba la conexión a internet e intenta nuevamente.");
  }
}

function getRequiredSheet(workbook, name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) throw new Error(`El Excel no contiene la hoja requerida “${name}”.`);
  return sheet;
}

function getCellValue(sheet, address) {
  return sheet[address]?.v ?? null;
}

function readRows(sheet, requiredColumns, label) {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    range: WORKBOOK_SCHEMA.headerRowIndex,
    defval: null,
    blankrows: false,
  });
  if (!rows.length) throw new Error(`La hoja “${label}” no contiene registros.`);
  const headers = Object.keys(rows[0]);
  const missing = requiredColumns.filter(column => !headers.includes(column));
  if (missing.length) {
    throw new Error(`La hoja “${label}” no contiene estas columnas: ${missing.join(", ")}.`);
  }
  return rows;
}

function readSummary(sheet) {
  const grid = XLSX.utils.sheet_to_json(sheet, {
    range: WORKBOOK_SCHEMA.headerRowIndex,
    header: 1,
    defval: null,
    blankrows: false,
  });
  if (grid.length < 2) throw new Error("La hoja “Resumen ejecutivo” no contiene indicadores.");
  const left = {};
  const right = {};
  grid.slice(1).forEach(row => {
    if (row[0]) left[String(row[0]).trim()] = row[1];
    if (row[3]) right[String(row[3]).trim()] = row[4];
  });
  return { left, right };
}

function compareTotal(warnings, label, computed, summaryValue) {
  const summary = optionalNumber(summaryValue);
  if (summary !== null && summary !== computed) {
    warnings.push(`${label}: el detalle suma ${computed}, pero el resumen indica ${summary}.`);
  }
}

export function parseWorkbook(buffer) {
  assertXlsxAvailable();
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    throw new Error("El archivo no es un Excel válido o está dañado.");
  }

  const summarySheet = getRequiredSheet(workbook, WORKBOOK_SCHEMA.sheets.summary);
  const programSheet = getRequiredSheet(workbook, WORKBOOK_SCHEMA.sheets.programs);
  getRequiredSheet(workbook, WORKBOOK_SCHEMA.sheets.academics);
  const funnelSheet = getRequiredSheet(workbook, WORKBOOK_SCHEMA.sheets.funnel);

  const programRows = readRows(programSheet, WORKBOOK_SCHEMA.programColumns, WORKBOOK_SCHEMA.sheets.programs);
  const funnelRows = readRows(funnelSheet, WORKBOOK_SCHEMA.funnelColumns, WORKBOOK_SCHEMA.sheets.funnel);
  const summary = readSummary(summarySheet);

  const programs = programRows
    .filter(row => String(row["Programa"] ?? "").trim())
    .map(row => ({
      name: String(row["Programa"]).trim(),
      meta: numberOrZero(row["Meta institucional"]),
      online: numberOrZero(row["Meta online"]),
      academic: numberOrZero(row["Matrícula académica"]),
      financial: optionalNumber(row["Matrícula financiera"]),
    }));

  const funnel = funnelRows
    .filter(row => String(row["Programa"] ?? "").trim())
    .map(row => ({
      name: String(row["Programa"]).trim(),
      pre: numberOrZero(row["Preinscritos"]),
      registered: numberOrZero(row["Inscritos"]),
      admitted: numberOrZero(row["Admitidos"]),
      enrolled: numberOrZero(row["Matrícula financiera"]),
    }));

  if (!programs.length || !funnel.length) {
    throw new Error("El Excel no contiene programas válidos para mostrar.");
  }

  const warnings = [];
  const duplicatePrograms = programs.filter((row, index) => programs.findIndex(item => item.name === row.name) !== index);
  const duplicateFunnel = funnel.filter((row, index) => funnel.findIndex(item => item.name === row.name) !== index);
  if (duplicatePrograms.length) warnings.push(`Programas duplicados: ${unique(duplicatePrograms.map(row => row.name)).join(", ")}.`);
  if (duplicateFunnel.length) warnings.push(`Programas duplicados en el embudo: ${unique(duplicateFunnel.map(row => row.name)).join(", ")}.`);

  const totals = {
    meta: programs.reduce((total, row) => total + row.meta, 0),
    financial: programs.reduce((total, row) => total + numberOrZero(row.financial), 0),
    academic: programs.reduce((total, row) => total + row.academic, 0),
    pre: funnel.reduce((total, row) => total + row.pre, 0),
    registered: funnel.reduce((total, row) => total + row.registered, 0),
    admitted: funnel.reduce((total, row) => total + row.admitted, 0),
    funnelFinancial: funnel.reduce((total, row) => total + row.enrolled, 0),
  };

  compareTotal(warnings, "Meta institucional", totals.meta, summary.left["Meta institucional"]);
  compareTotal(warnings, "Matrícula financiera", totals.financial, summary.left["Matrícula financiera"]);
  compareTotal(warnings, "Matrícula académica", totals.academic, summary.left["Matrícula académica"]);
  compareTotal(warnings, "Preinscritos", totals.pre, summary.right["Preinscritos"]);
  compareTotal(warnings, "Inscritos", totals.registered, summary.right["Inscritos"]);
  compareTotal(warnings, "Admitidos", totals.admitted, summary.right["Admitidos"]);
  if (totals.financial !== totals.funnelFinancial) {
    warnings.push(`La matrícula financiera suma ${totals.financial} en el consolidado y ${totals.funnelFinancial} en el embudo.`);
  }

  funnel.forEach(row => {
    if (!(row.pre >= row.registered && row.registered >= row.admitted && row.admitted >= row.enrolled)) {
      warnings.push(`El orden del embudo no es coherente para ${row.name}.`);
    }
  });

  const rejected = numberOrZero(summary.right["Rechazados"]);
  const derivedPending = Math.max(totals.pre - totals.admitted - rejected, 0);
  const summaryPending = optionalNumber(summary.right["Por admitir"]);
  const pending = summaryPending ?? derivedPending;
  if (summaryPending !== null && summaryPending !== derivedPending) {
    warnings.push(`Por admitir: el cálculo da ${derivedPending}, pero el resumen indica ${summaryPending}.`);
  }

  const summaryTitle = getCellValue(summarySheet, "A1");
  const summarySubtitle = getCellValue(summarySheet, "A2");
  const programSubtitle = getCellValue(programSheet, "A2");
  const funnelSubtitle = getCellValue(funnelSheet, "A2");
  const period = extractPeriod(summaryTitle) ?? extractPeriod(programSubtitle) ?? APP_CONFIG.defaultPeriod;
  const cutDate = extractDateLabel(summarySubtitle) ?? extractDateLabel(funnelSubtitle) ?? "Fecha no informada";

  return {
    dashboardId: APP_CONFIG.dashboardId,
    programs,
    funnel,
    totals: {
      ...totals,
      pending,
      rejected,
      progress: safeRatio(totals.financial, totals.meta),
      academicGap: totals.academic - totals.financial,
    },
    metadata: {
      period,
      cutDate,
      summarySubtitle: String(summarySubtitle ?? ""),
      programSubtitle: String(programSubtitle ?? ""),
      funnelSubtitle: String(funnelSubtitle ?? ""),
      loadedAt: new Date().toISOString(),
      sourceMode: "excel",
    },
    warnings: unique(warnings),
  };
}

export async function loadExcelDashboard() {
  const separator = APP_CONFIG.data.excelUrl.includes("?") ? "&" : "?";
  const url = `${APP_CONFIG.data.excelUrl}${separator}v=${Date.now()}`;
  let response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new Error("No se pudo conectar con el archivo de datos. Comprueba la conexión e intenta nuevamente.");
  }
  if (!response.ok) {
    throw new Error(`No se pudo cargar el Excel institucional (error ${response.status}).`);
  }
  const buffer = await response.arrayBuffer();
  return parseWorkbook(buffer);
}
