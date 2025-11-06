// Importar 'dotenv' para cargar variables de entorno desde .env
// (Asegúrate de haber corrido 'npm install dotenv')
require('dotenv').config();

// Importar Express
const express = require('express');
const app = express();

// Leer el puerto desde las variables de entorno (o usar 3000 por defecto)
const PORT = process.env.PORT || 3000;

// === RUTAS ===

// Ruta principal (homepage)
app.get('/', (req, res) => {
  res.send('¡Hola Hackaton!');
});

// (NUEVO) Ruta de Health Check
// Docker (y otros servicios) usarán esto para saber si tu app está viva.
app.get('/health', (req, res) => {
  res.status(200).send('OK');
  // En un proyecto real, aquí también podrías checar la conexión a la DB.
});

// === INICIAR SERVIDOR ===

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});