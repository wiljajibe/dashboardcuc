import { AUTH_CONFIG } from "./auth-config.js";

let clientPromise;

function validateConfig() {
  if (!AUTH_CONFIG.projectUrl || !AUTH_CONFIG.publishableKey) {
    throw new Error("La autenticación está activada, pero faltan los datos de conexión de Supabase.");
  }
}

export function isAuthEnabled() {
  return AUTH_CONFIG.enabled;
}

export async function getAuthClient() {
  if (!AUTH_CONFIG.enabled) return null;
  validateConfig();
  if (!clientPromise) {
    clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(
        AUTH_CONFIG.projectUrl,
        AUTH_CONFIG.publishableKey,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
      ));
  }
  return clientPromise;
}

export async function getSession() {
  if (!AUTH_CONFIG.enabled) return { enabled: false, session: null, user: null };
  const client = await getAuthClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return { enabled: true, session: data.session, user: data.session?.user ?? null };
}

export async function requireSession() {
  const state = await getSession();
  if (state.enabled && !state.session) {
    window.location.replace(AUTH_CONFIG.loginPage);
    return null;
  }
  return state;
}

export async function signIn(email, password) {
  const client = await getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = await getAuthClient();
  if (client) await client.auth.signOut();
  window.location.replace(AUTH_CONFIG.loginPage);
}

export { AUTH_CONFIG };
