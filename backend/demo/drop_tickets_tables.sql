-- Script para eliminar todas las tablas de tickets en el orden correcto
-- Respetando las restricciones de foreign key

-- 1. Deshabilitar temporalmente las verificaciones de foreign key
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Eliminar las tablas en orden (dependientes primero)
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS evidencias;
DROP TABLE IF EXISTS historial_estados_tickets;
DROP TABLE IF EXISTS historial_asignaciones;
DROP TABLE IF EXISTS asignaciones_tickets;
DROP TABLE IF EXISTS tickets;

-- 3. Rehabilitar las verificaciones de foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- 4. Verificar que las tablas se eliminaron
SHOW TABLES LIKE '%ticket%';
SHOW TABLES LIKE '%comentario%';
SHOW TABLES LIKE '%evidencia%';
SHOW TABLES LIKE '%historial%';
SHOW TABLES LIKE '%asignacion%';

SELECT 'Todas las tablas de tickets eliminadas exitosamente!' as resultado;


