const noticiaService = require('../services/noticia.service');

const noticiaController = {
  async getNoticias(req, res, next) {
    try {
      const filtros = {
        categoria: req.query.categoria,
        busqueda: req.query.busqueda,
        orden: req.query.orden,
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta
      };
      const noticias = await noticiaService.getAll(filtros);
      res.json(noticias);
    } catch (error) {
      next(error);
    }
  },

  async getNoticiaById(req, res, next) {
    try {
      const noticia = await noticiaService.getById(req.params.id);
      res.json(noticia);
    } catch (error) {
      next(error);
    }
  },

  async createNoticia(req, res, next) {
    try {
      const noticia = await noticiaService.create(req.body);
      res.status(201).json(noticia);
    } catch (error) {
      next(error);
    }
  },

  async updateNoticia(req, res, next) {
    try {
      const noticia = await noticiaService.update(req.params.id, req.body);
      res.json(noticia);
    } catch (error) {
      next(error);
    }
  },

  async deleteNoticia(req, res, next) {
    try {
      const noticia = await noticiaService.delete(req.params.id);
      res.json({ message: 'Noticia eliminada', noticia });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = noticiaController;