import { APP_CONFIG } from "./config.js?v=20260908-periods";

export async function loadDashboardData() {
  if (APP_CONFIG.data.mode === "excel") {
    const { loadExcelDashboard } = await import("./excel-loader.js?v=20260824-secure");
    return loadExcelDashboard();
  }
  if (APP_CONFIG.data.mode === "supabase") {
    const { loadSupabaseDashboard } = await import("./supabase-data.js?v=20260908-periods");
    return loadSupabaseDashboard();
  }
  throw new Error(`La fuente de datos “${APP_CONFIG.data.mode}” no está soportada.`);
}
