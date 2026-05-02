const Joi = require('joi');
const userService = require('../services/user.service');

const perfilSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  contrasena: Joi.string().min(6).max(50),
});

const cambiarContrasenaSchema = Joi.object({
  contrasenaActual: Joi.string().required(),
  nuevaContrasena: Joi.string().min(8).max(50).required(),
});

const userController = {
  async handleGetPerfil(req, res) {
    try {
      const usuario = await userService.getPerfil(req.user.id);
      res.json(usuario);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleUpdatePerfil(req, res) {
    try {
      const { error, value } = perfilSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const usuario = await userService.updatePerfil(req.user.id, value);
      res.json(usuario);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleCambiarContrasena(req, res) {
    try {
      const { error, value } = cambiarContrasenaSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await userService.cambiarContrasena(req.user.id, value.contrasenaActual, value.nuevaContrasena);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },
};

module.exports = userController;