import express from "express";
import fs from "fs";

const router = express.Router();

const filePath = "./data/habitaciones.json";

const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// GET --> Obtiene todas las habitaciones
router.get("/", (req, res) => {
  try {
    const habitaciones = readData();
    res.status(200).json(habitaciones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer las habitaciones", error: error.message });
  }
});

// PUT --> Actualiza una habitación
router.put("/:id", (req, res) => {
  try {
    const habitaciones = readData();
    const id = parseInt(req.params.id);
    const index = habitaciones.findIndex(h => h.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    // Lista de campos permitidos
    const camposValidos = ["nombre", "tipo", "capacidad", "precio_noche_arg", "ubicacion", "activa", "imagen"];
    const camposRecibidos = Object.keys(req.body);
    const camposInvalidos = camposRecibidos.filter(key => !camposValidos.includes(key));

    if (camposInvalidos.length > 0) {
      return res.status(400).json({
        error: `Campos no permitidos: ${camposInvalidos.join(", ")}`,
        permitidos: camposValidos
      });
    }

    // Actualiza solo los campos válidos
    for (let key of camposRecibidos) {
      habitaciones[index][key] = req.body[key];
    }

    writeData(habitaciones);

    res.status(200).json({
      mensaje: "Habitación actualizada correctamente",
      habitacion: habitaciones[index]
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la habitación", error: error.message });
  }
});

// POST --> Crea una nueva habitación
router.post("/", (req, res) => {
  try {
    const habitaciones = readData();
    const { nombre, tipo, capacidad, precio_noche_arg, ubicacion, activa, imagen } = req.body;

    if (!nombre || !tipo || !capacidad || !precio_noche_arg || !ubicacion) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: nombre, tipo, capacidad, precio_noche_arg, ubicacion"
      });
    }
    
    //Valida que no exista actualmente la habitación registrada
    if (habitaciones.some(h => h.nombre === nombre)) {
      return res.status(400).json({ error: "Ya existe una habitación con ese nombre" });
    }

    const nuevaHabitacion = {
      id: Date.now(),
      nombre,
      tipo,
      capacidad,
      precio_noche_arg,
      ubicacion,
      activa: activa ?? true,
      imagen: imagen ?? null
    };

    habitaciones.push(nuevaHabitacion);
    writeData(habitaciones);

    res.status(201).json({
      mensaje: "Habitación creada correctamente",
      habitacion: nuevaHabitacion
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la habitación", error: error.message });
  }
});

export default router;
