const { query } = require('../config/db');

const noticiaRepository = {
  async getAll(filtros = {}) {
    let sql = 'SELECT * FROM noticias WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filtros.categoria && filtros.categoria !== '') {
      sql += ` AND categoria = $${paramIndex++}`;
      values.push(filtros.categoria);
    }

    if (filtros.busqueda) {
      sql += ` AND (titulo ILIKE $${paramIndex++} OR contenido ILIKE $${paramIndex++})`;
      values.push(`%${filtros.busqueda}%`);
      values.push(`%${filtros.busqueda}%`);
    }

    if (filtros.fecha) {
      sql += ` AND DATE(created_at) = $${paramIndex++}`;
      values.push(filtros.fecha);
    }

    if (filtros.fechaDesde && filtros.fechaHasta) {
      sql += ` AND DATE(created_at) >= $${paramIndex++} AND DATE(created_at) <= $${paramIndex++}`;
      values.push(filtros.fechaDesde);
      values.push(filtros.fechaHasta);
    } else if (filtros.fechaDesde) {
      sql += ` AND DATE(created_at) >= $${paramIndex++}`;
      values.push(filtros.fechaDesde);
    } else if (filtros.fechaHasta) {
      sql += ` AND DATE(created_at) <= $${paramIndex++}`;
      values.push(filtros.fechaHasta);
    }

    if (filtros.orden === 'antiguos') {
      sql += ' ORDER BY created_at ASC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const result = await query(sql, values);
    return result.rows;
  },

  async getById(id) {
    const result = await query(
      'SELECT * FROM noticias WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async create(noticiaData) {
    const { titulo, contenido, categoria, imagen_url } = noticiaData;
    const result = await query(
      'INSERT INTO noticias (titulo, contenido, categoria, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, contenido, categoria || 'General', imagen_url]
    );
    return result.rows[0];
  },

  async update(id, noticiaData) {
    const { titulo, contenido, categoria, imagen_url } = noticiaData;
    const result = await query(
      `UPDATE noticias 
       SET titulo = $1, contenido = $2, categoria = $3, imagen_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [titulo, contenido, categoria || 'General', imagen_url, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'DELETE FROM noticias WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = noticiaRepository;