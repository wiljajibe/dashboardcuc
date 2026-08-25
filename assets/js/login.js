import { AUTH_CONFIG, getSession, isAuthEnabled, signIn } from "./auth.js?v=20260824-secure";
import { byId } from "./utils.js";

const form = byId("loginForm");
const button = byId("loginButton");
const message = byId("loginMessage");
const emailInput = byId("email");
const passwordInput = byId("password");

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;
const LOCK_DURATION_MS = LOCK_MINUTES * 60 * 1000;
const STORAGE_PREFIX = "cuc-login-guard:";
let lockTimer;

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function storageKey(email) {
  let hash = 2166136261;
  for (const character of normalizeEmail(email)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `${STORAGE_PREFIX}${(hash >>> 0).toString(16)}`;
}

function readGuard(email) {
  if (!normalizeEmail(email)) return { attempts: 0, lockedUntil: 0 };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(email)) || "null");
    if (!stored || typeof stored.attempts !== "number" || typeof stored.lockedUntil !== "number") {
      return { attempts: 0, lockedUntil: 0 };
    }
    if (stored.lockedUntil && stored.lockedUntil <= Date.now()) {
      localStorage.removeItem(storageKey(email));
      return { attempts: 0, lockedUntil: 0 };
    }
    return stored;
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function writeGuard(email, guard) {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(guard));
  } catch {
    // Supabase mantiene sus propios límites aunque el navegador bloquee el almacenamiento local.
  }
}

function clearGuard(email) {
  try {
    localStorage.removeItem(storageKey(email));
  } catch {
    // No impide el inicio de sesión si el almacenamiento local no está disponible.
  }
}

function formatRemaining(milliseconds) {
  const seconds = Math.max(1, Math.ceil(milliseconds / 1000));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;
  return minutesPart ? `${minutesPart} min ${String(secondsPart).padStart(2, "0")} s` : `${secondsPart} s`;
}

function refreshLockState() {
  clearInterval(lockTimer);
  const email = normalizeEmail(emailInput.value);
  const guard = readGuard(email);
  const remaining = guard.lockedUntil - Date.now();
  const locked = Boolean(email && remaining > 0);
  button.disabled = locked;
  passwordInput.disabled = locked;

  if (locked) {
    setMessage(`Acceso temporalmente bloqueado después de ${MAX_ATTEMPTS} intentos fallidos. Intenta nuevamente en ${formatRemaining(remaining)}.`, true);
    lockTimer = setInterval(refreshLockState, 1000);
  } else if (email && guard.attempts > 0) {
    const available = MAX_ATTEMPTS - guard.attempts;
    setMessage(`Te ${available === 1 ? "queda" : "quedan"} ${available} ${available === 1 ? "intento" : "intentos"} antes del bloqueo temporal.`, true);
  }
  return locked;
}

function recordFailedAttempt(email) {
  const guard = readGuard(email);
  const attempts = guard.attempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    writeGuard(email, { attempts: MAX_ATTEMPTS, lockedUntil: Date.now() + LOCK_DURATION_MS });
    refreshLockState();
    return;
  }
  writeGuard(email, { attempts, lockedUntil: 0 });
  const available = MAX_ATTEMPTS - attempts;
  setMessage(`Correo o contraseña incorrectos. Te ${available === 1 ? "queda" : "quedan"} ${available} ${available === 1 ? "intento" : "intentos"}.`, true);
}

async function initialize() {
  if (!isAuthEnabled()) {
    button.disabled = true;
    form.querySelectorAll("input").forEach(input => { input.disabled = true; });
    setMessage("La pantalla de acceso está preparada. Falta conectar el proyecto seguro de usuarios antes de activarla.");
    return;
  }
  try {
    const state = await getSession();
    if (state.session) window.location.replace(AUTH_CONFIG.homePage);
    else if (new URLSearchParams(window.location.search).get("status") === "password-set") {
      setMessage("Contraseña creada correctamente. Ya puedes iniciar sesión.");
    } else setMessage("Ingresa tus credenciales autorizadas.");
    refreshLockState();
  } catch (error) {
    setMessage(error.message, true);
  }
}

emailInput.addEventListener("input", refreshLockState);

form.addEventListener("submit", async event => {
  event.preventDefault();
  const email = normalizeEmail(emailInput.value);
  if (refreshLockState()) return;
  button.disabled = true;
  setMessage("Verificando usuario…");
  try {
    await signIn(email, passwordInput.value);
    clearGuard(email);
    window.location.replace(AUTH_CONFIG.homePage);
  } catch (error) {
    button.disabled = false;
    if (error?.code === "invalid_credentials") recordFailedAttempt(email);
    else setMessage("No fue posible iniciar sesión en este momento. Intenta nuevamente más tarde.", true);
    console.error(error);
  }
});

initialize();
