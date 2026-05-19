const transparenciaRepository = require('../repositories/transparencia.repository');

const transparenciaService = {
  async getDocumentos() {
    return await transparenciaRepository.getAll();
  },

  async getDocumentoByTipo(tipo) {
    const documento = await transparenciaRepository.getByTipo(tipo);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }
    return documento;
  },

  async updateDocumento(tipo, data) {
    const documento = await transparenciaRepository.getByTipo(tipo);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    const updateData = {
      titulo: data.titulo !== undefined ? data.titulo : documento.titulo,
      contenido: data.contenido !== undefined ? data.contenido : documento.contenido,
      archivo_url: data.archivo_url !== undefined ? data.archivo_url : documento.archivo_url,
      botones_json: data.botones_json !== undefined ? data.botones_json : (documento.botones_json || [])
    };

    return await transparenciaRepository.update(tipo, updateData);
  },

  async getJustificantes(año = null) {
    return await transparenciaRepository.getJustificantes(año);
  },

  async getAñosConJustificantes() {
    return await transparenciaRepository.getAñosConJustificantes();
  },

  async createJustificante(data) {
    const añoActual = new Date().getFullYear();
    if (data.año > añoActual) {
      throw new Error('No se pueden crear justificantes para años futuros');
    }
    if (data.año < 2000) {
      throw new Error('El año debe ser válido');
    }
    if (!data.concepto || data.concepto.trim() === '') {
      throw new Error('El concepto es obligatorio');
    }
    if (data.importe !== 0 && (!data.importe || data.importe < 0)) {
      throw new Error('El importe no puede ser negativo');
    }
    return await transparenciaRepository.createJustificante(data);
  },

  async updateJustificante(id, data) {
    if (data.año) {
      const añoActual = new Date().getFullYear();
      if (data.año > añoActual) {
        throw new Error('No se pueden crear justificantes para años futuros');
      }
    }
    return await transparenciaRepository.updateJustificante(id, data);
  },

  async deleteJustificante(id) {
    return await transparenciaRepository.deleteJustificante(id);
  }
};

module.exports = transparenciaService;