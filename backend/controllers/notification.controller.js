const Joi = require('joi');
const notificationService = require('../services/notification.service');

const notificationController = {
  async handleGetNotificaciones(req, res) {
    try {
      const notificaciones = await notificationService.getNotificaciones(req.user.id);
      res.json(notificaciones);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleGetNoLeidas(req, res) {
    try {
      const count = await notificationService.getCountNoLeidas(req.user.id);
      res.json({ count });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleMarcarLeida(req, res) {
    try {
      const { id } = req.params;
      const notificacion = await notificationService.marcarComoLeida(id, req.user.id);
      res.json(notificacion);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleEliminar(req, res) {
    try {
      const { id } = req.params;
      await notificationService.eliminarNotificacion(id, req.user.id);
      res.json({ message: 'Notificación eliminada' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleEliminarTodas(req, res) {
    try {
      await notificationService.eliminarTodasLasNotificaciones(req.user.id);
      res.json({ message: 'Todas las notificaciones eliminadas' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },
};

module.exports = notificationController;