const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contacto.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

const requireAdmin = (req, res, next) => roleMiddleware('admin')(req, res, next);

router.post('/', contactoController.crearMensaje);
router.post('/solicitud-acogida', authMiddleware, contactoController.crearSolicitudAcogida);

router.get('/animales-disponibles', contactoController.getAnimalesDisponibles);

router.get('/solicitudes-acogida', authMiddleware, requireAdmin, contactoController.getSolicitudesAcogida);

router.get('/mis-acogidas', authMiddleware, contactoController.getMisAcogidas);

router.delete('/solicitudes-acogida/:id', authMiddleware, contactoController.eliminarSolicitudAcogida);

router.put('/solicitud-acogida/:id/aprobar', authMiddleware, requireAdmin, contactoController.aprobarAcogida);
router.put('/solicitud-acogida/:id/rechazar', authMiddleware, requireAdmin, contactoController.rechazarAcogida);
router.put('/solicitud-acogida/:id/asignar', authMiddleware, requireAdmin, contactoController.asignarAnimal);

router.put('/solicitud-acogida/:id/aceptar', authMiddleware, contactoController.aceptarAnimalAsignado);
router.put('/solicitud-acogida/:id/rechazar-animal', authMiddleware, contactoController.rechazarAnimalAsignado);

module.exports = router;