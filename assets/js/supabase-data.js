import { APP_CONFIG } from "./config.js";
import { getAuthClient } from "./auth.js";

export async function loadSupabaseDashboard() {
  const client = await getAuthClient();
  if (!client) throw new Error("La fuente privada requiere activar la autenticación.");

  const { data: dashboard, error: dashboardError } = await client
    .from("dashboards")
    .select("id, slug, title")
    .eq("slug", APP_CONFIG.data.supabaseSlug)
    .eq("active", true)
    .single();
  if (dashboardError) throw new Error("Tu usuario no tiene acceso a este dashboard.");

  const { data: dataset, error: datasetError } = await client
    .from("dashboard_datasets")
    .select("payload, source_date, created_at")
    .eq("dashboard_id", dashboard.id)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (datasetError || !dataset?.payload) throw new Error("Este dashboard todavía no tiene información publicada.");

  return {
    ...dataset.payload,
    metadata: {
      ...dataset.payload.metadata,
      cutDate: dataset.source_date ?? dataset.payload.metadata?.cutDate ?? "Fecha no informada",
      loadedAt: new Date().toISOString(),
      sourceMode: "supabase",
    },
  };
}
