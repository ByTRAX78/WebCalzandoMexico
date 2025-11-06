// Importar 'dotenv' para cargar variables de entorno desde .env
// (Asegúrate de haber corrido 'npm install dotenv')
require('dotenv').config();

// Importar Express
const express = require('express');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Especificación OpenAPI
    info: {
      title: 'API de Hackaton (Calzando a México)',
      version: '1.0.0',
      description: 'Documentación de la API para el proyecto de la Hackaton',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Tu servidor base
      },
    ],
  },
  // La clave 'apis' le dice a swagger-jsdoc dónde buscar tus rutas
  apis: ['../src/routes/*.js'], // Patrón para encontrar archivos de rutas
};

// Genera la especificación OpenAPI basada en las opciones
const openapiSpec = swaggerJsdoc(swaggerOptions);

const app = express();

const mainRouter = require('../src/routes')

// Leer el puerto desde las variables de entorno (o usar 3000 por defecto)
const PORT = process.env.PORT || 3000;

// === RUTAS ===
app.get('/api', mainRouter)

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// === INICIAR SERVIDOR ===

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});