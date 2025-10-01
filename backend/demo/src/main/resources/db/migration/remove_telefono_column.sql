-- Migración: Eliminar columna telefono de la tabla usuarios
-- Fecha: 2025-10-01
-- Razón: Por seguridad, no se debe almacenar información de contacto de administradores

-- Eliminar columna telefono de la tabla usuarios
ALTER TABLE usuarios DROP COLUMN IF EXISTS telefono;

-- Verificar que la columna se eliminó correctamente
SELECT 'Columna telefono eliminada exitosamente' AS mensaje;

