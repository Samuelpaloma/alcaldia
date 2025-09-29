-- ========================================
-- SCRIPT PARA PROBAR EL SISTEMA DE NOTIFICACIONES POR ROLES
-- ========================================

-- 1. Verificar usuarios existentes
SELECT 
    id_usuario,
    nombre,
    apellido,
    email,
    tipo_usuario,
    activo
FROM usuarios 
WHERE activo = TRUE
ORDER BY tipo_usuario;

-- 2. Verificar tickets existentes
SELECT 
    id,
    asunto,
    categoria,
    estado,
    creador_id,
    tecnico_id
FROM tickets 
LIMIT 5;

-- 3. Limpiar notificaciones de prueba anteriores
DELETE FROM notificaciones_mejoradas WHERE usuario_actor_email LIKE '%test%';

-- 4. Insertar notificaciones de prueba con diferentes roles
INSERT INTO notificaciones_mejoradas (
    tipo, 
    mensaje, 
    destinatarios, 
    ticket_id, 
    usuario_actor_id, 
    usuario_actor_email, 
    usuario_actor_nombre, 
    prioridad, 
    leida, 
    fecha_creacion
) VALUES

-- Notificaciones para funcionarios específicos
('ticket_creado', 'Tu ticket #1 ha sido creado exitosamente', '["funcionario:roberrodrigues@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'Tu ticket #1 fue asignado al técnico Juan Pérez', '["funcionario:roberrodrigues@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificaciones para técnicos específicos
('ticket_asignado', 'Se te asignó el ticket #1 del cliente Rober Rodrigues', '["tecnico:juanperez@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_en_proceso', 'El ticket #1 está siendo procesado por Juan Pérez', '["tecnico:juanperez@gmail.com"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),

-- Notificaciones para administradores (por rol)
('ticket_creado', 'Nuevo ticket creado por Rober Rodrigues (#1)', '["rol:administrador"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'El ticket #1 fue asignado al técnico Juan Pérez por Admin Sistema', '["rol:administrador"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificaciones de alta prioridad
('ticket_resuelto', 'Tu ticket #1 ha sido resuelto por Juan Pérez', '["funcionario:roberrodrigues@gmail.com"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('ticket_cerrado', 'El ticket #1 del cliente Rober Rodrigues fue cerrado por Juan Pérez', '["rol:administrador"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW());

-- 5. Verificar las notificaciones insertadas
SELECT 
    id,
    tipo,
    mensaje,
    destinatarios,
    ticket_id,
    usuario_actor_nombre,
    prioridad,
    leida,
    fecha_creacion
FROM notificaciones_mejoradas 
ORDER BY fecha_creacion DESC
LIMIT 10;

-- 6. Probar el endpoint de notificaciones por usuario
-- Esto se puede probar desde Postman o curl:
-- GET http://localhost:8080/api/notifications/role-based/user/roberrodrigues@gmail.com
-- GET http://localhost:8080/api/notifications/role-based/user/juanperez@gmail.com
-- GET http://localhost:8080/api/notifications/role-based/user/admin@test.com

-- 7. Crear notificaciones de prueba adicionales para diferentes escenarios
INSERT INTO notificaciones_mejoradas (
    tipo, 
    mensaje, 
    destinatarios, 
    ticket_id, 
    usuario_actor_id, 
    usuario_actor_email, 
    usuario_actor_nombre, 
    prioridad, 
    leida, 
    fecha_creacion
) VALUES

-- Notificación crítica
('sla_vencido', '⚠️ SLA vencido para el ticket #1', '["rol:tecnico", "rol:administrador"]', 1, NULL, 'Sistema', 'Sistema', 'critica', false, NOW()),

-- Notificación de sistema
('alerta_sistema', '🚨 Alerta del sistema: Múltiples tickets bloqueados', '["rol:administrador"]', NULL, NULL, 'Sistema', 'Sistema', 'critica', false, NOW()),

-- Notificación de escalamiento
('ticket_escalado', 'El ticket #1 fue escalado a un técnico senior', '["tecnico:juanperez@gmail.com", "rol:administrador"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'alta', false, NOW());

-- 8. Verificar el conteo por tipo de destinatario
SELECT 
    CASE 
        WHEN destinatarios LIKE '%funcionario:%' THEN 'Funcionario'
        WHEN destinatarios LIKE '%tecnico:%' THEN 'Técnico'
        WHEN destinatarios LIKE '%rol:administrador%' THEN 'Administrador'
        WHEN destinatarios LIKE '%rol:tecnico%' THEN 'Rol Técnico'
        ELSE 'Otro'
    END as tipo_destinatario,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
GROUP BY tipo_destinatario;

-- 9. Verificar notificaciones no leídas por usuario
SELECT 
    'roberrodrigues@gmail.com' as usuario,
    COUNT(*) as total_notificaciones,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%roberrodrigues@gmail.com%'

UNION ALL

SELECT 
    'juanperez@gmail.com' as usuario,
    COUNT(*) as total_notificaciones,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%juanperez@gmail.com%'

UNION ALL

SELECT 
    'admin@test.com' as usuario,
    COUNT(*) as total_notificaciones,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%admin@test.com%' OR destinatarios LIKE '%rol:administrador%';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- 1. roberrodrigues@gmail.com debería ver: 3 notificaciones (2 no leídas)
-- 2. juanperez@gmail.com debería ver: 3 notificaciones (3 no leídas)
-- 3. admin@test.com debería ver: 5 notificaciones (5 no leídas)
-- ========================================

