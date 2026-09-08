import { APP_CONFIG } from "./config.js?v=20260908-periods";
import { getAuthClient } from "./auth.js?v=20260908-periods";

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
    .eq("payload->metadata->>period", APP_CONFIG.defaultPeriod)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (datasetError) throw new Error("No fue posible consultar la información del semestre. Intenta nuevamente.");
  if (!dataset?.payload) return null;
  if (dataset.payload.metadata?.period !== APP_CONFIG.defaultPeriod) throw new Error("El periodo del reporte no coincide con el semestre seleccionado.");

  return {
    ...dataset.payload,
    metadata: {
      ...dataset.payload.metadata,
      cutDate: dataset.payload.metadata?.cutDate ?? dataset.source_date ?? "Fecha no informada",
      loadedAt: new Date().toISOString(),
      sourceMode: "supabase",
    },
  };
}
