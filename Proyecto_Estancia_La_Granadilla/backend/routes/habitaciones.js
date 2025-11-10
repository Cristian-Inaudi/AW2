import express from "express";
import Habitacion from "../models/Habitacion.js";
import Reserva from "../models/Reserva.js";

const router = express.Router();

// Función para detectar si dos rangos de fechas se solapan
function fechasSolapan(entrada1, salida1, entrada2, salida2) {
  return entrada1 <= salida2 && salida1 >= entrada2;
}

// GET → Habitaciones disponibles en un rango
router.get("/disponibles", async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    if (!inicio || !fin) {
      return res.status(400).json({ error: "Faltan parámetros de fecha." });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    // 1️⃣ Obtener todas las habitaciones
    const habitaciones = await Habitacion.find();

    // 2️⃣ Obtener reservas activas (pendientes o confirmadas)
    const reservasActivas = await Reserva.find({
      estado: { $in: ["pendiente", "confirmada"] },
    });

    // 3️⃣ Calcular disponibilidad
    const resultado = habitaciones.map((hab) => {
      const ocupada = reservasActivas.some((reserva) =>
        reserva.habitaciones.some(
          (h) =>
            h.id_habitacion === hab._id.toString() &&
            fechasSolapan(
              new Date(reserva.fecha_entrada),
              new Date(reserva.fecha_salida),
              fechaInicio,
              fechaFin
            )
        )
      );

      return {
        ...hab.toObject(),
        disponible: !ocupada,
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en /habitaciones/disponibles:", error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
});

// GET → Todas las habitaciones
router.get("/", async (req, res) => {
  try {
    const habitaciones = await Habitacion.find();
    res.json(habitaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener habitaciones" });
  }
});

export default router;
