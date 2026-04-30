const animalService = require('../services/animal.service');
const storage = require('../config/storage');

const getFileNameFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const animalController = {
  async getAnimales(req, res, next) {
    try {
      const filtros = {
        estado: req.query.estado,
        urgente: req.query.urgente,
        tipo: req.query.tipo,
        tamano: req.query.tamano,
        busqueda: req.query.busqueda,
        orden: req.query.orden
      };
      
      const animales = await animalService.getAnimales(filtros);
      res.json(animales);
    } catch (error) {
      next(error);
    }
  },

  async getAnimalById(req, res, next) {
    try {
      const animal = await animalService.getAnimalById(req.params.id);
      res.json(animal);
    } catch (error) {
      next(error);
    }
  },

  async crearSolicitud(req, res, next) {
    try {
      const animalId = req.params.animalId;
      const usuarioId = req.user.id;
      
      const solicitud = await animalService.crearSolicitud(req.body, usuarioId, animalId);
      res.status(201).json(solicitud);
    } catch (error) {
      next(error);
    }
  },

  async getMisSolicitudes(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const solicitudes = await animalService.getMisSolicitudes(usuarioId);
      res.json(solicitudes);
    } catch (error) {
      next(error);
    }
  },

  async getAllSolicitudes(req, res, next) {
    try {
      const solicitudes = await animalService.getAllSolicitudes();
      res.json(solicitudes);
    } catch (error) {
      next(error);
    }
  },

  async getSolicitudesPendientes(req, res, next) {
    try {
      const solicitudes = await animalService.getSolicitudesPendientes();
      res.json(solicitudes);
    } catch (error) {
      next(error);
    }
  },

  async aprobarSolicitud(req, res, next) {
    try {
      const resultado = await animalService.aprobarSolicitud(req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async rechazarSolicitud(req, res, next) {
    try {
      const { motivo } = req.body;
      const resultado = await animalService.rechazarSolicitud(req.params.id, motivo);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async getMisAdopciones(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const adopciones = await animalService.getMisAdopciones(usuarioId);
      res.json(adopciones);
    } catch (error) {
      next(error);
    }
  },

  async eliminarMiSolicitud(req, res, next) {
    try {
      const resultado = await animalService.eliminarMiSolicitud(req.params.id, req.user.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  async getSolicitudById(req, res, next) {
    try {
      const solicitud = await animalService.getSolicitudById(req.params.id);
      res.json(solicitud);
    } catch (error) {
      next(error);
    }
  },

  async getAllAnimalesAdmin(req, res, next) {
    try {
      const animales = await animalService.getAllAnimalesAdmin();
      res.json(animales);
    } catch (error) {
      next(error);
    }
  },

  async createAnimal(req, res, next) {
    try {
      const animal = await animalService.createAnimal(req.body);
      res.status(201).json(animal);
    } catch (error) {
      next(error);
    }
  },

  async updateAnimal(req, res, next) {
    try {
      const animalActual = await animalService.getAnimalById(req.params.id);
      
      if (animalActual?.imagen_url && req.body.imagen_url && animalActual.imagen_url !== req.body.imagen_url) {
        const fileName = getFileNameFromUrl(animalActual.imagen_url);
        if (fileName) {
          try {
            await storage.delete(fileName);
            console.log(`Imagen anterior eliminada del storage: ${fileName}`);
          } catch (storageError) {
            console.warn('No se pudo eliminar la imagen anterior del storage:', storageError.message);
          }
        }
      }
      
      const animal = await animalService.updateAnimal(req.params.id, req.body);
      res.json(animal);
    } catch (error) {
      next(error);
    }
  },

  async deleteAnimal(req, res, next) {
    try {
      const animalActual = await animalService.getAnimalById(req.params.id);
      
      if (animalActual?.imagen_url) {
        const fileName = getFileNameFromUrl(animalActual.imagen_url);
        if (fileName) {
          try {
            await storage.delete(fileName);
            console.log(`Imagen eliminada del storage: ${fileName}`);
          } catch (storageError) {
            console.warn('No se pudo eliminar la imagen del storage:', storageError.message);
          }
        }
      }
      
      const animal = await animalService.deleteAnimal(req.params.id);
      res.json({ message: 'Animal eliminado', animal });
    } catch (error) {
      next(error);
    }
  },

  async getSolicitudDetalle(req, res, next) {
    try {
      const solicitud = await animalService.getSolicitudDetalle(req.params.id);
      res.json(solicitud);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = animalController;