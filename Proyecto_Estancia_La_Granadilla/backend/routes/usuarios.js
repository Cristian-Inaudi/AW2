import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../data/usuarios.json");

const router = express.Router();

// Leer y escribir JSON
const readData = () => JSON.parse(fs.readFileSync(filePath, "utf-8"));
const writeData = (data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// GET → Obtener todos los usuarios
router.get("/", (req, res) => {
  try {
    const usuarios = readData();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al leer usuarios", detalle: error.message });
  }
});

// POST → Registrar un nuevo usuario
router.post("/", (req, res) => {
  try {
    const usuarios = readData();
    const { nombre, apellido, email, telefono, contrasena } = req.body;

    if (!nombre || !apellido || !email || !telefono || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // Validar duplicado
    if (usuarios.some((u) => u.email === email)) {
      return res.status(400).json({ error: "Ya existe un usuario con ese email." });
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      apellido,
      email,
      telefono,
      contrasena,
      es_admin: false,
      activo: true,
      preferencias_habitaciones: [],
    };

    usuarios.push(nuevoUsuario);
    writeData(usuarios);

    res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario", detalle: error.message });
  }
});

// POST → Login
router.post("/login", (req, res) => {
  try {
    const { email, contrasena } = req.body;
    const usuarios = readData();

    const user = usuarios.find(
      (u) => u.email === email && u.contrasena === contrasena
    );

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.status(200).json({ mensaje: "Login exitoso", usuario: user });
  } catch (error) {
    res.status(500).json({ error: "Error interno en login", detalle: error.message });
  }
});

// DELETE → Eliminar usuario (solo si no tiene reservas)
router.delete("/:id", (req, res) => {
  try {
    const usuarios = readData();
    const reservas = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/reservas.json"))
    );

    const id = parseInt(req.params.id);

    if (reservas.some((r) => r.id_usuario === id)) {
      return res
        .status(400)
        .json({ error: "No se puede eliminar usuario con reservas activas." });
    }

    const filtrados = usuarios.filter((u) => u.id !== id);
    if (filtrados.length === usuarios.length) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    writeData(filtrados);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario", detalle: error.message });
  }
});

export default router;
