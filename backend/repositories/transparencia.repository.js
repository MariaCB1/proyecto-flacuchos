const { query } = require('../config/db');

const transparenciaRepository = {
  async getAll() {
    const result = await query(
      'SELECT * FROM documentos_transparencia ORDER BY id'
    );
    return result.rows;
  },

  async getByTipo(tipo) {
    const result = await query(
      'SELECT * FROM documentos_transparencia WHERE tipo = $1',
      [tipo]
    );
    return result.rows[0];
  },

  async update(tipo, data) {
    const { titulo, contenido, archivo_url, botones_json } = data;
    const result = await query(
      `UPDATE documentos_transparencia
       SET titulo = $1, contenido = $2, archivo_url = $3, botones_json = $4, updated_at = CURRENT_TIMESTAMP
       WHERE tipo = $5
       RETURNING *`,
      [titulo, contenido, archivo_url, JSON.stringify(botones_json || []), tipo]
    );
    return result.rows[0];
  },

  async getJustificantes(año = null) {
    let sql = 'SELECT * FROM justificantes_gastos';
    const values = [];

    if (año) {
      sql += ' WHERE año = $1';
      values.push(año);
    }

    sql += ' ORDER BY año DESC, concepto';
    const result = await query(sql, values);
    return result.rows;
  },

  async getAñosConJustificantes() {
    const result = await query(
      'SELECT DISTINCT año FROM justificantes_gastos ORDER BY año DESC'
    );
    return result.rows.map(r => r.año);
  },

  async createJustificante(data) {
    const { año, concepto, importe, archivo_url } = data;
    const result = await query(
      `INSERT INTO justificantes_gastos (año, concepto, importe, archivo_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [año, concepto, importe, archivo_url]
    );
    return result.rows[0];
  },

  async updateJustificante(id, data) {
    const { año, concepto, importe, archivo_url } = data;
    const result = await query(
      `UPDATE justificantes_gastos
       SET año = $1, concepto = $2, importe = $3, archivo_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [año, concepto, importe, archivo_url, id]
    );
    return result.rows[0];
  },

  async deleteJustificante(id) {
    const result = await query(
      'DELETE FROM justificantes_gastos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = transparenciaRepository;