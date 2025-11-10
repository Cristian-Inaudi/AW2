import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true },
  telefono: String,
  contrasena: String,
  es_admin: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
  preferencias_habitaciones: { type: Array, default: [] }
});

export default mongoose.model("Usuario", usuarioSchema);
