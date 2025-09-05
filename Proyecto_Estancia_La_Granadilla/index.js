import { readFile } from "node:fs/promises";

const getTotal = r => (r.total_arg ?? r.total_ars ?? 0);
const getSubtotal = it => (it.subtotal_arg ?? it.subtotal_ars ?? 0);

async function main() {
  // Lee los data/.json 
  const usuarios = JSON.parse(await readFile("data/usuarios.json", "utf8"));
  const habitaciones = JSON.parse(await readFile("data/habitaciones.json", "utf8"));
  const reservas = JSON.parse(await readFile("data/reservas.json", "utf8"));
  
  // Almacena datos de los Usuarios
  const usuariosById = Object.fromEntries(usuarios.map(u => [u.id, u]));

  // Resume conteos generales
  console.log("=== Resumen de datos ===");
  console.log(`Usuarios: ${usuarios.length}`);
  console.log(`Habitaciones: ${habitaciones.length}`);
  console.log(`Reservas: ${reservas.length}\n`);

  // Resume las reservas existentes por estado
  const porEstado = {};
  for (const r of reservas) {
    porEstado[r.estado] = (porEstado[r.estado] || 0) + 1;
  }
  console.log("Reservas por estado:", porEstado);

  // Resume total ingresos estimados por estado de reserva Confirmadas/Finalizadas
  const totalConfirmadas = reservas
    .filter(r => r.estado === "confirmada")
    .reduce((acc, r) => acc + getTotal(r), 0);

  const totalFinalizadas = reservas
    .filter(r => r.estado === "finalizada")
    .reduce((acc, r) => acc + getTotal(r), 0);

  console.log("Total estimado (confirmadas):", totalConfirmadas);
  console.log("Total facturado (finalizadas):", totalFinalizadas);

  // pendientes de seña (listado corto)
  const pendientes = reservas
    .filter(r => r.estado === "pendiente")
    .map(r => {
      const u = usuariosById[r.id_usuario] || {};
      return {
        id: r.id,
        entrada: r.fecha_entrada,
        salida: r.fecha_salida,
        nombre: u.nombre ?? "N/D",
        apellido: u.apellido ?? "",
        senia_pagada: r.senia_pagada === true,
        senia_vencimiento: r.senia_vencimiento || "s/d",
        total_arg: getTotal(r)
      };
    });

  console.log("\nResumen de reservas pendientes:");
  for (const p of pendientes) {
    console.log(
      `- #${p.id} (${p.apellido} ${p.nombre}) ${p.entrada}→${p.salida} | seña_pagada: ${p.senia_pagada} | vence: ${p.senia_vencimiento} | total_arg: ${p.total_arg}`
    );
  }
  
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});

