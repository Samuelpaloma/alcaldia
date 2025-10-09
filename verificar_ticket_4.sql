-- Script para verificar el estado actual del ticket 4
-- Ejecutar en la base de datos para diagnosticar el problema

-- 1. Verificar el estado actual del ticket
SELECT 
    t.id,
    t.status,
    t.assigned_technician_id,
    t.assigned_technician_email,
    t.updated_at,
    u.email as tecnico_email,
    u.first_name,
    u.last_name
FROM tickets t
LEFT JOIN users u ON u.id = t.assigned_technician_id
WHERE t.id = 4;

-- 2. Verificar las asignaciones activas
SELECT 
    ta.id_asignacion,
    ta.ticket_id,
    ta.tecnico_id,
    ta.fecha_asignacion,
    ta.activa,
    ta.tipo_operacion,
    ta.comentario
FROM ticket_assignments ta
WHERE ta.ticket_id = 4 AND ta.activa = 1;

-- 3. Verificar el historial de cambios de estado
SELECT 
    h.id,
    h.ticket_id,
    h.estado_anterior,
    h.estado_nuevo,
    h.fecha_cambio,
    h.comentario,
    u.email as cambiado_por
FROM historial_estado_ticket h
LEFT JOIN users u ON u.id = h.cambiado_por_id
WHERE h.ticket_id = 4
ORDER BY h.fecha_cambio DESC;
