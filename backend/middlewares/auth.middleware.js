const authService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const usuario = await authService.verificarToken(token);

    req.user = usuario;
    next();
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message || 'Token inválido' });
  }
};

module.exports = authMiddleware;
module.exports.authenticateToken = authMiddleware;