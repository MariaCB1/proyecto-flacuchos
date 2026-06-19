const socioService = require('../services/socio.service');

const socioController = {
  async listarSocios(req, res) {
    try {
      const result = await socioService.listarSocios();
      res.json(result);
    } catch (error) {
      console.error('Error al listar socios:', error);
      res.status(500).json({ error: 'Error al listar los socios' });
    }
  },

  async getMiSocio(req, res) {
    try {
      const usuarioId = req.user.id;
      const result = await socioService.getSocioByUsuarioId(usuarioId);
      res.json(result || null);
    } catch (error) {
      console.error('Error al obtener socio:', error);
      res.status(500).json({ error: 'Error al obtener el socio' });
    }
  },

  async cancelarMiSocio(req, res) {
    try {
      const usuarioId = req.user.id;
      const result = await socioService.cancelarMiSocio(usuarioId);
      res.json(result);
    } catch (error) {
      console.error('Error al cancelar socio:', error);
      res.status(500).json({ error: error.message || 'Error al cancelar la membership' });
    }
  },

  async getSociosConStats(req, res) {
    try {
      const result = await socioService.getSociosConStats();
      res.json(result);
    } catch (error) {
      console.error('Error al obtener socios con stats:', error);
      res.status(500).json({ error: 'Error al obtener los socios' });
    }
  },

  async checkFueSocioEsteMes(req, res) {
    try {
      const usuarioId = req.user.id;
      const result = await socioService.fueSocioEsteMes(usuarioId);
      res.json({ fueSocioEsteMes: !!result });
    } catch (error) {
      console.error('Error al verificar socio este mes:', error);
      res.status(500).json({ error: 'Error al verificar' });
    }
  },

  async getMiTotalHistorico(req, res) {
    try {
      const usuarioId = req.user.id;
      const result = await socioService.getTotalHistorico(usuarioId);
      res.json({ totalHistorico: result });
    } catch (error) {
      console.error('Error al obtener total histórico:', error);
      res.status(500).json({ error: 'Error al obtener' });
    }
  }
};

module.exports = socioController;