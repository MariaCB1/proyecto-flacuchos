const apadrinamientoService = require('../services/apadrinamiento.service');

const apadrinamientoController = {
  async getAnimalesDisponibles(req, res) {
    try {
      const animales = await apadrinamientoService.getAnimalesDisponibles(req.user?.id);
      res.json(animales);
    } catch (error) {
      console.error('Error getAnimalesDisponibles:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getAnimalesConPadrino(req, res) {
    try {
      const animales = await apadrinamientoService.getAnimalesConPadrino();
      res.json(animales);
    } catch (error) {
      console.error('Error getAnimalesConPadrino:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getMiApadrinamiento(req, res) {
    try {
      const apadrinamientos = await apadrinamientoService.getMiApadrinamiento(req.user.id);
      res.json(apadrinamientos);
    } catch (error) {
      console.error('Error getMiApadrinamiento:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const data = await apadrinamientoService.getAllConStats();
      res.json(data);
    } catch (error) {
      console.error('Error getAll:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const apadrinamiento = await apadrinamientoService.getById(req.params.id);
      if (!apadrinamiento) {
        return res.status(404).json({ error: 'Apadrinamiento no encontrado' });
      }
      res.json(apadrinamiento);
    } catch (error) {
      console.error('Error getById:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async crear(req, res) {
    try {
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

      const apadrinamiento = await apadrinamientoService.crear(datos);
      res.status(201).json(apadrinamiento);
    } catch (error) {
      console.error('Error crear:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async aceptar(req, res) {
    try {
      const apadrinamiento = await apadrinamientoService.aceptar(req.params.id);
      res.json(apadrinamiento);
    } catch (error) {
      console.error('Error aceptar:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async rechazar(req, res) {
    try {
      const apadrinamiento = await apadrinamientoService.rechazar(req.params.id, req.body.motivo);
      res.json(apadrinamiento);
    } catch (error) {
      console.error('Error rechazar:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async cancelar(req, res) {
    try {
      const apadrinamiento = await apadrinamientoService.cancelar(req.params.id, req.user.id);
      res.json(apadrinamiento);
    } catch (error) {
      console.error('Error cancelar:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await apadrinamientoService.eliminar(req.params.id, req.user.id);
      res.json({ message: 'Solicitud eliminada correctamente' });
    } catch (error) {
      console.error('Error eliminar:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async getCobros(req, res) {
    try {
      const cobros = await apadrinamientoService.getCobros();
      const stats = await apadrinamientoService.getStatsCobros();
      res.json({ cobros, stats });
    } catch (error) {
      console.error('Error getCobros:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async ejecutarCobros(req, res) {
    try {
      const results = await apadrinamientoService.ejecutarCobrosMensuales();
      res.json(results);
    } catch (error) {
      console.error('Error ejecutarCobros:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  async checkTuvoApadrinamientoPrevio(req, res) {
    try {
      const tienePrevio = await apadrinamientoService.checkTuvoApadrinamientoCancelado(req.user.id);
      res.json({ tieneApadrinamientoPrevio: tienePrevio });
    } catch (error) {
      console.error('Error checkTuvoApadrinamientoPrevio:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = apadrinamientoController;