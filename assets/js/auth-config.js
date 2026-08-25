// La clave publicable de Supabase puede estar en el navegador únicamente cuando
// todas las tablas tienen Row Level Security (RLS). Nunca coloques aquí una
// service_role key, una secret key ni contraseñas administrativas.
export const AUTH_CONFIG = Object.freeze({
  enabled: true,
  provider: "supabase",
  projectUrl: "https://mwvyhzcajuhqsaagvpbo.supabase.co",
  publishableKey: "sb_publishable_Bm8BejDnL-xDJ5FTP2k85g_7OUhhfRR",
  loginPage: "./login.html",
  homePage: "./index.html",
});
