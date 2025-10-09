-- Script para forzar la actualización del ticket 4 a EN_PROCESO
-- Ejecutar en la base de datos para corregir el problema

-- 1. Actualizar el estado del ticket a EN_PROCESO
UPDATE tickets 
SET status = 'EN_PROCESO',
    updated_at = NOW()
WHERE id = 4;

-- 2. Asegurar que el email del técnico esté correcto
UPDATE tickets 
SET assigned_technician_email = 'roberrodrigues300@gmail.com'
WHERE id = 4 AND assigned_technician_id = 5;

-- 3. Crear/actualizar la asignación activa
INSERT INTO ticket_assignments (ticket_id, tecnico_id, fecha_asignacion, activa, tipo_operacion, comentario)
VALUES (4, 5, NOW(), 1, 'ASIGNACION_AUTOMATICA', 'Asignación forzada para corregir problema')
ON DUPLICATE KEY UPDATE
    activa = 1,
    fecha_asignacion = NOW(),
    comentario = 'Asignación actualizada para corregir problema';

-- 4. Crear entrada en el historial
INSERT INTO historial_estado_ticket (
    ticket_id, 
    cambiado_por_id, 
    estado_anterior, 
    estado_nuevo, 
    comentario, 
    fecha_cambio,
    tipo_usuario
)
VALUES (
    4, 
    5, 
    'ASIGNADO', 
    'EN_PROCESO', 
    'Estado actualizado manualmente para corregir problema', 
    NOW(),
    'TECNICO'
);

-- 5. Verificar el resultado
SELECT 
    t.id,
    t.status,
    t.assigned_technician_id,
    t.assigned_technician_email,
    t.updated_at,
    ta.activa as asignacion_activa,
    h.estado_nuevo as ultimo_estado_historial
FROM tickets t
LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.activa = 1
LEFT JOIN (
    SELECT ticket_id, estado_nuevo 
    FROM historial_estado_ticket 
    WHERE ticket_id = 4 
    ORDER BY fecha_cambio DESC 
    LIMIT 1
) h ON h.ticket_id = t.id
WHERE t.id = 4;
