# Proyecto Estancia La Granadilla 
### Gestión de **usuarios**, **habitaciones** y **reservas**

## Aplicación web con backend en **Node.js + Express** que permite gestionar:
- Registro e inicio de sesión de usuarios.
- Consulta y reserva de habitaciones.
- Panel personal de reservas del usuario logueado.
- Cancelación de reservas con confirmación.

## Endpoints

### Usuarios
- GET:      /usuarios          → devuelve todos los usuarios.
- POST:     /usuarios          → crea un nuevo usuario.
- POST:     /usuarios/login    → inicia sesión con email y contraseña.
- DELETE:   /usuarios/:id      → elimina un usuario (solo si no tiene reservas activas).

### Habitaciones
- GET:      /habitaciones      → devuelve todas las habitaciones.
- POST:     /habitaciones      → crea una nueva habitación.
- PUT:      /habitaciones/:id  → actualiza datos de una habitación.

### Reservas
- GET:      /reservas          → devuelve todas las reservas.
- POST:     /reservas          → crea una nueva reserva validando disponibilidad de habitaciones.
- PUT:      /reservas/:id/cancelar  → cancela una reserva existente.


## Frontend
#### Páginas principales
- index.html → Muestra las habitaciones disponibles y permite filtrar por fechas.
- registro.html → Formulario de registro de usuarios. Al completar el registro, redirige automáticamente al login.
- login.html → Inicio de sesión de usuarios.
- carrito.html → Muestra las habitaciones seleccionadas para reservar.
- confirmacion.html → Resume la reserva y permite confirmarla.
- misreservas.html → Panel del usuario con historial de reservas, detalle de habitaciones y opción de cancelación.

## Ejecución
node index.js

## Servidor
Servidor en: `http://localhost:5000`

## Autor: Cristián Inaudi  
## Analista en Sistemas y Desarrollo de Software – IES 21
## Año: 2025
