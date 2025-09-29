-- Insertar configuraciones SLA básicas
INSERT INTO sla_configurations (nombre, descripcion, categoria_id, prioridad, tiempo_respuesta_horas, tiempo_resolucion_horas, tiempo_alerta_horas, activo, fecha_creacion) VALUES
('SLA General', 'SLA por defecto para todos los tickets', NULL, NULL, 4, 24, 2, true, NOW()),
('SLA Redes - Alta Prioridad', 'SLA específico para tickets de redes críticos', 1, 'ALTA', 1, 4, 1, true, NOW()),
('SLA Redes - Media Prioridad', 'SLA específico para tickets de redes con prioridad media', 1, 'MEDIA', 2, 8, 2, true, NOW()),
('SLA Soporte Técnico - Alta Prioridad', 'SLA específico para soporte técnico crítico', 2, 'ALTA', 2, 6, 1, true, NOW()),
('SLA Soporte Técnico - Media Prioridad', 'SLA específico para soporte técnico con prioridad media', 2, 'MEDIA', 4, 12, 2, true, NOW()),
('SLA Facturación - Alta Prioridad', 'SLA específico para facturación crítica', 3, 'ALTA', 1, 2, 1, true, NOW()),
('SLA Facturación - Media Prioridad', 'SLA específico para facturación con prioridad media', 3, 'MEDIA', 2, 4, 2, true, NOW()),
('SLA Accesos - Alta Prioridad', 'SLA específico para accesos críticos', 4, 'ALTA', 1, 2, 1, true, NOW()),
('SLA Accesos - Media Prioridad', 'SLA específico para accesos con prioridad media', 4, 'MEDIA', 2, 4, 2, true, NOW());
