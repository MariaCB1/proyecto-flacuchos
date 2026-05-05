const inscripcionesRepository = require('../repositories/inscripciones.repository');

const inscripcionesService = {
  async crearInscripcion(usuarioId, eventoId) {
    const existente = await inscripcionesRepository.getByUsuarioAndEvento(usuarioId, eventoId);
    if (existente) {
      throw new Error('Ya estás inscrito en este evento');
    }
    return await inscripcionesRepository.create({ usuario_id: usuarioId, evento_id: eventoId });
  },

  async getMisInscripciones(usuarioId) {
    return await inscripcionesRepository.getByUsuario(usuarioId);
  },

  async getInscripcionesEvento(eventoId) {
    return await inscripcionesRepository.getByEvento(eventoId);
  },

  async getAllInscripciones() {
    return await inscripcionesRepository.getAll();
  },

  async cancelarInscripcion(inscripcionId, usuarioId) {
    const inscripcion = await inscripcionesRepository.getByUsuarioAndEvento(usuarioId, null);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }
    return await inscripcionesRepository.delete(inscripcionId);
  },

  async cancelarInscripcionPorEvento(usuarioId, eventoId) {
    return await inscripcionesRepository.deleteByUsuarioAndEvento(usuarioId, eventoId);
  }
};

module.exports = inscripcionesService;