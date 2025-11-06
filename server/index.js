// Importar 'dotenv' para cargar variables de entorno desde .env
require('dotenv').config();

// Importar Express
const express = require('express');
// Importar Redis y UUID
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

// === MIDDLEWARE ===
app.use(express.json());
app.use(cors());

// === CONEXIÓN A REDIS ===
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Función de 'wrapper' para conectar y manejar los endpoints
async function startServer() {
  try {
    await redisClient.connect();
    console.log('Conectado a Redis exitosamente.');
  } catch (err) {
    console.error('No se pudo conectar a Redis:', err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;

  // === RUTAS ===
  app.get('/', (req, res) => {
    res.send('¡Hola Hackaton!');
  });

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // --- API DE INVENTARIO (LÓGICA ACTUALIZADA) ---

  /**
   * EP 1: CARGAR UN PRODUCTO (CON PIEZAS)
   * POST /api/inventario
   *
   * Body esperado:
   * {
   * "categoria": "calzado-hombre",
   * "producto": { "marca": "Nike", "modelo": "Air", "talla": "27", "piezas": 10 }
   * }
   */
  app.post('/api/inventario', async (req, res) => {
    try {
      const { categoria, producto } = req.body;

      // Validación de que el producto y sus campos existan
      if (!categoria || !producto || !producto.marca || !producto.talla || !producto.piezas) {
        return res.status(400).send({ error: 'Faltan campos: "categoria" o "producto" (con marca, talla y piezas).' });
      }
      
      // Convertimos piezas a número para asegurar
      producto.piezas = Number(producto.piezas);

      if (isNaN(producto.piezas) || producto.piezas <= 0) {
         return res.status(400).send({ error: 'El número de piezas debe ser mayor a 0.' });
      }

      const productoId = uuidv4();
      const redisKey = `inventario:${categoria}`;
      const productoJson = JSON.stringify(producto); // { "marca": "...", "piezas": 10 }

      // Guardamos el producto en el Hash
      await redisClient.hSet(redisKey, productoId, productoJson);

      res.status(201).send({
        message: 'Producto añadido con stock',
        id: productoId,
        categoria: categoria,
        producto: producto
      });

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al guardar en Redis' });
    }
  });

  /**
   * EP 2: OBTENER TODOS LOS PRODUCTOS (CON PIEZAS)
   * GET /api/inventario/:categoria
   */
  app.get('/api/inventario/:categoria', async (req, res) => {
    try {
      const { categoria } = req.params;
      const redisKey = `inventario:${categoria}`;

      const productosHash = await redisClient.hGetAll(redisKey);

      if (!productosHash || Object.keys(productosHash).length === 0) {
        // Devolvemos un array vacío si no hay productos, lo cual no es un error
        return res.status(200).send([]);
      }

      // Deserializamos los productos
      const productosArray = Object.entries(productosHash).map(([id, jsonProducto]) => {
        const producto = JSON.parse(jsonProducto);
        return {
          id: id, // ID de Redis
          ...producto // marca, modelo, talla, piezas
        };
      });

      res.status(200).send(productosArray);

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al leer de Redis' });
    }
  });

  /**
   * EP 3: VENDER (RESTAR 1 PIEZA) UN PRODUCTO
   * DELETE /api/inventario/:categoria/:id
   *
   * Esta ruta ahora significa "vender 1 unidad".
   * Resta 1 a "piezas". Si "piezas" llega a 0, borra el registro.
   */
  app.delete('/api/inventario/:categoria/:id', async (req, res) => {
    try {
      const { categoria, id } = req.params;
      const redisKey = `inventario:${categoria}`;

      // 1. Obtener el producto actual
      const productoJson = await redisClient.hGet(redisKey, id);

      if (!productoJson) {
        return res.status(404).send({ error: 'Producto no encontrado en esa categoría' });
      }

      // 2. Deserializar y restar 1
      const producto = JSON.parse(productoJson);
      
      // Asegurarnos que 'piezas' sea un número
      producto.piezas = Number(producto.piezas) - 1;

      // 3. Decidir si actualizar o eliminar
      if (producto.piezas <= 0) {
        // Si las piezas son 0 o menos, eliminar el producto del hash
        await redisClient.hDel(redisKey, id);
        res.status(200).send({ 
          message: 'Producto vendido. Stock agotado. Registro eliminado.', 
          idVendido: id,
          piezasRestantes: 0
        });
      } else {
        // Si quedan piezas, actualizar el producto en el hash
        const productoActualizadoJson = JSON.stringify(producto);
        await redisClient.hSet(redisKey, id, productoActualizadoJson);
        res.status(200).send({ 
          message: 'Producto vendido. Stock actualizado.', 
          idVendido: id,
          piezasRestantes: producto.piezas 
        });
      }

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al actualizar/eliminar de Redis' });
    }
  });


  // === INICIAR SERVIDOR ===
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

// Iniciar el servidor
startServer();