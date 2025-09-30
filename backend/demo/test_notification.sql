-- Script para crear una notificación de prueba con el email correcto
-- Ejecutar este script en la base de datos

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
    'comentario_agregado',
    'El funcionario Test User agregó un comentario al ticket #6 que tienes asignado',
    'tecnico@alcaldianevila.gov.co',
    6,
    1,
    'test@test.com',
    'Test User',
    'normal',
    false,
    NOW()
);

-- Verificar que se creó correctamente
SELECT * FROM notificaciones_mejoradas WHERE destinatarios = 'tecnico@alcaldianevila.gov.co';
