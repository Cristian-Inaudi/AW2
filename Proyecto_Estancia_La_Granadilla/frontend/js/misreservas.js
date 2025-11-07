import { getReservas } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("usuarioActivo"));
  const tbody = document.getElementById("tbodyReservas");

  if (!user) {
    mostrarToast("⚠️ Debes iniciar sesión para ver tus reservas.", "warning");
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  try {
    // Cargar reservas y habitaciones
    const [reservas, habitaciones] = await Promise.all([
      getReservas(),
      fetch("http://localhost:5000/habitaciones").then(r => r.json())
    ]);

    const misReservas = reservas.filter(r => r.id_usuario === user.id);

    if (misReservas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-muted py-4">No tenés reservas registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = misReservas
      .map((r, i) => {
        const colorEstado =
          r.estado === "pendiente" ? "text-warning" :
            r.estado === "confirmada" ? "text-success" :
              r.estado === "cancelada" ? "text-danger" : "text-muted";

        const botonCancelar =
          r.estado === "pendiente"
            ? `<button class="btn btn-outline-danger btn-sm cancelar-btn" data-id="${r.id}">Cancelar</button>`
            : `<span class="text-muted">-</span>`;

        const botonExpandir = `
          <button class="btn btn-outline-secondary btn-sm toggle-detalle" data-bs-toggle="collapse"
            data-bs-target="#habitaciones-${i}" aria-expanded="false" aria-controls="habitaciones-${i}">
            <i class="bi bi-chevron-down"></i> Detalle
          </button>
        `;

        const habitacionesHTML = (r.habitaciones || []).map(h => {
          const habData = habitaciones.find(x => x.id === h.id_habitacion);
          const nombre = habData?.nombre || `Habitación N°${h.id_habitacion}`;
          const tipo = habData?.tipo || "—";
          const precio = Number(h.precio_noche_arg).toLocaleString("es-AR");
          const subtotal = (h.precio_noche_arg * (h.noches || 1)).toLocaleString("es-AR");
          return `
            <tr>
              <td>${nombre}</td>
              <td>${tipo}</td>
              <td>$${precio}</td>
              <td>${h.noches}</td>
              <td class="fw-bold text-success">$${subtotal}</td>
            </tr>
          `;
        }).join("") || "<tr><td colspan='5' class='text-muted'>Sin detalles disponibles</td></tr>";

        return `
          <tr>
            <td>${r.id}</td>
            <td>${r.fecha_entrada}</td>
            <td>${r.fecha_salida}</td>
            <td>${r.noches}</td>
            <td>$${r.total_arg?.toLocaleString("es-AR") || "-"}</td>
            <td class="fw-bold ${colorEstado} text-uppercase">${r.estado}</td>
            <td class="d-flex flex-column gap-1">
              ${botonExpandir}
              ${botonCancelar}
            </td>
          </tr>
          <tr class="collapse bg-light" id="habitaciones-${i}">
            <td colspan="7">
              <div class="p-3">
                <h6 class="text-success mb-3 fw-bold">Habitaciones incluidas</h6>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm align-middle mb-0">
                    <thead class="table-success">
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Precio / noche</th>
                        <th>Noches</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>${habitacionesHTML}</tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Cambiar icono al expandir/achicar
    document.querySelectorAll(".toggle-detalle").forEach(btn => {
      btn.addEventListener("click", () => {
        const icon = btn.querySelector("i");
        const expanded = btn.getAttribute("aria-expanded") === "true";
        setTimeout(() => {
          icon.className = expanded ? "bi bi-chevron-down" : "bi bi-chevron-up";
        }, 250);
      });
    });

    // Cancelar reservas
    let reservaAEliminar = null;

    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("cancelar-btn")) {
        reservaAEliminar = e.target.dataset.id;
        const modal = new bootstrap.Modal(document.getElementById("modalConfirmarCancelacion"));
        modal.show();
      }
    });

    document.getElementById("btnConfirmarCancelacion").addEventListener("click", async () => {
      if (!reservaAEliminar) return;

      try {
        const res = await fetch(`http://localhost:5000/reservas/${reservaAEliminar}/cancelar`, { method: "PUT" });
        if (!res.ok) throw new Error("Error al cancelar reserva");
        const data = await res.json();
        console.log("✅ Reserva cancelada:", data);
        mostrarToast("🗓️ Reserva cancelada correctamente.", "success");

        const modal = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarCancelacion"));
        modal.hide();

        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        console.error("❌ Error al cancelar:", err);
        mostrarToast("❌ No se pudo cancelar la reserva.", "error");
      } finally {
        reservaAEliminar = null;
      }
    });
  }
  catch (error) {
    console.error("❌ Error al cargar reservas:", error);
    mostrarToast("❌ No se pudieron obtener tus reservas.", "error");
  }
});