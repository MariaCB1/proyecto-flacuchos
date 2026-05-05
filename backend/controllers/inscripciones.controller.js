const inscripcionesService = require('../services/inscripciones.service');
const notificationService = require('../services/notification.service');
const eventosService = require('../services/eventos.service');
const userService = require('../services/user.service');

const inscripcionesController = {
  async crearInscripcion(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const { evento_id } = req.body;
      
      if (!evento_id) {
        return res.status(400).json({ error: 'El ID del evento es obligatorio' });
      }
      
      const inscripcion = await inscripcionesService.crearInscripcion(usuarioId, evento_id);
      
      const usuario = await userService.getById(usuarioId);
      const evento = await eventosService.getById(evento_id);
      
      const nombreUsuario = usuario?.nombre || 'Un usuario';
      const tituloEvento = evento?.titulo || 'un evento';
      const mensajeAdmin = `Nueva inscripción de ${nombreUsuario} al evento "${tituloEvento}"`;
      
      await notificationService.crearNotificacion({
        usuarioId: null,
        tipo: 'solicitud_inscripcion',
        mensaje: mensajeAdmin,
        referenciaId: evento_id
      });
      
      const mensajeUsuario = `Te has inscrito correctamente al evento "${tituloEvento}"`;
      await notificationService.crearNotificacion({
        usuarioId: usuarioId,
        tipo: 'solicitud_inscripcion',
        mensaje: mensajeUsuario,
        referenciaId: evento_id
      });
      
      res.status(201).json({ message: 'Inscripción creada correctamente', inscripcion });
    } catch (error) {
      next(error);
    }
  },

  async getMisInscripciones(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const inscripciones = await inscripcionesService.getMisInscripciones(usuarioId);
      res.json(inscripciones);
    } catch (error) {
      next(error);
    }
  },

  async getInscripcionesEvento(req, res, next) {
    try {
      const inscripciones = await inscripcionesService.getInscripcionesEvento(req.params.eventoId);
      res.json(inscripciones);
    } catch (error) {
      next(error);
    }
  },

  async getAllInscripciones(req, res, next) {
    try {
      const inscripciones = await inscripcionesService.getAllInscripciones();
      res.json(inscripciones);
    } catch (error) {
      next(error);
    }
  },

  async cancelarInscripcion(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const eventoId = req.body.evento_id;
      
      if (!eventoId) {
        return res.status(400).json({ error: 'El ID del evento es obligatorio' });
      }
      
      const evento = await eventosService.getById(eventoId);
      const usuario = await userService.getById(usuarioId);
      
      const nombreUsuario = usuario?.nombre || 'Un usuario';
      const tituloEvento = evento?.titulo || 'un evento';
      const mensaje = `${nombreUsuario} ha cancelado su inscripción al evento "${tituloEvento}"`;
      
      const inscripcion = await inscripcionesService.cancelarInscripcionPorEvento(usuarioId, eventoId);
      
      await notificationService.crearNotificacion({
        usuarioId: null,
        tipo: 'inscripcion_cancelada',
        mensaje,
        referenciaId: eventoId
      });
      
      res.json({ message: 'Inscripción cancelada correctamente', inscripcion });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inscripcionesController;