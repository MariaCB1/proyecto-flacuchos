const express = require('express');
const router = express.Router();
const inscripcionesController = require('../controllers/inscripciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.post('/', authMiddleware, inscripcionesController.crearInscripcion);
router.get('/mis-inscripciones', authMiddleware, inscripcionesController.getMisInscripciones);
router.get('/evento/:eventoId', authMiddleware, roleMiddleware('admin'), inscripcionesController.getInscripcionesEvento);
router.get('/', authMiddleware, roleMiddleware('admin'), inscripcionesController.getAllInscripciones);
router.delete('/', authMiddleware, inscripcionesController.cancelarInscripcion);

module.exports = router;