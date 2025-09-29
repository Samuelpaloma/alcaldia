-- Script para insertar una notificación de prueba para verificar el WebSocket
INSERT INTO notificaciones_mejoradas (tipo, mensaje, destinatarios, ticket_id, usuario_actor_id, usuario_actor_email, usuario_actor_nombre, prioridad, leida, fecha_creacion, fecha_lectura)
VALUES
('ticket_asignado', 'Tu ticket #999 fue asignado al técnico Prueba Test', '["funcionario:ligand2025@gmail.com"]', 999, 1, 'admin@test.com', 'Admin Prueba', 'normal', FALSE, NOW(), NULL);

