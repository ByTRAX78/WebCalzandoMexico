const { Router } = require('express');
const router = Router();

// --- Handler para el KPI de Días de Cobertura ---
router.get('/cobertura', (req, res) => {
  [cite_start]// Simulación del análisis de cobertura de inventario del Problema 3 [cite: 193]
  const data = [
    {
      unidad: 'Calzado Casual Hombre',
      cobertura: 171.1,
      estatus: '🔴 Exceso'
    },
    {
      unidad: 'Calzado Niños y Accesorios',
      cobertura: 53.0,
      estatus: '🟢 OK'
    },
    {
      unidad: 'Total General',
      cobertura: 108.8,
      estatus: '🔴 Fuera (Casi 19 días sobre el límite)'
    }
  ];

  res.json({
    kpi: 'Días de Cobertura de Inventario',
    [cite_start]target: '28 - 90 días', // El benchmark de la industria [cite: 190]
    data: data,
    timestamp: new Date().toISOString()
  });
});

// --- Handler para el KPI de Rotación de Inventario ---
router.get('/rotacion', (req, res) => {
  [cite_start]// Simulación de la caída de Rotación de Inventario del Problema 3 [cite: 208]
  const data = {
    '2023': 5.72,
    '2024': 3.59,
    tendencia: '🔴 CRÍTICO: 37% más lento',
    meta: '> 4.0'
  };

  res.json({
    kpi: 'Rotación de Inventario (Vueltas)',
    description: 'Mide la eficiencia del capital. Un número más alto es mejor.',
    data: data,
    timestamp: new Date().toISOString()
  });
});

// --- Handler para un grupo de KPIs Estratégicos (Dashboard Principal) ---
router.get('/estrategicos', (req, res) => {
  [cite_start]// Combina los principales KPI Estratégicos que el Gerente de Tienda necesita [cite: 275]
  res.json({
    reporte: 'KPI Estratégicos',
    meta: 'Visión de Negocio',
    kpis: [
      {
        nombre: 'Días de Cobertura',
        valor: 108.8,
        meta: 90,
        unidades: 'días',
        tendencia: 'Alarma'
      },
      {
        nombre: 'Rotación de Inventario',
        valor: 3.59,
        meta: 4.0,
        unidades: 'vueltas/año',
        tendencia: 'Alarma'
      },
      {
        nombre: 'Índice de Rotación de Personal',
        valor: 60,
        meta: 25,
        unidades: '%',
        tendencia: 'Crítico'
      },
      {
        nombre: 'Rentabilidad (EBITDA)',
        valor: 'Consultar DB',
        unidades: '$',
        tendencia: 'A medir'
      }
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;