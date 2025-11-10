import mongoose from "mongoose";

const habitacionReservaSchema = new mongoose.Schema({
  id_habitacion: { type: String, required: true },
  precio_noche_arg: Number,
  noches: Number
}, { _id: false });

const reservaSchema = new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  fecha_entrada: String,
  fecha_salida: String,
  noches: Number,
  estado: { type: String, default: "pendiente" },
  habitaciones: [habitacionReservaSchema],
  total_arg: Number,
  pagos: Array
});

export default mongoose.model("Reserva", reservaSchema);
