# Proyecto Estancia La Granadilla 
### Gestión de **usuarios**, **habitaciones** y **reservas**

## Endpoints

### Usuarios
- GET:      /usuarios          → devuelve todos los usuarios.
- GET:      /usuarios/:id      → devuelve un usuario específico.
- POST:     /usuarios          → crea un nuevo usuario.
- DELETE:   /usuarios/:id      → elimina un usuario (solo si no tiene reservas activas).

### Habitaciones
- GET:      /habitaciones      → devuelve todas las habitaciones.
- POST:     /habitaciones      → crea una nueva habitación.
- PUT:      /habitaciones/:id  → actualiza datos de una habitación.

### Reservas
- GET:      /reservas          → devuelve todas las reservas.
- POST:     /reservas          → crea una nueva reserva.
- PUT:      /reservas/:id/cancelar  → cancela una reserva.


## Ejecución
node index.js

## Servidor
Servidor en: `http://localhost:5000`
