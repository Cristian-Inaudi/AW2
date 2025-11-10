import mongoose from "mongoose";

const habitacionSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  capacidad: Number,
  precio_noche_arg: Number,
  disponible: Boolean,
  imagen: String
});

export default mongoose.model("Habitacion", habitacionSchema);
