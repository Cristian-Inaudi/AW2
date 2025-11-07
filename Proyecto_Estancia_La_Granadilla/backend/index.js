import express from "express";
import cors from "cors";

import usuariosRoutes from "./routes/usuarios.js";
import habitacionesRoutes from "./routes/habitaciones.js";
import reservasRoutes from "./routes/reservas.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRoutes);
app.use("/habitaciones", habitacionesRoutes);
app.use("/reservas", reservasRoutes);

app.get("/", (req, res) => {
  res.send("Proyecto funcionando correctamente");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});