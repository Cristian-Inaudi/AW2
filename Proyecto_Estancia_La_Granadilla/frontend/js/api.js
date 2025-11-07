const API_URL = "http://localhost:5000";

// Obtener listado de habitaciones
export async function getHabitaciones() {
  const res = await fetch(`${API_URL}/habitaciones`);
  if (!res.ok) throw new Error("Error al obtener habitaciones");
  return res.json();
}

// Obtener habitaciones disponibles
export async function getHabitacionesDisponibles(inicio, fin) {
  const res = await fetch(`${API_URL}/habitaciones/disponibles?inicio=${inicio}&fin=${fin}`);
  if (!res.ok) throw new Error("Error al obtener disponibilidad");
  return res.json();
}

// Crear una nueva reserva
export async function crearReserva(reserva) {
  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reserva)
  });

  if (!res.ok) {
    const errData = await res.json();
    console.error("❌ Error del backend:", errData);
    throw new Error(errData.error || "Error al crear la reserva");
  }
  return res.json();
}

// Obtener todas las reservas registradas
export async function getReservas() {
  const res = await fetch(`${API_URL}/reservas`);
  if (!res.ok) throw new Error("Error al obtener reservas");
  return res.json();
}

// Crear usuario
export async function crearUsuario(usuario) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar usuario");

  return data.usuario;
}

// Iniciar sesión
export async function loginUsuario(email, contrasena) {
  const res = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, contrasena }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en el inicio de sesión");
  return data;
}
