// Importar 'dotenv' para cargar variables de entorno desde .env
require('dotenv').config();

// Importar Express
const express = require('express');
// Importar Redis y UUID
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid'); // <--- AÑADIDO: Para IDs únicos
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

// Clave principal para las tareas del handheld
const TAREAS_KEY = 'handheld:tareas';

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

  // --- API DE INVENTARIO (Tu código existente) ---
  app.post('/api/inventario', async (req, res) => {
    try {
      const { categoria, producto } = req.body;
      if (!categoria || !producto) {
        return res.status(400).send({ error: 'Faltan "categoria" o "producto" en el body.' });
      }
      const productoId = uuidv4();
      const redisKey = `inventario:${categoria}`;
      const productoJson = JSON.stringify(producto);
      await redisClient.hSet(redisKey, productoId, productoJson);
      res.status(201).send({
        message: 'Producto añadido',
        id: productoId,
        producto: producto
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al guardar en Redis' });
    }
  });

  app.get('/api/inventario/:categoria', async (req, res) => {
    try {
      const { categoria } = req.params;
      const redisKey = `inventario:${categoria}`;
      const productosHash = await redisClient.hGetAll(redisKey);
      if (!productosHash || Object.keys(productosHash).length === 0) {
        return res.status(404).send({ error: 'Categoría no encontrada o vacía' });
      }
      const productosArray = Object.entries(productosHash).map(([id, jsonProducto]) => {
        const producto = JSON.parse(jsonProducto);
        return { id: id, ...producto };
      });
      res.status(200).send(productosArray);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al leer de Redis' });
    }
  });

  // Este endpoint lo requería tu página de POS.tsx
  app.delete('/api/inventario/:categoria/:id', async (req, res) => {
    try {
      const { categoria, id } = req.params;
      const redisKey = `inventario:${categoria}`;

      // 1. Obtener el producto
      const productoJson = await redisClient.hGet(redisKey, id);
      if (!productoJson) {
        return res.status(404).send({ error: 'Producto no encontrado' });
      }
      const producto = JSON.parse(productoJson);

      // 2. Simular la "venta" (reducción de 1 pieza)
      producto.piezas -= 1;

      if (producto.piezas > 0) {
        // 3. Si aún queda stock, actualizarlo
        await redisClient.hSet(redisKey, id, JSON.stringify(producto));
        res.status(200).send({ 
          message: 'Venta registrada, stock actualizado', 
          idVendido: id, 
          piezasRestantes: producto.piezas 
        });
      } else {
        // 4. Si las piezas llegan a 0, eliminar el producto
        await redisClient.hDel(redisKey, id);
        res.status(200).send({ 
          message: 'Venta registrada, producto sin stock eliminado', 
          idVendido: id, 
          piezasRestantes: 0 
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al procesar la venta' });
    }
  });

  // --- (NUEVO) API DE TAREAS ---

  /**
   * EP 1: CREAR UNA NUEVA TAREA (Para Admin)
   * POST /api/tareas
   */
  app.post('/api/tareas', async (req, res) => {
    try {
      // 'type' puede ser 'resupply', 'receipt', 'inventory', 'waste'
      const { title, subtitle, priority, type = 'resupply', assigned = 'Sin asignar' } = req.body;

      if (!title || !priority) {
        return res.status(400).send({ error: 'Faltan "title" o "priority"' });
      }
      
      const taskId = uuidv4();
      const task = {
        id: taskId,
        title,
        subtitle: subtitle || '',
        priority,
        type,
        status: 'pending',
        assigned,
        createdAt: new Date().toISOString()
      };

      await redisClient.hSet(TAREAS_KEY, taskId, JSON.stringify(task));
      
      res.status(201).send(task);

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al crear la tarea en Redis' });
    }
  });

  /**
   * EP 2: OBTENER TAREAS PENDIENTES (Para Handheld)
   * GET /api/tareas/pendientes
   */
  app.get('/api/tareas/pendientes', async (req, res) => {
    try {
      const tareasHash = await redisClient.hGetAll(TAREAS_KEY);

      if (!tareasHash || Object.keys(tareasHash).length === 0) {
        return res.status(200).send([]); // Devuelve array vacío si no hay tareas
      }

      const tareasArray = Object.values(tareasHash)
        .map(jsonTask => JSON.parse(jsonTask))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Ordenar por fecha

      res.status(200).send(tareasArray);

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al obtener tareas de Redis' });
    }
  });

  /**
   * EP 3: COMPLETAR (ELIMINAR) UNA TAREA (Para Handheld)
   * DELETE /api/tareas/:id
   */
  app.delete('/api/tareas/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await redisClient.hDel(TAREAS_KEY, id);

      if (result === 0) {
        return res.status(404).send({ error: 'Tarea no encontrada' });
      }

      res.status(200).send({ message: 'Tarea completada exitosamente', idCompletado: id });

    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al eliminar la tarea de Redis' });
    }
  });
  
  // --- (NUEVO) ENDPOINT DE PEDIDOS (Para CEDIS) ---
  // (Este lo necesitabas para 'calzando-flow/src/pages/cedis/Shipments.tsx')
  const PEDIDOS_KEY = 'cedis:pedidos';
  app.post('/api/pedidos/:id/completar', async (req, res) => {
    try {
        const { id } = req.params;
        // Aquí iría la lógica para marcarlo como completado.
        // Por ahora, solo simulamos éxito.
        console.log(`Pedido ${id} marcado como completado.`);
        // await redisClient.hSet(PEDIDOS_KEY, id, JSON.stringify(pedidoActualizado));
        res.status(200).send({ message: 'Pedido completado' });
    } catch (err) {
        res.status(500).send({ error: 'Error al completar pedido' });
    }
  });
  app.get('/api/pedidos/pendientes', async (req, res) => {
     // Simulación de respuesta, ya que no tenemos la lógica de creación
     res.status(200).send([]);
  });


  // --- ADMIN ENDPOINT ---
  app.delete('/api/admin/reset-database', async (req, res) => {
    try {
      await redisClient.flushDb();
      console.warn('¡ALERTA! Se ha limpiado toda la base de datos de Redis (flushDb).');
      res.status(200).send({ 
        message: '¡Base de datos Redis limpiada exitosamente!' 
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error interno del servidor al limpiar Redis' });
    }
  });

  // === INICIAR SERVIDOR ===
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

// Iniciar el servidor
startServer();