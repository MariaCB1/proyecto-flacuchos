const voluntarioService = require('../services/voluntario.service');

const voluntarioController = {
  async crearSolicitud(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const {
        telefono, dni,
        disponibilidad_dias, disponibilidad_horario,
        tiene_vehiculo, motivacion, experiencia, comentarios
      } = req.body;

      if (!telefono || !dni) {
        return res.status(400).json({ error: 'Teléfono y DNI son requeridos' });
      }

      const voluntario = await voluntarioService.crearVoluntario({
        usuario_id: userId,
        telefono,
        dni,
        disponibilidad_dias,
        disponibilidad_horario,
        tiene_vehiculo,
        motivacion,
        experiencia,
        comentarios
      });

      res.status(201).json({
        message: 'Registro como voluntario completado',
        data: voluntario
      });
    } catch (error) {
      next(error);
    }
  },

  async getMisDatos(req, res, next) {
    try {
      const userId = req.user.id;
      const voluntario = await voluntarioService.getVoluntarioByUsuarioId(userId);
      if (!voluntario) {
        return res.status(404).json({ error: 'No estás registrado como voluntario' });
      }
      res.json(voluntario);
    } catch (error) {
      next(error);
    }
  },

  async handleMiEstado(req, res, next) {
    try {
      const userId = req.user.id;
      const { activo } = req.body;
      await voluntarioService.toggleMiEstado(userId, activo);
      res.json({ message: activo ? 'Voluntario activado' : 'Voluntario desactivado' });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const voluntarios = await voluntarioService.getAllVoluntarios();
      res.json(voluntarios);
    } catch (error) {
      next(error);
    }
  },

  async toggleActivo(req, res, next) {
    try {
      const { usuarioId } = req.params;
      const { activo } = req.body;
      await voluntarioService.toggleMiEstado(usuarioId, activo);
      res.json({ message: 'Estado actualizado' });
    } catch (error) {
      next(error);
    }
  },

  async actualizarVoluntario(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        telefono, dni,
        disponibilidad_dias, disponibilidad_horario,
        tiene_vehiculo, motivacion, experiencia, comentarios
      } = req.body;

      if (!telefono || !dni) {
        return res.status(400).json({ error: 'Teléfono y DNI son requeridos' });
      }

      const voluntario = await voluntarioService.actualizarVoluntario(userId, {
        telefono,
        dni,
        disponibilidad_dias,
        disponibilidad_horario,
        tiene_vehiculo,
        motivacion,
        experiencia,
        comentarios
      });

      res.json({ message: 'Datos actualizados correctamente', data: voluntario });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = voluntarioController;