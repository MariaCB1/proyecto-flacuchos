const { query } = require('../config/db');

const eventosRepository = {
  async getAll(filtros = {}) {
    let sql = 'SELECT * FROM eventos WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filtros.categoria && filtros.categoria !== '') {
      sql += ` AND categoria = $${paramIndex++}`;
      values.push(filtros.categoria);
    }

    if (filtros.busqueda) {
      sql += ` AND (titulo ILIKE $${paramIndex++} OR descripcion ILIKE $${paramIndex++})`;
      values.push(`%${filtros.busqueda}%`);
      values.push(`%${filtros.busqueda}%`);
    }

    if (filtros.estado) {
      sql += ` AND estado = $${paramIndex++}`;
      values.push(filtros.estado);
    }

    if (filtros.fechaDesde && filtros.fechaHasta) {
      sql += ` AND DATE(fecha) >= $${paramIndex++} AND DATE(fecha) <= $${paramIndex++}`;
      values.push(filtros.fechaDesde);
      values.push(filtros.fechaHasta);
    } else if (filtros.fechaDesde) {
      sql += ` AND DATE(fecha) >= $${paramIndex++}`;
      values.push(filtros.fechaDesde);
    } else if (filtros.fechaHasta) {
      sql += ` AND DATE(fecha) <= $${paramIndex++}`;
      values.push(filtros.fechaHasta);
    }

    if (filtros.tipo === 'proximos') {
      sql += ' AND fecha >= CURRENT_DATE';
    } else if (filtros.tipo === 'pasados') {
      sql += ' AND fecha < CURRENT_DATE';
    }

    if (filtros.tipo === 'proximos') {
      sql += ' ORDER BY fecha ASC';
    } else if (filtros.tipo === 'pasados') {
      sql += ' ORDER BY fecha DESC';
    } else {
      sql += ' ORDER BY fecha ASC';
    }

    const result = await query(sql, values);
    return result.rows;
  },

  async getById(id) {
    const result = await query(
      'SELECT * FROM eventos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async create(eventoData) {
    const { titulo, descripcion, fecha, hora, ubicacion, precio, imagen_url, categoria, permitir_inscripcion } = eventoData;
    const result = await query(
      'INSERT INTO eventos (titulo, descripcion, fecha, hora, ubicacion, precio, imagen_url, categoria, permitir_inscripcion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [titulo, descripcion, fecha, hora, ubicacion, precio || 'Gratis', imagen_url, categoria || 'Otro', permitir_inscripcion !== false]
    );
    return result.rows[0];
  },

  async update(id, eventoData) {
    const { titulo, descripcion, fecha, hora, ubicacion, precio, imagen_url, categoria, estado, permitir_inscripcion } = eventoData;
    const result = await query(
      `UPDATE eventos 
       SET titulo = $1, descripcion = $2, fecha = $3, hora = $4, ubicacion = $5, precio = $6, imagen_url = $7, categoria = $8, estado = $9, permitir_inscripcion = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 
       RETURNING *`,
      [titulo, descripcion, fecha, hora, ubicacion, precio || 'Gratis', imagen_url, categoria || 'Otro', estado || 'activo', permitir_inscripcion !== false, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'DELETE FROM eventos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = eventosRepository;