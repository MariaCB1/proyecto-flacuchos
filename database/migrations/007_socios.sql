-- ============================================
-- TABLA: SOCIOS
-- ============================================
CREATE TABLE IF NOT EXISTS socios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_price_id TEXT NOT NULL,
    nombre_apellidos TEXT,
    dni_nie TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    codigo_postal TEXT,
    ciudad_provincia TEXT,
    aportacion INTEGER NOT NULL,
    forma_pago TEXT DEFAULT 'tarjeta',
    participacion BOOLEAN DEFAULT FALSE,
    quiere_voluntario BOOLEAN DEFAULT FALSE,
    comentarios TEXT,
    metodo_pago TEXT NOT NULL DEFAULT 'card',
    estado TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_socios_usuario ON socios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_socios_stripe ON socios(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_socios_estado ON socios(estado);
CREATE INDEX IF NOT EXISTS idx_socios_email ON socios(email);