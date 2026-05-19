-- Migration: Sistema de Voluntarios Simplificado
-- Fecha: 2026-05-12
-- Proyecto: Protectora Flacuchos

-- ============================================
-- 1. AÑADIR CAMPOS A TABLA USUARIOS
-- ============================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS es_voluntario BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS voluntario_activo BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. NUEVA TABLA VOLUNTARIOS
-- ============================================
DROP TABLE IF EXISTS voluntarios CASCADE;
CREATE TABLE voluntarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
    telefono TEXT NOT NULL,
    dni TEXT NOT NULL,
    disponibilidad_dias TEXT,
    disponibilidad_horario TEXT,
    tiene_vehiculo BOOLEAN DEFAULT FALSE,
    motivacion TEXT,
    experiencia TEXT,
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voluntarios_usuario ON voluntarios(usuario_id);
CREATE INDEX idx_voluntarios_created_at ON voluntarios(created_at);

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trg_voluntarios_timestamp ON voluntarios;
CREATE TRIGGER trg_voluntarios_timestamp
    BEFORE UPDATE ON voluntarios
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ============================================
-- 3. AÑADIR TIPOS DE NOTIFICACIÓN
-- ============================================
ALTER TYPE tipo_notificacion ADD VALUE IF NOT EXISTS 'solicitud_voluntario';
ALTER TYPE tipo_notificacion ADD VALUE IF NOT EXISTS 'voluntario_registrado';

-- ============================================
-- 4. ELIMINAR TABLA ANTIGUA SI EXISTE
-- ============================================
DROP TABLE IF EXISTS solicitudes_voluntario CASCADE;
