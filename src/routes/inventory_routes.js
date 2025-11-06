const { Router } = require('express');
const router = Router();

// === 1. RUTAS DE VISIBILIDAD E INFORMACIÓN ===

// Consulta de Inventario en Tiempo Real [cite: 10]
// Permite al POS y al Dashboard saber qué hay en Bodega, Piso, y Merma.
router.get('/consulta/:sku', (req, res) => {
  const { sku } = req.params;
  // Simulación: Una consulta real a la base de datos
  res.json({
    sku: sku,
    description: `Calzado Casual Hombre Modelo ${sku}`,
    inventarioTotal: 150,
    ubicaciones: {
      bodega: 120,          // Disponible para surtido
      pisoVenta: 25,        // En exhibición
      merma: 5,             // Producto dañado/obsoleto
    },
    timestamp: new Date().toISOString()
  });
});

// Interfaz para configurar Puntos de Reorden (mínimos de exhibición) [cite: 11]
// Usada por el Subgerente Comercial para Resurtido Proactivo.
router.put('/parametros-resurtido', (req, res) => {
  // Asumiendo que se recibe en req.body { sku: 'XYZ', puntoReorden: 10 }
  res.status(200).json({
    message: 'Parámetros de Punto de Reorden actualizados con éxito.',
    action: 'El SGT disparará resurtido automático si el inventario de piso cae debajo de este punto.'
  });
});

// === 2. RUTAS DE TAREAS Y EJECUCIÓN OPERATIVA (Handheld) ===

// Recibe la notificación de venta desde el POS para disparar el resurtido [cite: 20, 21]
// Habilita el Flujo TO-BE 2.
router.post('/venta-trigger', (req, res) => {
  // Asumiendo que se recibe en req.body { sku: 'XYZ', cantidadVendida: 1 }
  const { sku } = req.body; 
  // La lógica del SGT (Node.js backend) se ejecuta aquí:
  // 1. Descuenta del inventario de "Piso de Venta" [cite: 23]
  // 2. Evalúa si el inventario < Punto de Reorden [cite: 23]
  // 3. Crea la tarea:
  res.status(202).json({
    status: 'Procesado',
    sku: sku,
    tareaGenerada: 'Tarea de Resurtido P1 (Prioridad Automática) creada para Asociado Operativo.',
  });
});

// Aprobación de Ajustes (Desde el Dashboard Web) [cite: 9]
// Usado por Subgerente/Gerente después de una Alerta de Discrepancia.
router.put('/ajustes-aprobacion/:id', (req, res) => {
  const { id } = req.params;
  // Lógica: Actualiza el inventario en la DB.
  res.status(200).json({
    ajusteId: id,
    message: 'Ajuste de inventario aprobado. Inventario actualizado en el sistema.'
  });
});

module.exports = router;