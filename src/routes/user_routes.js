
const { Router } = require('express');
const router = Router();

//Tienda
router.get('/admin', (req, res) => {
  // Aquí iría la lógica para un admin
  res.json({
    user: 'Admin',
    message: 'Bienvenido, tienes acceso total.'
  });
});

//CEDIS
router.get('/client/:id', (req, res) => {
  const { id } = req.params;
  // Aquí buscarías al cliente en la base de datos
  res.json({
    user: 'Cliente',
    clientId: id,
    message: `Perfil del cliente ${id} cargado.`
  });
});

//Empleados
router.get('/empleados', (req, res) => {
  // Lógica para un invitado
  res.json({
    user: 'Invitado',
    message: 'Tienes acceso limitado. Por favor, regístrate.'
  });
});


// Exportamos el router para que index.js pueda usarlo
module.exports = router;