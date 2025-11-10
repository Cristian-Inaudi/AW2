import fs from "fs";
import mongoose from "mongoose";
import Usuario from "./models/Usuario.js";
import Habitacion from "./models/Habitacion.js";
import Reserva from "./models/Reserva.js";

const MONGO_URL = "mongodb+srv://usr_lg_admin:usr_lg_admin@clustergranadilla.hxqq05d.mongodb.net/?appName=ClusterGranadilla";

const migrar = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado a MongoDB Atlas");

    // Limpieza previa
    await Usuario.deleteMany({});
    await Habitacion.deleteMany({});
    await Reserva.deleteMany({});
    console.log("Limpieza antes de migrar");

    // USUARIOS
    const usuarios = JSON.parse(fs.readFileSync("./data/usuarios.json", "utf-8"));
    let idMap = {};
    if (usuarios.length > 0) {
      const nuevosUsuarios = await Usuario.insertMany(usuarios);
      console.log(`${usuarios.length} usuarios migrados`);
      usuarios.forEach((u, i) => {
        idMap[u.id] = nuevosUsuarios[i]._id;
      });
    }

    // HABITACIONES
    const habitaciones = JSON.parse(fs.readFileSync("./data/habitaciones.json", "utf-8"));
    if (habitaciones.length > 0) {
      await Habitacion.insertMany(habitaciones);
      console.log(`${habitaciones.length} habitaciones migradas`);
    }

    // RESERVAS
    const reservas = JSON.parse(fs.readFileSync("./data/reservas.json", "utf-8"));
    if (reservas.length > 0) {
      const reservasAjustadas = reservas.map(r => ({
        ...r,
        id_usuario: idMap[r.id_usuario] || null,
      }));

      const reservasValidas = reservasAjustadas.filter(r => r.id_usuario !== null);
      await Reserva.insertMany(reservasValidas);
      console.log(`${reservasValidas.length} reservas migradas`);
    }

    console.log("Migración completada con éxito");
    process.exit(0);

  } catch (error) {
    console.error("Error durante la migración:", error);
    process.exit(1);
  }
};

migrar();
