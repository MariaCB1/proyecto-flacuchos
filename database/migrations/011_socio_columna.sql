-- ============================================
-- AÑADIR COLUMNA es_socio A USUARIOS Y TIPOS DE NOTIFICACION
-- ============================================

-- Añadir columna es_socio a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS es_socio BOOLEAN DEFAULT FALSE;

-- Añadir tipos de notificación para socios (si no existen)
DO $$
BEGIN
    -- Intentar añadir cada valor individualmente
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'socio_aprobado') THEN
        ALTER TYPE tipo_notificacion ADD VALUE 'socio_aprobado';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'nuevo_socio') THEN
        ALTER TYPE tipo_notificacion ADD VALUE 'nuevo_socio';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'socio_cancelado') THEN
        ALTER TYPE tipo_notificacion ADD VALUE 'socio_cancelado';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'socio_caido') THEN
        ALTER TYPE tipo_notificacion ADD VALUE 'socio_caido';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

-- Crear índice para es_socio
CREATE INDEX IF NOT EXISTS idx_usuarios_es_socio ON usuarios(es_socio);