-- Script para corregir tickets que tienen assigned_technician_id pero assigned_technician_email es NULL
-- Este script actualiza el campo assigned_technician_email basándose en el assigned_technician_id

UPDATE tickets 
SET assigned_technician_email = (
    SELECT email 
    FROM users 
    WHERE users.id = tickets.assigned_technician_id
)
WHERE assigned_technician_id IS NOT NULL 
  AND assigned_technician_email IS NULL;

-- Verificar el resultado
SELECT 
    id,
    assigned_technician_id,
    assigned_technician_email,
    status
FROM tickets 
WHERE assigned_technician_id IS NOT NULL
ORDER BY id;

