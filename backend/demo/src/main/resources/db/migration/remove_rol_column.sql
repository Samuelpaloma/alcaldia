-- Migración: Eliminar columna rol de la tabla usuarios
-- Fecha: 2025-10-01
-- Razón: Se usa tipo_usuario en su lugar. Campo "rol" es redundante y obsoleto.

-- Eliminar columna rol de la tabla usuarios
ALTER TABLE usuarios DROP COLUMN IF EXISTS rol;

-- Verificar que la columna se eliminó correctamente
SELECT 'Columna rol eliminada exitosamente' AS mensaje;

