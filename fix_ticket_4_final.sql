-- Script para corregir el ticket 4
-- Ejecutar en la base de datos antes de reiniciar el backend

-- 1. Actualizar el email del técnico asignado
UPDATE tickets 
SET assigned_technician_email = 'roberrodrigues300@gmail.com'
WHERE id = 4 AND assigned_technician_id = 5;

-- 2. Crear asignación en ticket_assignments si no existe
INSERT INTO ticket_assignments (ticket_id, tecnico_id, fecha_asignacion, activa, tipo_operacion, comentario)
SELECT 4, 5, NOW(), 1, 'ASIGNACION_AUTOMATICA', 'Asignación creada automáticamente para corregir problema'
WHERE NOT EXISTS (
    SELECT 1 FROM ticket_assignments 
    WHERE ticket_id = 4 AND tecnico_id = 5 AND activa = 1
);

-- 3. Verificar el resultado
SELECT 
    t.id,
    t.assigned_technician_id,
    t.assigned_technician_email,
    t.status,
    ta.id_asignacion,
    ta.activa,
    ta.tipo_operacion
FROM tickets t
LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.activa = 1
WHERE t.id = 4;
