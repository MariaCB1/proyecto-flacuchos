const { query } = require('../config/db');

const inscripcionesRepository = {
  async create(inscripcionData) {
    const { usuario_id, evento_id } = inscripcionData;
    const result = await query(
      'INSERT INTO inscripciones_evento (usuario_id, evento_id) VALUES ($1, $2) RETURNING *',
      [usuario_id, evento_id]
    );
    return result.rows[0];
  },

  async getByUsuario(usuarioId) {
    const result = await query(
      `SELECT ie.*, e.titulo as evento_titulo, e.fecha as evento_fecha, e.imagen_url as evento_imagen, 
              e.categoria as evento_categoria, e.hora as evento_hora, e.ubicacion as evento_ubicacion
       FROM inscripciones_evento ie
       JOIN eventos e ON ie.evento_id = e.id
       WHERE ie.usuario_id = $1
       ORDER BY ie.created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async getByEvento(eventoId) {
    const result = await query(
      `SELECT ie.*, u.nombre as usuario_nombre, u.email as usuario_email
       FROM inscripciones_evento ie
       JOIN usuarios u ON ie.usuario_id = u.id
       WHERE ie.evento_id = $1
       ORDER BY ie.created_at DESC`,
      [eventoId]
    );
    return result.rows;
  },

  async getAll() {
    const result = await query(
      `SELECT ie.*, e.titulo as evento_titulo, e.fecha as evento_fecha, 
              u.nombre as usuario_nombre, u.email as usuario_email
       FROM inscripciones_evento ie
       JOIN eventos e ON ie.evento_id = e.id
       JOIN usuarios u ON ie.usuario_id = u.id
       ORDER BY ie.created_at DESC`
    );
    return result.rows;
  },

  async getByUsuarioAndEvento(usuarioId, eventoId) {
    const result = await query(
      'SELECT * FROM inscripciones_evento WHERE usuario_id = $1 AND evento_id = $2',
      [usuarioId, eventoId]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'DELETE FROM inscripciones_evento WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async deleteByUsuarioAndEvento(usuarioId, eventoId) {
    const result = await query(
      'DELETE FROM inscripciones_evento WHERE usuario_id = $1 AND evento_id = $2 RETURNING *',
      [usuarioId, eventoId]
    );
    return result.rows[0];
  },

  async deleteByEventoId(eventoId) {
    const result = await query(
      'DELETE FROM inscripciones_evento WHERE evento_id = $1 RETURNING *',
      [eventoId]
    );
    return result.rows;
  },

  async getUsuariosByEvento(eventoId) {
    const result = await query(
      'SELECT usuario_id FROM inscripciones_evento WHERE evento_id = $1',
      [eventoId]
    );
    return result.rows;
  }
};

module.exports = inscripcionesRepository;