require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const animalRoutes = require('./routes/animal.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/notificaciones', notificationRoutes);
app.use('/', animalRoutes);
app.use('/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /auth/registro`);
  console.log(`   POST /auth/login`);
  console.log(`   POST /auth/logout`);
  console.log(`   GET  /auth/verify`);
  console.log(`   GET  /usuarios/perfil`);
  console.log(`   PUT  /usuarios/perfil`);
  console.log(`   GET  /notificaciones`);
  console.log(`   GET  /notificaciones/no-leidas`);
  console.log(`   PUT  /notificaciones/:id/leer`);
  console.log(`   GET  /animales`);
  console.log(`   GET  /animales/todos`);
  console.log(`   GET  /animales/:id`);
  console.log(`   POST /animales`);
  console.log(`   PUT  /animales/:id`);
  console.log(`   DELETE /animales/:id`);
  console.log(`   POST /solicitudes/:animalId`);
  console.log(`   GET  /solicitudes/mis-solicitudes`);
  console.log(`   GET  /solicitudes`);
  console.log(`   PUT  /solicitudes/:id/aprobar`);
  console.log(`   PUT  /solicitudes/:id/rechazar`);
  console.log(`   GET  /adopciones/mis-adopciones`);
});

module.exports = app;