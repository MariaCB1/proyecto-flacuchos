const transparenciaService = require('../services/transparencia.service');

const transparenciaController = {
  async getDocumentos(req, res) {
    try {
      const documentos = await transparenciaService.getDocumentos();
      res.json(documentos);
    } catch (error) {
      console.error('Error getting documentos:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateDocumento(req, res) {
    try {
      const { tipo } = req.params;
      const { titulo, contenido, archivo_url, botones_json } = req.body;

      const documento = await transparenciaService.updateDocumento(tipo, {
        titulo,
        contenido,
        archivo_url,
        botones_json
      });

      res.json(documento);
    } catch (error) {
      console.error('Error updating documento:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getJustificantes(req, res) {
    try {
      const { año } = req.query;
      const justificantes = await transparenciaService.getJustificantes(año || null);
      res.json(justificantes);
    } catch (error) {
      console.error('Error getting justificantes:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAñosJustificantes(req, res) {
    try {
      const años = await transparenciaService.getAñosConJustificantes();
      res.json(años);
    } catch (error) {
      console.error('Error getting años:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createJustificante(req, res) {
    try {
      const { año, concepto, importe, archivo_url } = req.body;
      const justificante = await transparenciaService.createJustificante({
        año: parseInt(año),
        concepto,
        importe: parseFloat(importe),
        archivo_url
      });
      res.status(201).json(justificante);
    } catch (error) {
      console.error('Error creating justificante:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateJustificante(req, res) {
    try {
      const { id } = req.params;
      const { año, concepto, importe, archivo_url } = req.body;
      const justificante = await transparenciaService.updateJustificante(id, {
        año: año ? parseInt(año) : undefined,
        concepto,
        importe: importe ? parseFloat(importe) : undefined,
        archivo_url
      });
      res.json(justificante);
    } catch (error) {
      console.error('Error updating justificante:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteJustificante(req, res) {
    try {
      const { id } = req.params;
      await transparenciaService.deleteJustificante(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting justificante:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = transparenciaController;