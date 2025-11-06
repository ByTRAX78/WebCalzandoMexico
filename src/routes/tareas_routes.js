const { Router } = require('express');
const router = Router();

// === 1. RUTAS DE MONITOREO Y GESTIÓN (Dashboard Web) ===

// Monitor de la Cola de Tareas BOH
// Usada por el Subgerente de Operaciones para ver todas las tareas pendientes. [cite: 298]
router.get('/cola-trabajo', (req, res) => {
  // Simulación: Tareas en cola (Recibo, Resurtido, Conteo)
  res.json({
    status: 'Activo',
    pendientes: 15,
    porPrioridad: {
      P1_Resurtido_Venta: 3, // Máxima prioridad [cite: 157]
      P2_Recibo_Programado: 1,
      P3_Conteo_Ciclico: 5
    },
    timestamp: new Date().toISOString()
  });
});

// Monitoreo de Productividad por Asociado
// Usada por el Líder de Operaciones para el coaching del equipo. [cite: 30, 299, 344]
router.get('/productividad/:idAsociado', (req, res) => {
  const { idAsociado } = req.params;
  // Simulación: Tareas completadas y tiempo promedio
  res.json({
    asociadoId: idAsociado,
    rol: 'Asociado de Operaciones (Multifuncional)',
    kpi: 'Tareas Resurtido / Hora',
    valor: 4.2, // Meta: Monitorear eficiencia [cite: 283]
    tiempoPromedio: {
      recibo: '7 min/tarima',
      resurtido: '12 min/tarea'
    },
    timestamp: new Date().toISOString()
  });
});

// === 2. RUTAS DE EJECUCIÓN OPERATIVA (Handheld) ===

// Obtener la Tarea más Prioritaria
// Usado por el Handheld del Asociado Operativo. [cite: 159, 339]
router.get('/siguiente-tarea/:idAsociado', (req, res) => {
  // Simulación: El SGT asigna la P1 más antigua. [cite: 157]
  res.json({
    tareaId: 'T00456',
    prioridad: 'P1',
    tipo: 'Resurtido por Venta',
    sku: 'ZAPATO-HOMBRE-CL001',
    ubicacionOrigen: 'A-03-N2',
    cantidad: 3,
    guia: 'Dirígete a la Ubicación A-03-N2 y toma 3 pzs.' // Instrucción del Handheld [cite: 160]
  });
});

// Notificación de Inicio de Tarea (Tracking de Tiempo)
// Inicia el cronómetro del KPI "Tiempo de Tarea". [cite: 283]
router.post('/iniciar/:idTarea', (req, res) => {
  const { idTarea } = req.params;
  res.status(200).json({
    tareaId: idTarea,
    message: 'Tarea marcada como "En Progreso". Tracking de tiempo iniciado.'
  });
});

// Notificación de Fin de Tarea (Cierre y Registro)
// Finaliza el cronómetro y registra el resultado de la tarea (Ej. Resurtido completado). [cite: 344]
router.post('/completar/:idTarea', (req, res) => {
  const { idTarea } = req.params;
  // Lógica: Transfiere el inventario, registra el tiempo total.
  res.status(200).json({
    tareaId: idTarea,
    message: 'Tarea completada. Inventario transferido sistémicamente a Piso de Venta.'
  });
});


module.exports = router;