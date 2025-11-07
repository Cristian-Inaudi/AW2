document.addEventListener("DOMContentLoaded", () => {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contenedor = document.getElementById("carrito");
  const btnConfirmar = document.getElementById("btnConfirmar");

  const fechaInicio = localStorage.getItem("fechaInicio");
  const fechaFin = localStorage.getItem("fechaFin");

  // Calcular noches
  let noches = 1;
  if (fechaInicio && fechaFin) {
    const f1 = new Date(fechaInicio);
    const f2 = new Date(fechaFin);
    noches = Math.max(1, Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24)));
  }

  // Función para renderizar
  function renderCarrito() {
    if (carrito.length === 0) {
      contenedor.innerHTML = `<p class="text-center text-muted">No hay habitaciones seleccionadas.</p>`;
      btnConfirmar.classList.add("disabled");
      btnConfirmar.setAttribute("aria-disabled", "true");
      return;
    }

    btnConfirmar.classList.remove("disabled");
    btnConfirmar.removeAttribute("aria-disabled");

    let total = 0;

    contenedor.innerHTML = carrito.map((h, index) => {
      const subtotal = h.precio_noche_arg * noches;
      total += subtotal;
      return `
        <div class="col-md-6 col-lg-4">
          <div class="carrito-item position-relative text-white rounded-4 shadow-lg overflow-hidden" 
              style="background-image: url('${h.imagen || 'img/habitacion-default.jpg'}'); background-size: cover; background-position: center;">
            
            <div class="carrito-info position-relative p-4 text-center">
              <h5 class="fw-bold mb-1">${h.nombre}</h5>
              <p class="mb-1">Tipo: ${h.tipo}</p>
              <p class="fw-bold text-success bg-light px-2 py-1 d-inline-block rounded-3">$${Number(h.precio_noche_arg).toLocaleString('es-AR')} / noche</p>
              <p class="mb-0 mt-2">Noches: ${noches}</p>
              <p class="fw-bold text-light mb-3">Subtotal: $${subtotal.toLocaleString('es-AR')}</p>
              <button class="btn btn-outline-light btn-sm eliminar-btn" data-index="${index}">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    contenedor.innerHTML += `
      <div class="col-12 text-center mt-4">
        <h4>Desde: <span class="fw-bold">${fechaInicio || "-"}</span> &nbsp; Hasta: <span class="fw-bold">${fechaFin || "-"}</span></h4>
        <h4>Total por ${noches} noche(s): <span class="text-success">$${total.toLocaleString('es-AR')}</span></h4>
      </div>
    `;

    // Eliminar elecciones
    document.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        eliminarHabitacion(index);
      });
    });
  }

  function eliminarHabitacion(index) {
    const items = document.querySelectorAll(".carrito-item");
    const item = items[index];
    item.classList.add("fade-out");

    setTimeout(() => {
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    }, 400);
    mostrarToast("Habitación eliminada del carrito.", "info");
  }

  // Vaciar carrito
  document.getElementById("vaciar").addEventListener("click", () => {
    localStorage.removeItem("carrito");
    localStorage.removeItem("fechaInicio");
    localStorage.removeItem("fechaFin");

    mostrarToast("🗑️ Reserva vaciada correctamente.", "info");

    setTimeout(() => {
      location.reload();
    }, 1200);
  });

  // Render inicial
  renderCarrito();
});
