const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

let apadrinamientoService;
try {
  apadrinamientoService = require('../services/apadrinamiento.service');
  console.log('✅ Apadrinamiento service loaded');
} catch (e) {
  console.error('❌ Error loading apadrinamiento service:', e.message);
}

const withService = (handler) => async (req, res, next) => {
  if (!apadrinamientoService) {
    return res.status(500).json({ error: 'Service not available' });
  }
  try {
    await handler(apadrinamientoService, req, res, next);
  } catch (err) {
    next(err);
  }
};

router.get('/disponibles', withService(async (service, req, res) => {
  const usuarioId = req.query.usuarioId || req.user?.id;
  res.json(await service.getAnimalesDisponibles(usuarioId));
}));

router.get('/con-padrino', withService(async (service, req, res) => 
  res.json(await service.getAnimalesConPadrino())
));

router.get('/mis-apadrinamientos', authenticate, withService(async (service, req, res) =>
  res.json(await service.getMiApadrinamiento(req.user.id))
));

router.get('/check-previo', authenticate, withService(async (service, req, res) =>
  res.json({ tieneApadrinamientoPrevio: await service.checkTuvoApadrinamientoCancelado(req.user.id) })
));

router.get('/cobros', authenticate, isAdmin, withService(async (service, req, res) => {
  const cobros = await service.getCobros();
  const stats = await service.getStatsCobros();
  res.json({ cobros, stats });
}));

router.post('/cobros-ejecutar', authenticate, isAdmin, withService(async (service, req, res) => 
  res.json(await service.ejecutarCobrosMensuales())
));

router.get('/admin', authenticate, isAdmin, withService(async (service, req, res) => 
  res.json(await service.getAllConStats())
));

router.get('/:id', withService(async (service, req, res) => {
  const data = await service.getById(req.params.id);
  if (!data) return res.status(404).json({ error: 'No encontrado' });
  res.json(data);
}));

router.post('/', authenticate, withService(async (service, req, res) => {
  const datos = {
    usuario_id: req.user.id,
    animal_id: req.body.animal_id,
    stripe_payment_id: req.body.stripe_payment_id,
    stripe_customer_id: req.body.stripe_customer_id,
    stripe_payment_method_id: req.body.stripe_payment_method_id,
    importe: req.body.importe,
    dni_nie: req.body.dni_nie,
    telefono: req.body.telefono,
    mostrar_publico: req.body.mostrar_publico
  };
  res.status(201).json(await service.crear(datos));
}));

router.put('/:id/aceptar', authenticate, isAdmin, withService(async (service, req, res) => 
  res.json(await service.aceptar(req.params.id))
));

router.put('/:id/rechazar', authenticate, isAdmin, withService(async (service, req, res) => 
  res.json(await service.rechazar(req.params.id, req.body.motivo))
));

router.put('/:id/cancelar', authenticate, withService(async (service, req, res) => 
  res.json(await service.cancelar(req.params.id, req.user.id))
));

router.delete('/:id', authenticate, withService(async (service, req, res) => {
  await service.eliminar(req.params.id, req.user.id);
  res.json({ message: 'Eliminado' });
}));

module.exports = router;