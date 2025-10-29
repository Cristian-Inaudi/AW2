const express = require("express");
const fs = require("fs");
const router = express.Router();

const filePath = "./data/reservas.json";

const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const readUsuarios = () => JSON.parse(fs.readFileSync("./data/usuarios.json"));
const readHabitaciones = () => JSON.parse(fs.readFileSync("./data/habitaciones.json"));

// Chequea solapamiento de fechas
const fechasSolapan = (entrada1, salida1, entrada2, salida2) => {
  return (entrada1 <= salida2) && (salida1 >= entrada2);
};

// GET --> Obtiene toda las reservas
router.get("/", (req, res) => {
  try {
    const reservas = readData();
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer las reservas", error: error.message });
  }
});

// POST → Genera nueva reserva con validaciones de disponibilidad
router.post("/", (req, res) => {
  try {
    const { id_usuario, fecha_entrada, fecha_salida, habitaciones } = req.body;

    // Validación de campos obligatorios
    if (!id_usuario || !fecha_entrada || !fecha_salida || !habitaciones || habitaciones.length === 0) {
      return res.status(400).json({
        error: "Faltan datos necesarios: id_usuario, fecha_entrada, fecha_salida, habitaciones"
      });
    }

    // Validar campos no permitidos
    const camposValidos = ["id_usuario", "fecha_entrada", "fecha_salida", "habitaciones"];
    const camposRecibidos = Object.keys(req.body);
    const camposInvalidos = camposRecibidos.filter(c => !camposValidos.includes(c));

    if (camposInvalidos.length > 0) {
      return res.status(400).json({
        error: `Campos no permitidos: ${camposInvalidos.join(", ")}`,
        permitidos: camposValidos
      });
    }

    // Leer datos actuales
    const usuarios = readUsuarios();
    const habitacionesData = readHabitaciones();
    const reservas = readData();

    // Validar que el usuario exista
    const usuario = usuarios.find(u => u.id === id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar existencia y disponibilidad de habitaciones
    for (const hab of habitaciones) {
      const existe = habitacionesData.find(h => h.id === hab.id_habitacion);
      if (!existe) {
        return res.status(404).json({ error: `Habitación con id ${hab.id_habitacion} no encontrada` });
      }

      // Revisar si está ocupada en otra reserva pendiente o confirmada
      for (const reserva of reservas) {
        if (["confirmada", "pendiente"].includes(reserva.estado)) {
          for (const habRes of reserva.habitaciones) {
            if (habRes.id_habitacion === hab.id_habitacion) {
              if (fechasSolapan(
                new Date(fecha_entrada),
                new Date(fecha_salida),
                new Date(reserva.fecha_entrada),
                new Date(reserva.fecha_salida)
              )) {
                return res.status(400).json({
                  error: `La habitación ${hab.id_habitacion} no está disponible entre ${fecha_entrada} y ${fecha_salida}`
                });
              }
            }
          }
        }
      }
    }

    // Crear la nueva reserva
    const nuevaReserva = {
      id: Date.now(),
      id_usuario,
      fecha_creacion: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      fecha_entrada,
      fecha_salida,
      noches: Math.ceil((new Date(fecha_salida) - new Date(fecha_entrada)) / (1000 * 60 * 60 * 24)),
      habitaciones,
      total_arg: habitaciones.reduce((acc, h) => acc + (h.precio_noche_arg * (h.noches || 1)), 0),
      pagos: []
    };

    // Guardar y devolver respuesta
    reservas.push(nuevaReserva);
    writeData(reservas);

    res.status(201).json({
      mensaje: "Reserva creada correctamente",
      reserva: nuevaReserva
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la reserva", error: error.message });
  }
});

// PUT → Cancela una reserva
router.put("/:id/cancelar", (req, res) => {
  try {
    const reservas = readData();
    const id = parseInt(req.params.id);

    const index = reservas.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservas[index];

    // Validar que la reserva pueda cancelarse
    if (["cancelada", "finalizada"].includes(reserva.estado)) {
      return res.status(400).json({ error: `La reserva ya está ${reserva.estado}` });
    }

    // Marcar como cancelada
    reserva.estado = "cancelada";
    reserva.cancelacion = {
      fecha: new Date().toISOString().split("T")[0],
      politica: "Cancelación manual",
      retenido_ars: 0,
      devuelto_ars: 0,
      medio_devolucion: null
    };

    reservas[index] = reserva;
    writeData(reservas);

    res.status(200).json({
      mensaje: "Reserva cancelada correctamente. Habitaciones liberadas.",
      reserva
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al cancelar la reserva", error: error.message });
  }
});

module.exports = router;
