const noticiaRepository = require('../repositories/noticia.repository');
const userRepository = require('../repositories/user.repository');
const notificationRepository = require('../repositories/notification.repository');

const noticiaService = {
  async getAll(filtros = {}) {
    return await noticiaRepository.getAll(filtros);
  },

  async getById(id) {
    const noticia = await noticiaRepository.getById(id);
    if (!noticia) {
      throw new Error('Noticia no encontrada');
    }
    return noticia;
  },

  async create(noticiaData) {
    if (!noticiaData.titulo) {
      throw new Error('El título es obligatorio');
    }
    const noticia = await noticiaRepository.create(noticiaData);
    
    const usuarios = await userRepository.getAllUsuariosExceptoAdmin();
    
    for (const usuario of usuarios) {
      await notificationRepository.create({
        usuarioId: usuario.id,
        tipo: 'nueva_noticia',
        mensaje: 'Nueva noticia: ' + noticia.titulo,
        referenciaId: noticia.id
      });
    }
    
    return noticia;
  },

  async update(id, noticiaData) {
    const existente = await noticiaRepository.getById(id);
    if (!existente) {
      throw new Error('Noticia no encontrada');
    }
    return await noticiaRepository.update(id, noticiaData);
  },

  async delete(id) {
    const existente = await noticiaRepository.getById(id);
    if (!existente) {
      throw new Error('Noticia no encontrada');
    }
    
    await notificationRepository.deleteByReferenciaId(id);
    
    return await noticiaRepository.delete(id);
  }
};

module.exports = noticiaService;