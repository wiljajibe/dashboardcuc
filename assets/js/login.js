import { AUTH_CONFIG, getSession, isAuthEnabled, signIn } from "./auth.js";
import { byId } from "./utils.js";

const form = byId("loginForm");
const button = byId("loginButton");
const message = byId("loginMessage");

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
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
    else setMessage("Ingresa tus credenciales autorizadas.");
  } catch (error) {
    setMessage(error.message, true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  button.disabled = true;
  setMessage("Verificando usuario…");
  try {
    await signIn(byId("email").value.trim(), byId("password").value);
    window.location.replace(AUTH_CONFIG.homePage);
  } catch (error) {
    button.disabled = false;
    setMessage("No fue posible iniciar sesión. Verifica el correo y la contraseña.", true);
    console.error(error);
  }
});

initialize();
