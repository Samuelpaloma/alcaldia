-- Script para arreglar datos duplicados en SLA
-- Eliminar configuraciones duplicadas

-- Primero, ver qué datos duplicados tenemos
SELECT nombre, categoria_nombre, prioridad, COUNT(*) as duplicados 
FROM sla_configurations 
GROUP BY nombre, categoria_nombre, prioridad 
HAVING COUNT(*) > 1;

-- Eliminar duplicados, manteniendo solo el primero de cada grupo
DELETE s1 FROM sla_configurations s1
INNER JOIN sla_configurations s2 
WHERE s1.id > s2.id 
  AND s1.nombre = s2.nombre 
  AND s1.categoria_nombre = s2.categoria_nombre 
  AND s1.prioridad = s2.prioridad;

-- Verificar que se eliminaron los duplicados
SELECT COUNT(*) as total_configuraciones FROM sla_configurations;
SELECT id, nombre, categoria_nombre, prioridad, activo FROM sla_configurations ORDER BY id;
