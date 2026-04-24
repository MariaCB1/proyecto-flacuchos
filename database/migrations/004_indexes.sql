-- Migration 004: Índices del sistema
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

-- ============================================
-- ÍNDICES: USUARIOS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_at ON usuarios(created_at);

-- ============================================
-- ÍNDICES: ANIMALES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_animales_estado ON animales(estado);
CREATE INDEX IF NOT EXISTS idx_animales_urgente ON animales(urgente);
CREATE INDEX IF NOT EXISTS idx_animales_tamano ON animales(tamano);
CREATE INDEX IF NOT EXISTS idx_animales_created_at ON animales(created_at);

-- ============================================
-- ÍNDICES: SOLICITUDES_ADOPCION
-- ============================================
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_animal ON solicitudes_adopcion(animal_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_adopcion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_adopcion(created_at);

-- ============================================
-- ÍNDICES: ADOPCIONES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_adopciones_solicitud ON adopciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_animal ON adopciones(animal_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_usuario ON adopciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_fecha ON adopciones(fecha_adopcion);

-- ============================================
-- ÍNDICES: NOTICIAS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at);

-- ============================================
-- ÍNDICES: EVENTOS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_created_at ON eventos(created_at);

-- ============================================
-- ÍNDICES: SOLICITUD_SOCIO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_solicitud_socio_usuario ON solicitud_socio(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_socio_created_at ON solicitud_socio(created_at);

-- ============================================
-- ÍNDICES: SOLICITUD_CASA_ACOGIDA
-- ============================================
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_usuario ON solicitud_casa_acogida(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_tipo ON solicitud_casa_acogida(tipo_vivienda);
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_created_at ON solicitud_casa_acogida(created_at);

-- ============================================
-- ÍNDICES: MENSAJES_CONTACTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mensajes_email ON mensajes_contacto(email);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON mensajes_contacto(created_at);

-- ============================================
-- ÍNDICES: NOTIFICACIONES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(leido);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON notificaciones(created_at);