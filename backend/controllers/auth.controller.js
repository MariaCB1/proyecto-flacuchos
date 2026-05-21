const Joi = require('joi');
const authService = require('../services/auth.service');

const registroSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  contrasena: Joi.string().min(6).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().required(),
});

const recuperarSolicitudSchema = Joi.object({
  email: Joi.string().email().required(),
});

const recuperarRestablecerSchema = Joi.object({
  token: Joi.string().required(),
  contrasena: Joi.string().min(6).max(50).required(),
});

const verificarEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const reenviarVerificacionSchema = Joi.object({
  email: Joi.string().email().required(),
});

const authController = {
  async handleRegistro(req, res) {
    try {
      const { error, value } = registroSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.registro(value);
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleLogin(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.login(value);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleLogout(req, res) {
    res.json({ message: 'Logout exitoso' });
  },

  async handleVerify(req, res) {
    try {
      const usuario = req.user;
      res.json({
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          es_voluntario: usuario.es_voluntario || false,
          voluntario_activo: usuario.voluntario_activo || false,
          es_socio: usuario.es_socio || false,
          email_verificado: usuario.email_verificado || false,
        },
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleRecuperarSolicitud(req, res) {
    try {
      const { error, value } = recuperarSolicitudSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.solicitarRecuperacion(value.email);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleRecuperarRestablecer(req, res) {
    try {
      const { error, value } = recuperarRestablecerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.restablecerContrasena(value.token, value.contrasena);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleVerificarEmail(req, res) {
    try {
      const { error, value } = verificarEmailSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.verificarEmail(value.token);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleReenviarVerificacion(req, res) {
    try {
      const { error, value } = reenviarVerificacionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.reenviarVerificacion(value.email);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleGetEstadoVerificacion(req, res) {
    try {
      const result = await authService.getEstadoVerificacion(req.user.id);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async handleReenviarPublico(req, res) {
    try {
      const { error, value } = reenviarVerificacionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await authService.reenviarVerificacionPublico(value.email);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },
};

module.exports = authController;