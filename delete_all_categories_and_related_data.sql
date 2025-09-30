-- Script para eliminar todas las categorías y datos relacionados
-- IMPORTANTE: Este script eliminará TODOS los datos de tickets y categorías

-- 1. Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Eliminar datos relacionados con tickets
DELETE FROM archivos_ticket;
DELETE FROM comentarios;
DELETE FROM notificaciones_mejoradas;
DELETE FROM historial_asignaciones;

-- 3. Eliminar todos los tickets
DELETE FROM tickets;

-- 4. Eliminar todas las categorías
DELETE FROM categorias;

-- 5. Reiniciar contadores de auto-incremento
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE categorias AUTO_INCREMENT = 1;
ALTER TABLE archivos_ticket AUTO_INCREMENT = 1;
ALTER TABLE comentarios AUTO_INCREMENT = 1;
ALTER TABLE notificaciones_mejoradas AUTO_INCREMENT = 1;
ALTER TABLE historial_asignaciones AUTO_INCREMENT = 1;

-- 6. Rehabilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- 7. Verificar que las tablas estén vacías
SELECT 'Tickets' as tabla, COUNT(*) as registros FROM tickets
UNION ALL
SELECT 'Categorias' as tabla, COUNT(*) as registros FROM categorias
UNION ALL
SELECT 'Archivos' as tabla, COUNT(*) as registros FROM archivos_ticket
UNION ALL
SELECT 'Comentarios' as tabla, COUNT(*) as registros FROM comentarios
UNION ALL
SELECT 'Notificaciones' as tabla, COUNT(*) as registros FROM notificaciones_mejoradas
UNION ALL
SELECT 'Historial' as tabla, COUNT(*) as registros FROM historial_asignaciones;
