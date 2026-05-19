const db = require('../config/db');

const voluntarioRepository = {
  async create(data) {
    const disponibilidad_dias = guardarDias(data.disponibilidad_dias);
    
    const query = `
      INSERT INTO voluntarios (
        usuario_id, telefono, dni,
        disponibilidad_dias, disponibilidad_horario,
        tiene_vehiculo, motivacion, experiencia, comentarios
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.usuario_id,
      data.telefono,
      data.dni,
      disponibilidad_dias,
      data.disponibilidad_horario || null,
      data.tiene_vehiculo || false,
      data.motivacion || null,
      data.experiencia || null,
      data.comentarios || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async updateVoluntarioActivo(usuarioId, telefono, dni, disponibilidad_dias, disponibilidad_horario, tiene_vehiculo, motivacion, experiencia, comentarios) {
    const diasNormalizado = guardarDias(disponibilidad_dias);
    const result = await db.query(
      `UPDATE voluntarios 
       SET telefono = $2, dni = $3, disponibilidad_dias = $4, disponibilidad_horario = $5,
           tiene_vehiculo = $6, motivacion = $7, experiencia = $8, comentarios = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE usuario_id = $1
       RETURNING *`,
      [usuarioId, telefono, dni, diasNormalizado, disponibilidad_horario, tiene_vehiculo, motivacion, experiencia, comentarios]
    );
    return result.rows[0];
  },

  async getByUsuarioId(usuarioId) {
    const result = await db.query(
      `SELECT v.*, u.nombre, u.email, u.voluntario_activo 
       FROM voluntarios v
       JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.usuario_id = $1`,
      [usuarioId]
    );
    if (result.rows[0]) {
      result.rows[0].disponibilidad_dias = parsearDias(result.rows[0].disponibilidad_dias);
    }
    return result.rows[0];
  },

  async getAll() {
    const result = await db.query(
      `SELECT v.*, u.nombre, u.email, u.voluntario_activo 
       FROM voluntarios v
       JOIN usuarios u ON v.usuario_id = u.id
       ORDER BY v.created_at DESC`
    );
    return result.rows.map(row => {
      row.disponibilidad_dias = parsearDias(row.disponibilidad_dias);
      return row;
    });
  }
};

function guardarDias(dias) {
  if (!dias) return null;
  if (Array.isArray(dias)) {
    return JSON.stringify(dias.map(d => d.toLowerCase().trim()));
  }
  if (typeof dias === 'string') {
    if (dias.startsWith('[')) {
      try {
        const parsed = JSON.parse(dias);
        return JSON.stringify(parsed.map(d => d.toLowerCase().trim()));
      } catch {
        return JSON.stringify(dias.split(',').map(d => d.toLowerCase().trim()));
      }
    }
    if (dias.startsWith('{')) {
      const contenido = dias.slice(1, -1);
      return JSON.stringify(contenido.split(',').map(d => d.trim().replace(/"/g, '').toLowerCase()));
    }
    return JSON.stringify(dias.split(',').map(d => d.toLowerCase().trim()));
  }
  return null;
}

function parsearDias(dias) {
  if (!dias) return [];
  if (Array.isArray(dias)) return dias;
  
  const str = String(dias).trim();
  
  if (str.startsWith('{')) {
    const contenido = str.slice(1, -1);
    if (!contenido) return [];
    return contenido.split(',').map(d => d.trim().replace(/"/g, '').replace(/'/g, '').toLowerCase()).filter(d => d);
  }
  
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed.map(d => d.toLowerCase().trim()) : [];
    } catch {
      const contenido = str.slice(1, -1);
      if (!contenido) return [];
      return contenido.split(',').map(d => d.trim().replace(/"/g, '').replace(/'/g, '').toLowerCase()).filter(d => d);
    }
  }
  
  if (str.includes(',')) {
    return str.split(',').map(d => d.trim().replace(/"/g, '').replace(/'/g, '').toLowerCase()).filter(d => d);
  }
  
  if (str) {
    return [str.replace(/"/g, '').replace(/'/g, '').toLowerCase()];
  }
  
  return [];
}

module.exports = voluntarioRepository;