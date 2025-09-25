-- Script para actualizar tickets asignados que no tienen tecnicoEmail
-- Primero, veamos qué tickets están asignados pero no tienen tecnicoEmail

SELECT 
    t.id,
    t.estado,
    t.tecnico_email,
    u.email as tecnico_asignado_email,
    u.nombre_completo as tecnico_asignado_nombre
FROM tickets t
LEFT JOIN usuarios u ON t.tecnico_id = u.id_usuario
WHERE t.estado IN ('ASIGNADO', 'ESCALADO') 
  AND (t.tecnico_email IS NULL OR t.tecnico_email = '');

-- Actualizar tickets que tienen tecnico_id pero no tecnico_email
UPDATE tickets t
JOIN usuarios u ON t.tecnico_id = u.id_usuario
SET t.tecnico_email = u.email
WHERE t.estado IN ('ASIGNADO', 'ESCALADO') 
  AND (t.tecnico_email IS NULL OR t.tecnico_email = '')
  AND t.tecnico_id IS NOT NULL;

-- Verificar el resultado
SELECT 
    t.id,
    t.estado,
    t.tecnico_email,
    u.email as tecnico_asignado_email,
    u.nombre_completo as tecnico_asignado_nombre
FROM tickets t
LEFT JOIN usuarios u ON t.tecnico_id = u.id_usuario
WHERE t.estado IN ('ASIGNADO', 'ESCALADO')
ORDER BY t.id;


