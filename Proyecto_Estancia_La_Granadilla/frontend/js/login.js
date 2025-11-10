import { loginUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 login.js cargado correctamente");

  const form = document.getElementById("formLogin");
  if (!form) return;

  const toastRegistroExitoso = document.getElementById("toastRegistroExitoso");
  const toastLoginOk = document.getElementById("toastLoginOk");
  const toastLoginError = document.getElementById("toastLoginError");

  const toastRegistro = toastRegistroExitoso ? new bootstrap.Toast(toastRegistroExitoso, { delay: 3000 }) : null;
  const toastOk = toastLoginOk ? new bootstrap.Toast(toastLoginOk, { delay: 2000 }) : null;
  const toastError = toastLoginError ? new bootstrap.Toast(toastLoginError, { delay: 2500 }) : null;

  // Mostrar toast si viene del registro
  if (localStorage.getItem("registroExitoso") === "true") {
    localStorage.removeItem("registroExitoso");
    if (toastRegistro) toastRegistro.show();
  }

  // Manejar login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    if (!email || !contrasena) {
      alert("⚠️ Completá ambos campos.");
      return;
    }

    try {
      const data = await loginUsuario(email, contrasena);

      if (toastOk) toastOk.show();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      console.error("❌ Error en login:", err);
      if (toastError) toastError.show();
    }
  });
});
