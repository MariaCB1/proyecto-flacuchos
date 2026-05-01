const contactoService = require('../services/contacto.service');

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
  }
};

module.exports = contactoController;