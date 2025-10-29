const express = require("express");
const fs = require("fs");
const router = express.Router();

const filePath = "./data/usuarios.json";

const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// GET → Obtiene todos los usuarios
router.get("/", (req, res) => {
  try {
    const usuarios = readData();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer usuarios", error: error.message });
  }
});

// GET → Obtiene un usuario por ID
router.get("/:id", (req, res) => {
  try {
    const usuarios = readData();
    const usuario = usuarios.find(u => u.id === parseInt(req.params.id));

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar usuario", error: error.message });
  }
});

// POST → Genera un nuevo usuario
router.post("/", (req, res) => {
  try {
    const usuarios = readData();
    const { nombre, apellido, email, telefono, contrasena, es_admin, activo, preferencias_habitaciones } = req.body;

    // Validación básica
    if (!nombre || !apellido || !email || !telefono || !contrasena) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: nombre, apellido, email, telefono, contrasena"
      });
    }

    // Validar duplicado por email
    if (usuarios.some(u => u.email === email)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese email" });
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      apellido,
      email,
      telefono,
      contrasena,
      es_admin: es_admin ?? false,
      activo: activo ?? true,
      preferencias_habitaciones: preferencias_habitaciones ?? []
    };

    usuarios.push(nuevoUsuario);
    writeData(usuarios);

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear usuario", error: error.message });
  }
});

// DELETE → Elimina un usuario, en caso de no tener reservas
router.delete("/:id", (req, res) => {
  try {
    const usuarios = readData();
    const reservas = JSON.parse(fs.readFileSync("./data/reservas.json"));
    const id = parseInt(req.params.id);

    // Evita eliminar si tiene reservas activas
    if (reservas.some(r => r.id_usuario === id)) {
      return res.status(400).json({ error: "No se puede eliminar usuario con reservas activas" });
    }

    const filtrados = usuarios.filter(u => u.id !== id);

    if (filtrados.length === usuarios.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    writeData(filtrados);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
  }
});

module.exports = router;