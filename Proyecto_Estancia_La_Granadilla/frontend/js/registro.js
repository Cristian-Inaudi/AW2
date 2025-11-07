import { crearUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 registro.js cargado correctamente");

  const form = document.getElementById("formRegistro");

  if (!form) {
    console.error("❌ No se encontró el formulario con id='formRegistro'");
    return;
  }

  // Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = {
      nombre: document.getElementById("nombre")?.value.trim(),
      apellido: document.getElementById("apellido")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      telefono: document.getElementById("telefono")?.value.trim(),
      contrasena: document.getElementById("contrasena")?.value.trim(),
      es_admin: false,
      activo: true,
    };

    // Validar campos
    for (const [key, value] of Object.entries(usuario)) {
      if (["nombre", "apellido", "email", "telefono", "contrasena"].includes(key) && !value) {
        alert(`⚠️ El campo "${key}" está vacío o no se detectó correctamente.`);
        return;
      }
    }

    try {
      console.log("🟢 Enviando datos al servidor...");
      const nuevoUsuario = await crearUsuario(usuario);
      console.log("🟢 Usuario creado correctamente:", nuevoUsuario);

      // Guardar usuario y marcar registro correcto
      localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));
      localStorage.setItem("registroExitoso", "true");

      // Redirigir al login
      console.log("➡️ Redirigiendo a login.html...");
      window.location.href = "login.html";

    } catch (err) {
      console.error("❌ Error al registrar usuario:", err);
      alert("❌ " + (err.message || "Error al registrar usuario"));
    }
  });
});
