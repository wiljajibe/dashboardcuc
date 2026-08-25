import { AUTH_CONFIG, getAuthClient, isAuthEnabled } from "./auth.js";
import { byId } from "./utils.js";

const form = byId("passwordForm");
const button = byId("passwordButton");
const message = byId("passwordMessage");

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function initialize() {
  if (!isAuthEnabled()) {
    button.disabled = true;
    form.querySelectorAll("input").forEach(input => { input.disabled = true; });
    setMessage("La configuración de acceso todavía no está activa.", true);
    return;
  }

  try {
    const client = await getAuthClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      button.disabled = true;
      setMessage("Este enlace no es válido o ya venció. Solicita una nueva invitación.", true);
      return;
    }
    setMessage("Crea una contraseña personal de al menos 12 caracteres.");
  } catch {
    button.disabled = true;
    setMessage("No pudimos validar la invitación. Solicita un nuevo enlace.", true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const password = byId("newPassword").value;
  const confirmation = byId("confirmPassword").value;

  if (password.length < 12) {
    setMessage("La contraseña debe tener al menos 12 caracteres.", true);
    return;
  }
  if (password !== confirmation) {
    setMessage("Las contraseñas no coinciden.", true);
    return;
  }

  button.disabled = true;
  setMessage("Guardando la contraseña…");
  try {
    const client = await getAuthClient();
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
    await client.auth.signOut();
    window.location.replace(`${AUTH_CONFIG.loginPage}?status=password-set`);
  } catch {
    button.disabled = false;
    setMessage("No fue posible guardar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.", true);
  }
});

initialize();
