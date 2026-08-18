import { APP_CONFIG } from "./config.js";
import { loadExcelDashboard } from "./excel-loader.js";
import { loadSupabaseDashboard } from "./supabase-data.js";

export async function loadDashboardData() {
  if (APP_CONFIG.data.mode === "excel") return loadExcelDashboard();
  if (APP_CONFIG.data.mode === "supabase") return loadSupabaseDashboard();
  throw new Error(`La fuente de datos “${APP_CONFIG.data.mode}” no está soportada.`);
}
