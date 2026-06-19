const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animal.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.get('/animales', animalController.getAnimales);
router.get('/animales/todos', authMiddleware, roleMiddleware('admin'), animalController.getAllAnimalesAdmin);
router.get('/animales/:id', animalController.getAnimalById);

router.post(
  '/animales',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.createAnimal
);

router.put(
  '/animales/:id',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.updateAnimal
);

router.delete(
  '/animales/:id',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.deleteAnimal
);

router.post(
  '/solicitudes/:animalId',
  authMiddleware,
  roleMiddleware('usuario'),
  animalController.crearSolicitud
);

router.get(
  '/solicitudes/mis-solicitudes',
  authMiddleware,
  animalController.getMisSolicitudes
);

router.get(
  '/solicitudes',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.getAllSolicitudes
);

router.get(
  '/solicitudes/pendientes',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.getSolicitudesPendientes
);

router.put(
  '/solicitudes/:id/aprobar',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.aprobarSolicitud
);

router.put(
  '/solicitudes/:id/rechazar',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.rechazarSolicitud
);

router.get(
  '/adopciones/mis-adopciones',
  authMiddleware,
  animalController.getMisAdopciones
);

router.get(
  '/solicitudes/:id',
  authMiddleware,
  roleMiddleware('admin'),
  animalController.getSolicitudById
);

router.delete(
  '/solicitudes/:id',
  authMiddleware,
  animalController.eliminarMiSolicitud
);

module.exports = router;