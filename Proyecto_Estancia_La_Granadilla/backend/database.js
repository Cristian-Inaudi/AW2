import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

export const conectarDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado correctamente a MongoDB Atlas (nube)");
  } catch (error) {
    console.error("❌ Error de conexión con MongoDB Atlas:", error.message);
  }
};
