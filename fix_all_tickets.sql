-- Script completo para corregir todos los problemas de tickets existentes

-- 1. Actualizar el campo assigned_technician_email basándose en assigned_technician_id
UPDATE tickets 
SET assigned_technician_email = (
    SELECT email 
    FROM users 
    WHERE users.id = tickets.assigned_technician_id
)
WHERE assigned_technician_id IS NOT NULL 
  AND assigned_technician_email IS NULL;

-- 2. Crear registros faltantes en ticket_assignments para tickets asignados
INSERT INTO ticket_assignments (ticket_id, tecnico_id, fecha_asignacion, activa, tipo_operacion, comentario)
SELECT 
    t.id as ticket_id,
    t.assigned_technician_id as tecnico_id,
    t.created_at as fecha_asignacion,
    1 as activa,
    'ASIGNACION_AUTOMATICA' as tipo_operacion,
    'Asignación creada automáticamente para mantener consistencia' as comentario
FROM tickets t
WHERE t.assigned_technician_id IS NOT NULL
  AND t.status = 'ASIGNADO'
  AND NOT EXISTS (
      SELECT 1 FROM ticket_assignments ta 
      WHERE ta.ticket_id = t.id AND ta.activa = 1
  );

-- 3. Verificar el resultado - Tickets corregidos
SELECT 
    'TICKETS CORREGIDOS' as tipo,
    t.id,
    t.assigned_technician_id,
    t.assigned_technician_email,
    t.status,
    u.email as tecnico_email_correcto,
    ta.id_asignacion,
    ta.activa as asignacion_activa
FROM tickets t
LEFT JOIN users u ON u.id = t.assigned_technician_id
LEFT JOIN ticket_assignments ta ON ta.ticket_id = t.id AND ta.activa = 1
WHERE t.assigned_technician_id IS NOT NULL
ORDER BY t.id;

-- 4. Verificar la tabla ticket_assignments
SELECT 
    'ASIGNACIONES CREADAS' as tipo,
    ta.id_asignacion,
    ta.ticket_id,
    ta.tecnico_id,
    ta.activa,
    ta.tipo_operacion,
    ta.fecha_asignacion
FROM ticket_assignments ta
ORDER BY ta.ticket_id;

