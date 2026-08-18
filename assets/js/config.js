export const APP_CONFIG = Object.freeze({
  defaultPeriod: "2026-2",
  dashboardId: "matriculas",
  data: {
    mode: "excel",
    excelUrl: "./Dashboard_Matriculas_CUC_2026-2.xlsx",
    supabaseSlug: "matriculas",
  },
  dashboards: [
    {
      id: "matriculas",
      label: "▦ Matrículas",
      description: "Matrículas y admisiones",
      href: "./index.html",
      enabled: true,
    },
  ],
});

export const WORKBOOK_SCHEMA = Object.freeze({
  sheets: {
    summary: "Resumen ejecutivo",
    programs: "Consolidado por programa",
    academics: "Matrícula académica",
    funnel: "Embudo de admisiones",
  },
  headerRowIndex: 3,
  programColumns: [
    "Programa",
    "Meta institucional",
    "Meta online",
    "Matrícula financiera",
    "Matrícula académica",
  ],
  funnelColumns: [
    "Programa",
    "Preinscritos",
    "Inscritos",
    "Admitidos",
    "Matrícula financiera",
  ],
});
