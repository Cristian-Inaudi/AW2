import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// GET → Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios", detalle: error.message });
  }
});

// POST → Registrar un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, contrasena } = req.body;

    if (!nombre || !apellido || !email || !telefono || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    // Validar duplicado
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Ya existe un usuario con ese email." });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      telefono,
      contrasena: hashedPassword,
      es_admin: false,
      activo: true,
      preferencias_habitaciones: [],
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario", detalle: error.message });
  }
});

// POST → Login
router.post("/login", async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña encriptada
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT - Expira en 2 horas
    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        es_admin: user.es_admin,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno en login", detalle: error.message });
  }
});

// DELETE → Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    await Usuario.findByIdAndDelete(id);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario", detalle: error.message });
  }
});

// Middleware → Verificar token JWT
export const verificarToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default router;
