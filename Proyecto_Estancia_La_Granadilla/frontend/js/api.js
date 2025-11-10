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

// Crear una nueva reserva - Protegida con token
export async function crearReserva(reserva) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(reserva)
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Error del backend:", data);
    throw new Error(data.error || "Error al crear la reserva");
  }

  return data;
}

// Obtener todas las reservas registradas
export async function getReservas() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/reservas`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

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

  localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));
  localStorage.setItem("token", data.token);

  return data;
}
