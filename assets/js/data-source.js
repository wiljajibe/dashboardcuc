import { APP_CONFIG } from "./config.js";

export async function loadDashboardData() {
  if (APP_CONFIG.data.mode === "excel") {
    const { loadExcelDashboard } = await import("./excel-loader.js");
    return loadExcelDashboard();
  }
  if (APP_CONFIG.data.mode === "supabase") {
    const { loadSupabaseDashboard } = await import("./supabase-data.js");
    return loadSupabaseDashboard();
  }
  throw new Error(`La fuente de datos “${APP_CONFIG.data.mode}” no está soportada.`);
}
