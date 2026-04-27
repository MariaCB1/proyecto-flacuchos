-- Migration 002: Enums del sistema
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

-- Rol de usuario en el sistema
DROP TYPE IF EXISTS rol_usuario CASCADE;
CREATE TYPE rol_usuario AS ENUM ('admin', 'usuario');

-- Estado del animal en el sistema de adopción
DROP TYPE IF EXISTS estado_animal CASCADE;
CREATE TYPE estado_animal AS ENUM ('disponible', 'adoptado');

-- Estado de la solicitud de adopción
DROP TYPE IF EXISTS estado_solicitud CASCADE;
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- Tipo de vivienda para acogida
DROP TYPE IF EXISTS tipo_vivienda_acogida CASCADE;
CREATE TYPE tipo_vivienda_acogida AS ENUM ('piso', 'casa', 'otro');

-- Tipo de propiedad de la vivienda
DROP TYPE IF EXISTS propiedad_vivienda CASCADE;
CREATE TYPE propiedad_vivienda AS ENUM ('propia', 'alquiler');

-- Disponibilidad para acogida
DROP TYPE IF EXISTS disponibilidad_acogida CASCADE;
CREATE TYPE disponibilidad_acogida AS ENUM ('dias', 'semanas', 'meses', 'indefinido');

-- Tipo de notificación
DROP TYPE IF EXISTS tipo_notificacion CASCADE;
CREATE TYPE tipo_notificacion AS ENUM (
    'solicitud_adopcion',
    'cambio_estado',
    'solicitud_socio',
    'solicitud_acogida',
    'mensaje_contacto',
    'sistema'
);