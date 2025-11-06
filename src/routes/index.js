const { Router } = require('express');
const router = Router();

const userRoutes = require('./users_routes');
const kpiRoutes = require('./kpis_routes')
const inventoryRoutes = require('./inventory_routes')
const gestionTareas = require('./tareas_routes')
const gestionPersonal = require('./personnel_routes')

router.use('/users', userRoutes);
router.use('/kpis', kpiRoutes)
router.use('/inventario', inventoryRoutes)
router.use('/tareas', gestionTareas)
router.use('/personal', gestionPersonal)

module.exports = router;