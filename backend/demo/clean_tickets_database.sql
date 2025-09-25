-- Script para vaciar completamente la base de datos de tickets
-- Respetando las restricciones de foreign key

-- 1. Primero verificar qué hay en las tablas
SELECT 'ANTES DE LIMPIAR:' as info;
SELECT 'Tickets:' as tabla, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Comentarios:', COUNT(*) FROM comentarios
UNION ALL
SELECT 'Evidencias:', COUNT(*) FROM evidencias
UNION ALL
SELECT 'Historial Estados:', COUNT(*) FROM historial_estados_tickets
UNION ALL
SELECT 'Historial Asignaciones:', COUNT(*) FROM historial_asignaciones
UNION ALL
SELECT 'Asignaciones Tickets:', COUNT(*) FROM asignaciones_tickets;

-- 2. Deshabilitar temporalmente las verificaciones de foreign key
SET FOREIGN_KEY_CHECKS = 0;

-- 3. Vaciar todas las tablas en orden (de dependientes a principales)
TRUNCATE TABLE comentarios;
TRUNCATE TABLE evidencias;
TRUNCATE TABLE historial_estados_tickets;
TRUNCATE TABLE historial_asignaciones;
TRUNCATE TABLE asignaciones_tickets;
TRUNCATE TABLE tickets;

-- 4. Reiniciar los auto_increment
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE comentarios AUTO_INCREMENT = 1;
ALTER TABLE evidencias AUTO_INCREMENT = 1;
ALTER TABLE historial_estados_tickets AUTO_INCREMENT = 1;
ALTER TABLE historial_asignaciones AUTO_INCREMENT = 1;
ALTER TABLE asignaciones_tickets AUTO_INCREMENT = 1;

-- 5. Rehabilitar las verificaciones de foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- 6. Verificar que todo esté vacío
SELECT 'DESPUÉS DE LIMPIAR:' as info;
SELECT 'Tickets:' as tabla, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Comentarios:', COUNT(*) FROM comentarios
UNION ALL
SELECT 'Evidencias:', COUNT(*) FROM evidencias
UNION ALL
SELECT 'Historial Estados:', COUNT(*) FROM historial_estados_tickets
UNION ALL
SELECT 'Historial Asignaciones:', COUNT(*) FROM historial_asignaciones
UNION ALL
SELECT 'Asignaciones Tickets:', COUNT(*) FROM asignaciones_tickets;

SELECT 'Base de datos de tickets completamente vacía!' as resultado;


