import express from "express";
import Reserva from "../models/Reserva.js";
import Usuario from "../models/Usuario.js";
import Habitacion from "../models/Habitacion.js";

const router = express.Router();

// Función para verificar si se solapan fechas
const fechasSolapan = (entrada1, salida1, entrada2, salida2) => {
  return (entrada1 <= salida2) && (salida1 >= entrada2);
};

// GET → todas las reservas
router.get("/", async (req, res) => {
  try {
    const reservas = await Reserva.find();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al leer las reservas", detalle: error.message });
  }
});

// POST → crear nueva reserva
router.post("/", async (req, res) => {
  try {
    const { id_usuario, fecha_entrada, fecha_salida, habitaciones } = req.body;

    if (!id_usuario || !fecha_entrada || !fecha_salida || !habitaciones?.length) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // Validar usuario
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar existencia de habitaciones
    const habitacionesBD = await Habitacion.find();

    for (const hab of habitaciones) {
      const idHabitacion = hab.id_habitacion || hab._id || hab.id;
      const existe = habitacionesBD.find(h =>
        h._id.equals(idHabitacion?.toString())
      );

      if (!existe) {
        console.warn("⚠️ No se encontró la habitación:", idHabitacion, "→ existentes:", habitacionesBD.map(h => h._id.toString()));
        return res.status(404).json({ error: `Habitación con id ${idHabitacion} no encontrada` });
      }
      // Verificar disponibilidad
      const reservasActivas = await Reserva.find({ estado: { $in: ["pendiente", "confirmada"] } });

      for (const r of reservasActivas) {
        for (const h of r.habitaciones) {
          if (h.id_habitacion === hab.id_habitacion) {
            if (fechasSolapan(new Date(fecha_entrada), new Date(fecha_salida),
              new Date(r.fecha_entrada), new Date(r.fecha_salida))) {
              return res.status(400).json({
                error: `La habitación ${existe.nombre} no está disponible entre ${fecha_entrada} y ${fecha_salida}`
              });
            }
          }
        }
      }
    }

    // Crear la nueva reserva
    const noches = Math.ceil((new Date(fecha_salida) - new Date(fecha_entrada)) / (1000 * 60 * 60 * 24));
    const total_arg = habitaciones.reduce((acc, h) => acc + (h.precio_noche_arg * noches), 0);

    const nuevaReserva = new Reserva({
      id_usuario,
      fecha_creacion: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      fecha_entrada,
      fecha_salida,
      noches,
      habitaciones,
      total_arg,
      pagos: []
    });

    await nuevaReserva.save();

    res.status(201).json({
      mensaje: "Reserva creada correctamente",
      reserva: nuevaReserva
    });

  } catch (error) {
    console.error("❌ Error al crear la reserva:", error);
    res.status(500).json({ error: "Error al crear la reserva", detalle: error.message });
  }
});

// PUT → cancelar una reserva
router.put("/:id/cancelar", async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findById(id);
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

    if (["cancelada", "finalizada"].includes(reserva.estado)) {
      return res.status(400).json({ error: `La reserva ya está ${reserva.estado}` });
    }

    reserva.estado = "cancelada";
    reserva.cancelacion = {
      fecha: new Date().toISOString().split("T")[0],
      politica: "Cancelación manual",
      retenido_ars: 0,
      devuelto_ars: 0,
      medio_devolucion: null
    };

    await reserva.save();

    res.status(200).json({ mensaje: "Reserva cancelada correctamente", reserva });

  } catch (error) {
    res.status(500).json({ error: "Error al cancelar la reserva", detalle: error.message });
  }
});

export default router;
