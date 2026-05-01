const db = require('../config/db');

const contactoRepository = {
  async create({ nombre, email, telefono, mensaje, tipoConsulta }) {
    const query = `
      INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje, tipo_consulta)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, telefono, mensaje, tipo_consulta, created_at
    `;
    const values = [nombre, email, telefono, mensaje, tipoConsulta];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const query = `
      SELECT id, nombre, email, telefono, mensaje, tipo_consulta, created_at
      FROM mensajes_contacto
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT id, nombre, email, telefono, mensaje, tipo_consulta, created_at
      FROM mensajes_contacto
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = contactoRepository;