const { Router } = require('express');
const router = Router();

// === 1. RUTAS DE ROLES Y USUARIOS ===

// Crear un Nuevo Usuario y Asignar Rol (Ej. Asociado de Operaciones)
// Usado por la Gerencia para incorporar nuevo personal.
router.post('/usuarios', (req, res) => {
  // Asumiendo que se recibe { nombre: 'Juan Pérez', rolId: 'ASOCIADO_OP' }
  const { nombre, rolId } = req.body;
  res.status(201).json({
    message: `Usuario ${nombre} creado. Rol asignado: ${rolId}.`,
    action: 'El usuario debe iniciar su capacitación multifuncional.'
  });
});

// Consultar el Rol y Estado de Desarrollo de un Empleado
// Permite ver en qué punto del Plan de Carrera se encuentra (Nivel 1, 2, 3, etc.).
router.get('/usuarios/:idEmpleado', (req, res) => {
  const { idEmpleado } = req.params;
  // Simulación: Información crucial para la retención.
  res.json({
    empleadoId: idEmpleado,
    nombre: 'Asociado Talentoso A',
    rolActual: 'Asociado de Ventas', // Nivel 1 [cite: 146]
    siguientePaso: 'Especialista de Inventario', // Nivel 2 [cite: 147]
    progresoCarrera: '2 de 5 Niveles',
    timestamp: new Date().toISOString()
  });
});

// === 2. RUTAS DE CERTIFICACIÓN Y CROSS-TRAINING ===

// Asignar una Certificación (Habilitador de Flexibilidad)
// Usado por Subgerentes/Gerente tras completar un curso o capacitación.
router.put('/certificaciones/:idEmpleado/asignar', (req, res) => {
  // Asumiendo que se recibe { certificacion: 'Recibo_BOH_Cert' }
  const { certificacion } = req.body;
  const { idEmpleado } = req.params;
  res.status(200).json({
    empleadoId: idEmpleado,
    message: `Certificación "${certificacion}" agregada.`,
    impacto: 'El empleado ahora está habilitado para realizar esta función (cross-training)[cite: 154].'
  });
});

// Consultar Certificaciones del Personal (Para Asignación Dinámica de Tareas)
// Permite al Líder de Operaciones ver quién puede apoyar en qué tarea.
router.get('/certificaciones/:idEmpleado', (req, res) => {
  const { idEmpleado } = req.params;
  res.json({
    empleadoId: idEmpleado,
    certificaciones: [
      'Operación de Caja [cite: 155]',
      'Técnicas de Venta [cite: 155]',
      'Visual Merchandising (Especialización N2)'
    ],
    esMultifuncional: true,
    timestamp: new Date().toISOString()
  });
});

// === 3. RUTA DE REPORTE DE ROTACIÓN ===

// Consulta el Índice de Rotación de Personal (KPI Estratégico)
router.get('/rotacion-indice', (req, res) => {
  // Simulación del problema reportado
  res.json({
    kpi: 'Índice de Rotación de Personal',
    valorActual: '60%', // Rotación crítica reportada [cite: 19]
    meta: '< 25%',
    message: 'La nueva estructura y el plan de carrera buscan reducir este índice.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;