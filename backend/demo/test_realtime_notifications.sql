-- Script para probar notificaciones en tiempo real
-- Insertar notificaciones de prueba para verificar WebSocket

-- 1. Notificación para administradores
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
) VALUES (
    'ticket_creado',
    'Nuevo ticket creado por ligand2025@gmail.com (#999)',
    '["rol:administrador"]',
    999,
    1,
    'ligand2025@gmail.com',
    'sdfadw Rodrigues',
    'normal',
    false,
    NOW()
);

-- 2. Notificación para técnicos
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
) VALUES (
    'ticket_asignado',
    'Se te asignó el ticket #999 del cliente sdfadw Rodrigues',
    '["tecnico:roberrodrigues300@gmail.comS"]',
    999,
    2,
    'roberrodrigues300@gmail.com',
    'frfasc|1 esfsfefsdfsfs',
    'normal',
    false,
    NOW()
);

-- 3. Notificación para funcionarios
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
) VALUES (
    'ticket_asignado',
    'Tu ticket #999 ha sido asignado al técnico SAAS SXAAX',
    '["funcionario:ligand2025@gmail.com"]',
    999,
    2,
    'roberrodrigues300@gmail.com',
    'frfasc|1 esfsfefsdfsfs',
    'normal',
    false,
    NOW()
);

SELECT 'Notificaciones de prueba insertadas' as resultado;

