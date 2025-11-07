import { getHabitaciones, getReservas, getHabitacionesDisponibles } from "./api.js";

let listaHabitaciones = [];
let listaReservas = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    listaHabitaciones = asignarImagenes(await getHabitaciones());
    listaReservas = await getReservas();
    renderHabitaciones(listaHabitaciones);
    validarFechas();
  } catch (error) {
    console.error("Error al cargar datos:", error);
    document.getElementById("habitaciones").innerHTML = `
      <p class="text-center text-danger">Error al cargar las habitaciones o reservas.</p>`;
  }

  document.getElementById("btnFiltrar").addEventListener("click", aplicarFiltros);
  document.getElementById("btnBuscar").addEventListener("click", aplicarFiltros);

  document.getElementById("fechaInicio").addEventListener("input", actualizarBotonesFechas);
  document.getElementById("fechaFin").addEventListener("input", actualizarBotonesFechas);

  function actualizarBotonesFechas() {
    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;
    const fechasValidas = inicio && fin && fin > inicio;

    document.querySelectorAll(".agregar-btn").forEach(btn => {
      if (fechasValidas) {
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-outline-success");
        btn.disabled = false;
      } else {
        btn.classList.add("btn-secondary");
        btn.classList.remove("btn-outline-success");
        btn.disabled = true;
      }
    });
  }
});

// Validar fechas
function validarFechas() {
  const hoy = new Date().toISOString().split("T")[0];
  const inicioInput = document.getElementById("fechaInicio");
  const finInput = document.getElementById("fechaFin");

  inicioInput.setAttribute("min", hoy);
  finInput.setAttribute("min", hoy);
  finInput.setAttribute("disabled", true);

  inicioInput.addEventListener("input", () => {
    if (inicioInput.value) {
      finInput.removeAttribute("disabled");
      finInput.setAttribute("min", inicioInput.value);
      if (finInput.value && finInput.value < inicioInput.value) {
        finInput.value = "";
      }
    } else {
      finInput.value = "";
      finInput.setAttribute("disabled", true);
    }
  });
}

// Aplicar filtros
async function aplicarFiltros() {
  const tipo = document.getElementById("filtroTipo").value.trim().toLowerCase();
  const inicio = document.getElementById("fechaInicio").value;
  const fin = document.getElementById("fechaFin").value;

  // Validar fechas
  if (inicio && fin && fin < inicio) {
    alert("⚠️ La fecha de salida no puede ser anterior a la fecha de entrada.");
    return;
  }

  // Si hay fechas: pedir disponibilidad al backend
  if (inicio && fin) {
    localStorage.setItem("fechaInicio", inicio);
    localStorage.setItem("fechaFin", fin);
    try {
      const disponibles = await getHabitacionesDisponibles(inicio, fin);

      const filtradas = tipo
        ? disponibles.filter(h => h.tipo && h.tipo.trim().toLowerCase() === tipo)
        : disponibles;

      const adaptadas = asignarImagenes(filtradas.map(h => ({
        ...h,
        ocupada: !h.disponible
      })));

      renderHabitaciones(adaptadas);
    } catch (error) {
      console.error("Error al obtener disponibilidad:", error);
      alert("❌ No se pudo obtener la disponibilidad desde el servidor.");
    }
  } else {
    // Sin fechas: filtrado local
    const filtradas = tipo
      ? listaHabitaciones.filter(h => h.tipo && h.tipo.trim().toLowerCase() === tipo)
      : listaHabitaciones;

    renderHabitaciones(filtradas);
  }
}

// Imágenes de las habitaciones
const imagenesHabitaciones = {
  "Casona - Habitación N° 3": "img/habitacion-doble.jpg",
  "Casona - Habitación N° 4": "img/habitacion-triple.jpg",
  "Galería - Habitación 14": "img/habitacion-suite.jpg",
  "Chalet del Alto": "img/chalet_del_alto.jpg",
  "La Isla": "img/isla.jpg"
};

// Asigna las imágenes por nombre
function asignarImagenes(habitaciones) {
  return habitaciones.map(h => ({
    ...h,
    imagen: imagenesHabitaciones[h.nombre] || "img/habitacion-default.jpg"
  }));
}

// Habitaciones
function renderHabitaciones(habitaciones) {
  const contenedor = document.getElementById("habitaciones");
  const inicio = document.getElementById("fechaInicio").value;
  const fin = document.getElementById("fechaFin").value;
  const fechasValidas = inicio && fin && fin > inicio;

  if (!Array.isArray(habitaciones) || habitaciones.length === 0) {
    contenedor.innerHTML = `<p class="text-center text-muted">No hay habitaciones disponibles.</p>`;
    return;
  }

  contenedor.innerHTML = habitaciones.map(h => `
    <div class="col-12 col-md-6 col-lg-4 fade-in">
      <div class="card shadow-sm border-0 h-100 ${h.ocupada ? "opacity-50" : ""}">
        <img src="${h.imagen || 'img/habitacion-default.jpg'}" class="card-img-top" alt="${h.nombre}">
        <div class="card-body text-center">
          <h5 class="card-title fw-bold">${h.nombre}</h5>
          <p class="mb-1">Tipo: ${h.tipo}</p>
          <p class="mb-2">Capacidad: ${h.capacidad} personas</p>
          <p class="fw-bold text-success">$${Number(h.precio_noche_arg).toLocaleString('es-AR')} / noche</p>
          ${h.ocupada
      ? `<button class="btn btn-secondary px-3" disabled>Ocupada</button>`
      : `<button class="btn ${fechasValidas ? "btn-outline-success" : "btn-secondary"} px-3 agregar-btn" 
                     data-id="${h.id}" ${fechasValidas ? "" : "disabled"}>Agregar a reserva</button>`
    }
        </div>
      </div>
    </div>
  `).join("");

  // Eventos de los botones
  document.querySelectorAll(".agregar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      agregarAlCarrito(id);
    });
  });
}

// Agregar habitación al carrito
window.agregarAlCarrito = function (id) {
  const inicio = localStorage.getItem("fechaInicio");
  const fin = localStorage.getItem("fechaFin");
  const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

  // Validar usuario logueado
  if (!usuario) {
    mostrarToast("⚠️ Debes iniciar sesión para reservar una habitación.", "warning");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1800);
    return;
  }

  // Validar fechas seleccionadas
  if (!inicio || !fin) {
    mostrarToast("Seleccioná las fechas antes de agregar una habitación.", "warning");
    return;
  }

  // Obtener habitación seleccionada
  const habitacion = listaHabitaciones.find(h => h.id === id);
  if (!habitacion) {
    mostrarToast("❌ No se encontró la habitación seleccionada.", "error");
    return;
  }

  // Cargar carrito actual y verificar duplicados
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const yaExiste = carrito.some(h => h.id === id);

  if (yaExiste) {
    mostrarToast("ℹ️ Esta habitación ya está en tu carrito.", "info");
    return;
  }

  // Agregar habitación al carrito
  carrito.push(habitacion);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  mostrarToast(`🛏️ ${habitacion.nombre} agregada a la reserva.`, "success");
};
