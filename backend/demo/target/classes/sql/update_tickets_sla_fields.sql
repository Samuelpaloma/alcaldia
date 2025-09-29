-- Agregar campos de SLA a la tabla tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS sla_respuesta_vencimiento TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sla_resolucion_vencimiento TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sla_alerta_enviada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sla_vencido BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_primera_respuesta TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS fecha_resolucion TIMESTAMP NULL;

-- Crear índices para optimizar consultas de SLA
CREATE INDEX IF NOT EXISTS idx_tickets_sla_respuesta ON tickets(sla_respuesta_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_resolucion ON tickets(sla_resolucion_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_alerta ON tickets(sla_alerta_enviada);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_vencido ON tickets(sla_vencido);
CREATE INDEX IF NOT EXISTS idx_tickets_estado_sla ON tickets(estado, sla_alerta_enviada);
