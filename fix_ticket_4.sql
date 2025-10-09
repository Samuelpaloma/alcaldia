-- Script específico para corregir el ticket 4

-- 1. Actualizar el email del técnico asignado
UPDATE tickets 
SET assigned_technician_email = 'roberrodrigues300@gmail.com'
WHERE id = 4 AND assigned_technician_id = 5;

-- 2. Crear asignación en ticket_assignments
INSERT INTO ticket_assignments (ticket_id, tecnico_id, fecha_asignacion, activa, tipo_operacion, comentario)
VALUES (4, 5, NOW(), 1, 'ASIGNACION_AUTOMATICA', 'Asignación creada automáticamente para corregir problema');

-- 3. Verificar el resultado
SELECT 
    t.id,
    t.assigned_technician_id,
    t.assigned_technician_email,
    t.status,
    ta.id_asignacion,
    ta.activa
FROM tickets t
LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.activa = 1
WHERE t.id = 4;

