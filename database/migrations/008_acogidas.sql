-- ============================================
-- MIGRACIÓN 008: Sistema de Acogidas Mejorado
-- ============================================

-- 1. Añadir campo en_acogida a animales
ALTER TABLE animales ADD COLUMN IF NOT EXISTS en_acogida BOOLEAN DEFAULT FALSE;

-- 2. Añadir campos a solicitud_casa_acogida para gestión de estado
ALTER TABLE solicitud_casa_acogida ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected', 'asignado_pendiente', 'aceptado'));
ALTER TABLE solicitud_casa_acogida ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE solicitud_casa_acogida ADD COLUMN IF NOT EXISTS animal_asignado_id UUID REFERENCES animales(id);
ALTER TABLE solicitud_casa_acogida ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);
ALTER TABLE solicitud_casa_acogida ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Añadir nuevos tipos de notificación
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacion') THEN
        CREATE TYPE tipo_notificacion AS ENUM (
            'solicitud_adopcion',
            'cambio_estado',
            'solicitud_socio',
            'solicitud_acogida',
            'mensaje_contacto',
            'sistema',
            'solicitud_rechazada',
            'solicitud_aprobada',
            'solicitud_eliminada',
            'nueva_noticia',
            'nuevo_evento',
            'evento_cancelado',
            'evento_modificado',
            'solicitud_inscripcion',
            'inscripcion_cancelada'
        );
    END IF;
END
$$;

-- Añadir nuevos valores al tipo si ya existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacion') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'solicitud_acogida_aprobada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')) THEN
            ALTER TYPE tipo_notificacion ADD VALUE 'solicitud_acogida_aprobada';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'solicitud_acogida_rechazada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')) THEN
            ALTER TYPE tipo_notificacion ADD VALUE 'solicitud_acogida_rechazada';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'solicitud_acogida_asignada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')) THEN
            ALTER TYPE tipo_notificacion ADD VALUE 'solicitud_acogida_asignada';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'solicitud_acogida_aceptada' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_notificacion')) THEN
            ALTER TYPE tipo_notificacion ADD VALUE 'solicitud_acogida_aceptada';
        END IF;
    END IF;
END
$$;

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_animales_en_acogida ON animales(en_acogida) WHERE en_acogida = false;
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_estado ON solicitud_casa_acogida(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_usuario ON solicitud_casa_acogida(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);