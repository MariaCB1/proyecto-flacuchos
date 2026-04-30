const { query } = require('../config/db');

const animalRepository = {
  async getAll(filtros = {}) {
    let sql = 'SELECT * FROM animales WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filtros.estado) {
      sql += ` AND estado = $${paramIndex++}`;
      values.push(filtros.estado);
    } else {
      sql += ` AND estado = 'disponible'`;
    }

    if (filtros.urgente === 'true') {
      sql += ` AND urgente = true`;
    }

    if (filtros.tipo) {
      sql += ` AND especie = $${paramIndex++}`;
      values.push(filtros.tipo);
    }

    if (filtros.tamano) {
      sql += ` AND tamano = $${paramIndex++}`;
      values.push(filtros.tamano);
    }

    if (filtros.busqueda) {
      sql += ` AND nombre ILIKE $${paramIndex++}`;
      values.push(`%${filtros.busqueda}%`);
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
      'SELECT * FROM animales WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async createSolicitud(solicitudData) {
    const campos = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      usuario_id: 'usuario_id',
      animal_id: 'animal_id',
      nombre_perro: 'nombre_perro',
      nombre_completo: 'nombre_completo',
      fecha_nacimiento: 'fecha_nacimiento',
      residencia: 'residencia',
      telefono: 'telefono',
      redes_sociales: 'redes_sociales',
      es_extranjero: 'es_extranjero',
      tiempo_en_espana: 'tiempo_en_espana',
      posibilidad_regreso: 'posibilidad_regreso',
      plan_con_animal: 'plan_con_animal',
      personas_hogar: 'personas_hogar',
      convivencia_aceptada: 'convivencia_aceptada',
      parentesco_personas: 'parentesco_personas',
      ocupaciones_horarios: 'ocupaciones_horarios',
      tipo_vivienda: 'tipo_vivienda',
      metros_cuadrados: 'metros_cuadrados',
      es_alquiler: 'es_alquiler',
      permiso_propietario: 'permiso_propietario',
      tiene_exterior: 'tiene_exterior',
      posibilidad_bebe: 'posibilidad_bebe',
      opinion_convivencia_bebes: 'opinion_convivencia_bebes',
      en_separacion_quien_cuida: 'en_separacion_quien_cuida',
      problema_ladridos: 'problema_ladridos',
      solucion_ladridos: 'solucion_ladridos',
      plan_mudanza: 'plan_mudanza',
      lugar_dormir: 'lugar_dormir',
      restricciones_vivienda: 'restricciones_vivienda',
      tipo_cama: 'tipo_cama',
      actividades: 'actividades',
      vacaciones_cuidado: 'vacaciones_cuidado',
      paseos_dia: 'paseos_dia',
      duracion_paseos: 'duracion_paseos',
      necesidades_perro: 'necesidades_perro',
      coste_veterinario_opinion: 'coste_veterinario_opinion',
      cuando_veterinario: 'cuando_veterinario',
      tipo_alimentacion: 'tipo_alimentacion',
      horas_solo: 'horas_solo',
      acepta_cambios_estimacion: 'acepta_cambios_estimacion',
      relacion_con_perros: 'relacion_con_perros',
      motivo_socializacion: 'motivo_socializacion',
      gestion_problemas_conducta: 'gestion_problemas_conducta',
      problema_necesidades: 'necesidades',
      opinion_esterilizacion: 'esterilizacion',
      ha_tenido_animales: 'ha_tenido_animales',
      edad_animales: 'edad_animales',
      motivo_perdida: 'motivo_perdida',
      puede_asumir_costes: 'puede_asumir_costes',
      alternativa_costes: 'alternativa_costes',
      ha_visitado_refugio: 'ha_visitado_refugio',
      nombre_refugio: 'nombre_refugio',
      acepta_seguimiento: 'acepta_seguimiento',
      acepta_tasa_adopcion: 'acepta_tasa_adopcion',
      motivos_devolucion: 'motivos_devolucion',
      adoptaria_otro_animal: 'adoptaria_otro_animal',
      como_conocio: 'como_conocio'
    };

    const toBoolean = (value) => {
      if (value === true) return true;
      if (value === false) return false;
      if (value === 'si' || value === 'sí' || value === 'true' || value === '1') return true;
      if (value === 'no' || value === 'false' || value === '0' || value === 'off') return false;
      return value;
    };

    if (solicitudData.problema_necesidades && solicitudData.solucion_necesidades) {
      solicitudData.problema_necesidades = `${solicitudData.problema_necesidades}. ${solicitudData.solucion_necesidades}`;
    }

    if (solicitudData.opinion_esterilizacion && solicitudData.plan_esterilizacion) {
      solicitudData.opinion_esterilizacion = `${solicitudData.opinion_esterilizacion}. ${solicitudData.plan_esterilizacion}`;
    }

    const booleanFields = [
      'es_extranjero', 'es_alquiler', 'tiene_exterior', 
      'ha_tenido_animales', 'ha_visitado_refugio', 
      'acepta_seguimiento', 'acepta_tasa_adopcion'
    ];

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      let value = solicitudData[key];
      
      const isBooleanField = booleanFields.includes(key);
      
      if (isBooleanField) {
        if (value === undefined || value === null) {
          value = false;
        } else {
          value = toBoolean(value);
        }
        campos.push(dbField);
        values.push(value);
        paramIndex++;
      } else if (value !== undefined && value !== null) {
        campos.push(dbField);
        values.push(value);
        paramIndex++;
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay datos para crear la solicitud');
    }

    const sql = `
      INSERT INTO solicitudes_adopcion (${campos.join(', ')})
      VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async getMisSolicitudes(usuarioId) {
    const result = await query(
      `SELECT sa.*, a.nombre as animal_nombre, a.imagen_url as animal_imagen, a.tamano as animal_tamano, a.especie as animal_especie, a.edad as animal_edad
       FROM solicitudes_adopcion sa
       LEFT JOIN animales a ON sa.animal_id = a.id
       WHERE sa.usuario_id = $1
       ORDER BY sa.created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async getAllSolicitudes() {
    const result = await query(
      `SELECT sa.*, a.nombre as animal_nombre, a.imagen_url as animal_imagen, u.nombre as usuario_nombre, u.email as usuario_email
       FROM solicitudes_adopcion sa
       LEFT JOIN animales a ON sa.animal_id = a.id
       LEFT JOIN usuarios u ON sa.usuario_id = u.id
       ORDER BY sa.created_at DESC`
    );
    return result.rows;
  },

  async getSolicitudesPendientes() {
    const result = await query(
      `SELECT sa.*, a.nombre as animal_nombre, a.imagen_url as animal_imagen, u.nombre as usuario_nombre, u.email as usuario_email
       FROM solicitudes_adopcion sa
       LEFT JOIN animales a ON sa.animal_id = a.id
       LEFT JOIN usuarios u ON sa.usuario_id = u.id
       WHERE sa.estado = 'pending'
       ORDER BY sa.created_at DESC`
    );
    return result.rows;
  },

  async updateSolicitudEstado(id, estado) {
    const result = await query(
      `UPDATE solicitudes_adopcion 
       SET estado = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );
    return result.rows[0];
  },

  async getMisAdopciones(usuarioId) {
    const result = await query(
      `SELECT ad.*, a.nombre as animal_nombre, a.imagen_url as animal_imagen, a.tamano as animal_tamano, a.edad as animal_edad
       FROM adopciones ad
       LEFT JOIN animales a ON ad.animal_id = a.id
       WHERE ad.usuario_id = $1
       ORDER BY ad.fecha_adopcion DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async createAdopcion(solicitudId, animalId, usuarioId) {
    const { getClient } = require('../config/db');
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const solicitud = await client.query(
        'SELECT * FROM solicitudes_adopcion WHERE id = $1',
        [solicitudId]
      );

      await client.query(
        `UPDATE animales SET estado = 'adoptado', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [animalId]
      );

      const result = await client.query(
        `INSERT INTO adopciones (solicitud_id, animal_id, usuario_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [solicitudId, animalId, usuarioId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getAnimalBySolicitud(solicitudId) {
    const result = await query(
      `SELECT a.* FROM animales a
       JOIN solicitudes_adopcion sa ON sa.animal_id = a.id
       WHERE sa.id = $1`,
      [solicitudId]
    );
    return result.rows[0];
  },

  async getAllAnimalesAdmin() {
    const result = await query(
      'SELECT * FROM animales ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async createAnimal(animalData) {
    const campos = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      nombre: 'nombre',
      especie: 'especie',
      edad: 'edad',
      tamano: 'tamano',
      caracter: 'caracter',
      salud: 'salud',
      imagen_url: 'imagen_url',
      peso: 'peso',
      urgente: 'urgente'
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (animalData[key] !== undefined && animalData[key] !== null && animalData[key] !== '') {
        campos.push(dbField);
        values.push(animalData[key]);
        paramIndex++;
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay datos para crear el animal');
    }

    const sql = `
      INSERT INTO animales (${campos.join(', ')})
      VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async updateAnimal(id, animalData) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      nombre: 'nombre',
      especie: 'especie',
      edad: 'edad',
      tamano: 'tamano',
      caracter: 'caracter',
      salud: 'salud',
      imagen_url: 'imagen_url',
      peso: 'peso',
      urgente: 'urgente',
      estado: 'estado'
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (animalData[key] !== undefined) {
        updates.push(`${dbField} = $${paramIndex++}`);
        values.push(animalData[key]);
      }
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE animales SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async deleteAnimal(id) {
    const result = await query(
      'DELETE FROM animales WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async getSolicitudDetalle(solicitudId) {
    const result = await query(
      `SELECT sa.*, 
              a.nombre, 
              a.especie, 
              a.edad, 
              a.tamano,
              a.caracter,
              a.salud,
              a.imagen_url
       FROM solicitudes_adopcion sa
       LEFT JOIN animales a ON sa.animal_id = a.id
       WHERE sa.id = $1`,
      [solicitudId]
    );
    const row = result.rows[0];
    if (row) {
      return {
        ...row,
        animal_nombre: row.nombre,
        animal_especie: row.especie,
        animal_edad: row.edad,
        animal_tamano: row.tamano,
        animal_caracter: row.caracter,
        animal_salud: row.salud,
        animal_imagen: row.imagen_url
      };
    }
    return row;
  },

  async rechazarOtrasSolicitudes(animalId, exceptSolicitudId, motivo) {
    const result = await query(
      `UPDATE solicitudes_adopcion 
       SET estado = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE animal_id = $1 
       AND id != $2 
       AND estado = 'pending'
       RETURNING id`,
      [animalId, exceptSolicitudId]
    );
    return result.rows;
  },

async getSolicitudesPorAnimal(animalId) {
    const result = await query(
      'SELECT * FROM solicitudes_adopcion WHERE animal_id = $1',
      [animalId]
    );
    return result.rows;
  },

  async eliminarSolicitudesPorAnimal(animalId) {
    const result = await query(
      'DELETE FROM solicitudes_adopcion WHERE animal_id = $1 RETURNING id',
      [animalId]
    );
    return result.rows;
  },

  async eliminarAdopcionesPorAnimal(animalId) {
    const result = await query(
      'DELETE FROM adopciones WHERE animal_id = $1 RETURNING id',
      [animalId]
    );
    return result.rows;
  },

  async updateSolicitudConMotivo(solicitudId, estado, motivo) {
    try {
      const result = await query(
        'UPDATE solicitudes_adopcion SET estado = $1, motivo_rechazo = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [estado, motivo || null, solicitudId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updateSolicitudConMotivo:', error.message);
      throw error;
    }
  },

  async eliminarMiSolicitud(solicitudId, usuarioId) {
    const result = await query(
      'DELETE FROM solicitudes_adopcion WHERE id = $1 AND usuario_id = $2 AND estado = $3 RETURNING id',
      [solicitudId, usuarioId, 'pending']
    );
    return result.rows[0];
  }
};

module.exports = animalRepository;