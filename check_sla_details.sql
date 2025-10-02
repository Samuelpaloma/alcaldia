-- Verificar columnas SLA en tabla tickets
SHOW COLUMNS FROM tickets LIKE 'sla_%';

-- Verificar tabla de reglas de automatización
SHOW TABLES LIKE 'reglas_%';

-- Verificar datos en las tablas
SELECT COUNT(*) as total_configuraciones FROM sla_configurations;
SELECT COUNT(*) as total_reglas FROM reglas_automatizacion;

-- Verificar configuraciones SLA activas
SELECT id, nombre, categoria_nombre, prioridad, activo FROM sla_configurations WHERE activo = 1;

