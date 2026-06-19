const contactoService = require('../services/contacto.service');
const contactoRepository = require('../repositories/contacto.repository');

const contactoController = {
  async crearMensaje(req, res, next) {
    try {
      const { nombre, email, telefono, mensaje, tipo } = req.body;

      if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
      }

      const mensajeGuardado = await contactoService.crearMensaje({
        nombre,
        email,
        telefono,
        mensaje,
        tipoConsulta: tipo
      });

      res.status(201).json({
        message: 'Mensaje enviado correctamente',
        data: mensajeGuardado
      });
    } catch (error) {
      next(error);
    }
  },

  async crearSolicitudAcogida(req, res, next) {
    try {
      const userId = req.user?.id || null;
      
      const {
        nombre_completo, dni, telefono,
        tipo_vivienda, otra_vivienda, vivienda_propia, permiso_alquiler,
        tiene_exterior, exterior_descripcion,
        otras_personas, num_personas, todos_de_acuerdo,
        hay_ninos, edad_ninos,
        tiene_otros_animales, tipo_otros_animales, vaccinated_otros,
        tiempo_acogida, horas_solo,
        tipo_animal,
        experiencia_previa, experiencia_detalles,
        motivo_acogida, comentarios
      } = req.body;

      const userEmail = req.user?.email || null;

      if (!nombre_completo || !dni || !telefono || !userEmail) {
        return res.status(400).json({ error: 'Los campos marcados con * son requeridos' });
      }

      const tipoAnimalStr = Array.isArray(tipo_animal) ? tipo_animal.join(', ') : tipo_animal;

      const solicitud = await contactoService.crearSolicitudAcogida({
        nombre_completo: nombre_completo || null,
        dni: dni || null,
        telefono: telefono || null,
        email: userEmail,
        tipo_vivienda: tipo_vivienda || null,
        otra_vivienda: otra_vivienda || null,
        vivienda_propia: vivienda_propia || null,
        permiso_alquiler: Boolean(permiso_alquiler),
        tiene_exterior: Boolean(tiene_exterior),
        exterior_descripcion: exterior_descripcion || null,
        otras_personas: Boolean(otras_personas),
        num_personas: num_personas || null,
        todos_de_acuerdo: Boolean(todos_de_acuerdo),
        hay_ninos: Boolean(hay_ninos),
        edad_ninos: edad_ninos || null,
        tiene_otros_animales: Boolean(tiene_otros_animales),
        tipo_otros_animales: tipo_otros_animales || null,
        vaccinated_otros: Boolean(vaccinated_otros),
        tiempo_acogida: tiempo_acogida || null,
        horas_solo: horas_solo || null,
        tipo_animal: tipoAnimalStr,
        experiencia_previa: Boolean(experiencia_previa),
        experiencia_detalles: experiencia_detalles || null,
        motivo_acogida: motivo_acogida || null,
        comentarios: comentarios || null,
        usuario_id: userId
      });

      res.status(201).json({
        message: 'Solicitud enviada correctamente',
        data: solicitud
      });
    } catch (error) {
      next(error);
    }
  },

  async getAnimalesDisponibles(req, res, next) {
    try {
      const animales = await contactoRepository.getAnimalesDisponibles();
      res.json(animales);
    } catch (error) {
      next(error);
    }
  },

  async getSolicitudesAcogida(req, res, next) {
    try {
      const { estado } = req.query;
      const solicitudes = await contactoRepository.getSolicitudesAcogida({ estado });
      res.json(solicitudes);
    } catch (error) {
      next(error);
    }
  },

  async getMisAcogidas(req, res, next) {
    try {
      const userId = req.user.id;
      const acogidas = await contactoRepository.getMisAcogidas(userId);
      res.json(acogidas);
    } catch (error) {
      next(error);
    }
  },

  async eliminarSolicitudAcogida(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await contactoRepository.eliminarSolicitudAcogida(id, userId);
      if (!result) {
        return res.status(404).json({ error: 'Solicitud no encontrada o no se puede eliminar' });
      }
      res.json({ message: 'Solicitud eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  },

  async aprobarAcogida(req, res, next) {
    try {
      const { id } = req.params;
      const result = await contactoService.aprobarAcogida(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async rechazarAcogida(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const result = await contactoService.rechazarAcogida(id, motivo);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async asignarAnimal(req, res, next) {
    try {
      const { id } = req.params;
      const { animal_id } = req.body;
      const result = await contactoService.asignarAnimalAcogida(id, animal_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async aceptarAnimalAsignado(req, res, next) {
    try {
      const { id } = req.params;
      const result = await contactoService.aceptarAnimalAsignado(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async rechazarAnimalAsignado(req, res, next) {
    try {
      const { id } = req.params;
      const result = await contactoService.rechazarAnimalAsignado(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = contactoController;