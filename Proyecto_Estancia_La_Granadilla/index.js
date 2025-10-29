const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 5000;

app.use(express.json());

// Importar rutas
const usuariosRoutes = require("./routes/usuarios");
const habitacionesRoutes = require("./routes/habitaciones");
const reservasRoutes = require("./routes/reservas");

app.use("/usuarios", usuariosRoutes);
app.use("/habitaciones", habitacionesRoutes);
app.use("/reservas", reservasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
