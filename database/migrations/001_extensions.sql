-- Migration 001: Extensiones necesarias
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

-- Habilitar UUID como tipo nativo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar crypt() para hashes de contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

COMMENT ON EXTENSION "uuid-ossp" IS 'Generador de UUIDs';
COMMENT ON EXTENSION "pgcrypto" IS 'Funciones criptográficas para hashing';