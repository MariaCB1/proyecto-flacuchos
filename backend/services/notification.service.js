const notificationRepository = require('../repositories/notification.repository');

const notificationService = {
  async getNotificaciones(usuarioId) {
    return notificationRepository.findByUserId(usuarioId);
  },

  async getNoLeidas(usuarioId) {
    return notificationRepository.findUnreadByUserId(usuarioId);
  },

  async getCountNoLeidas(usuarioId) {
    return notificationRepository.countUnread(usuarioId);
  },

  async marcarComoLeida(notificacionId, usuarioId) {
    const notificacion = await notificationRepository.markAsRead(notificacionId, usuarioId);
    if (!notificacion) {
      const error = new Error('Notificación no encontrada');
      error.status = 404;
      throw error;
    }
    return notificacion;
  },

  async crearNotificacion({ usuarioId, tipo, mensaje, referenciaId }) {
    return notificationRepository.create({ usuarioId, tipo, mensaje, referenciaId });
  },

  async eliminarNotificacion(notificacionId, usuarioId) {
    const result = await notificationRepository.delete(notificacionId, usuarioId);
    if (!result) {
      const error = new Error('Notificación no encontrada');
      error.status = 404;
      throw error;
    }
    return result;
  },

  async eliminarTodasLasNotificaciones(usuarioId) {
    return notificationRepository.deleteAll(usuarioId);
  }
};

module.exports = notificationService;