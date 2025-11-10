import { crearReserva } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const fechaInicio = localStorage.getItem("fechaInicio");
  const fechaFin = localStorage.getItem("fechaFin");
  const user = JSON.parse(localStorage.getItem("usuarioActivo"));
  const tbody = document.getElementById("tablaHabitaciones");
  const totalReserva = document.getElementById("totalReserva");
  const btnConfirmar = document.getElementById("btnConfirmar");

  // Verificar carrito vacío
  if (carrito.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted py-4">No hay habitaciones seleccionadas.</td></tr>`;
    btnConfirmar.disabled = true;
    return;
  }

  // Calcular noches
  const fIni = new Date(fechaInicio);
  const fFin = new Date(fechaFin);
  const noches = Math.max(1, Math.ceil((fFin - fIni) / (1000 * 60 * 60 * 24)));

  // Renderizar tabla
  let total = 0;
  tbody.innerHTML = carrito
    .map(h => {
      const subtotal = h.precio_noche_arg * noches;
      total += subtotal;
      return `
        <tr>
          <td>${h.nombre}</td>
          <td>${h.tipo}</td>
          <td>${fechaInicio}</td>
          <td>${fechaFin}</td>
          <td>${noches}</td>
          <td>$${Number(h.precio_noche_arg).toLocaleString("es-AR")}</td>
          <td class="fw-bold text-success">$${subtotal.toLocaleString("es-AR")}</td>
        </tr>`;
    })
    .join("");

  totalReserva.textContent = `$${total.toLocaleString("es-AR")}`;

  // Botón Volver
  document.getElementById("btnVolver").addEventListener("click", () => {
    window.location.href = "carrito.html";
  });

  // Confirmar reserva
  btnConfirmar.addEventListener("click", async () => {
    if (!user) {
      mostrarToast("⚠️ Debes iniciar sesión para confirmar una reserva.", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }

    const nuevaReserva = {
      id_usuario: user._id || user.id,
      fecha_entrada: fechaInicio,
      fecha_salida: fechaFin,
      habitaciones: carrito.map(h => ({
        id_habitacion: h._id || h.id,
        precio_noche_arg: h.precio_noche_arg,
        noches
      }))
    };

    try {
      const respuesta = await crearReserva(nuevaReserva);
      console.log("✅ Reserva creada:", respuesta);

      mostrarToast("✅ Reserva creada correctamente.", "success");

      // Limpiar variables locales
      localStorage.removeItem("carrito");
      localStorage.removeItem("fechaInicio");
      localStorage.removeItem("fechaFin");

      setTimeout(() => (window.location.href = "index.html"), 2000);
    } catch (error) {
      console.error("❌ Error al confirmar reserva:", error);
      mostrarToast("❌ No se pudo confirmar la reserva. Revisá la consola.", "error");
    }
  });
});
