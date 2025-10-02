-- Script para verificar si las tablas de SLA existen
SHOW TABLES LIKE 'sla_%';
SHOW TABLES LIKE 'reglas_%';

-- Verificar si existen las columnas SLA en la tabla tickets
SHOW COLUMNS FROM tickets LIKE 'sla_%';

-- Verificar datos en sla_configurations
SELECT COUNT(*) as total_configuraciones FROM sla_configurations;
SELECT COUNT(*) as total_reglas FROM reglas_automatizacion;

