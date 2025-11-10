import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { conectarDB } from "./database.js";
import usuariosRoutes, {verificarToken} from "./routes/usuarios.js";
import habitacionesRoutes from "./routes/habitaciones.js";
import reservasRoutes from "./routes/reservas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
conectarDB();

app.use("/usuarios", usuariosRoutes);
app.use("/habitaciones", habitacionesRoutes);
app.use("/reservas", verificarToken, reservasRoutes);

// Ruta protegida
app.post("/reservas", verificarToken, reservasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});