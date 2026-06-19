const eventosService = require('../services/eventos.service');
const notificationService = require('../services/notification.service');
const userRepository = require('../repositories/user.repository');

const eventosController = {
  async getEventos(req, res, next) {
    try {
      const filtros = {
        categoria: req.query.categoria,
        busqueda: req.query.busqueda,
        tipo: req.query.tipo,
        estado: req.query.estado,
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta
      };
      const eventos = await eventosService.getAll(filtros);
      res.json(eventos);
    } catch (error) {
      next(error);
    }
  },

  async getEventoById(req, res, next) {
    try {
      const evento = await eventosService.getById(req.params.id);
      res.json(evento);
    } catch (error) {
      next(error);
    }
  },

  async createEvento(req, res, next) {
    try {
      const evento = await eventosService.create(req.body);
      
      const usuarios = await userRepository.getAll();
      for (const usuario of usuarios) {
        if (usuario.rol !== 'admin') {
          const titulo = evento.titulo || 'Nuevo evento';
          await notificationService.crearNotificacion({
            usuarioId: usuario.id,
            tipo: 'nuevo_evento',
            mensaje: `Nuevo evento: ${titulo}`,
            referenciaId: evento.id
          });
        }
      }
      
      res.status(201).json(evento);
    } catch (error) {
      next(error);
    }
  },

  async updateEvento(req, res, next) {
    try {
      const evento = await eventosService.update(req.params.id, req.body);
      res.json(evento);
    } catch (error) {
      next(error);
    }
  },

  async deleteEvento(req, res, next) {
    try {
      const evento = await eventosService.delete(req.params.id);
      
      const titulo = evento.titulo || 'Evento';
      const usuarios = await userRepository.getAll();
      for (const usuario of usuarios) {
        if (usuario.rol !== 'admin') {
          await notificationService.crearNotificacion({
            usuarioId: usuario.id,
            tipo: 'evento_cancelado',
            mensaje: `El evento "${titulo}" ha sido cancelado`,
            referenciaId: evento.id
          });
        }
      }
      
      res.json({ message: 'Evento eliminado', evento });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = eventosController;