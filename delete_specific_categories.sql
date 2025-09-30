-- Script para eliminar categorías específicas (IDs 1-21)
-- Este script eliminará solo las categorías especificadas y sus datos relacionados

-- 1. Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Eliminar datos relacionados con tickets que usan estas categorías
DELETE FROM archivos_ticket 
WHERE ticket_id IN (
    SELECT id FROM tickets 
    WHERE categoria_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21)
);

DELETE FROM comentarios 
WHERE ticketId IN (
    SELECT id FROM tickets 
    WHERE categoria_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21)
);

DELETE FROM notificaciones_mejoradas 
WHERE ticket_id IN (
    SELECT id FROM tickets 
    WHERE categoria_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21)
);

DELETE FROM historial_asignaciones 
WHERE ticket_id IN (
    SELECT id FROM tickets 
    WHERE categoria_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21)
);

-- 3. Eliminar tickets que usan estas categorías
DELETE FROM tickets 
WHERE categoria_id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21);

-- 4. Eliminar las categorías específicas
DELETE FROM categorias 
WHERE id_categoria IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21);

-- 5. Rehabilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- 6. Verificar que las categorías se eliminaron
SELECT 'Categorias restantes' as resultado, COUNT(*) as cantidad FROM categorias;
SELECT 'Tickets restantes' as resultado, COUNT(*) as cantidad FROM tickets;
