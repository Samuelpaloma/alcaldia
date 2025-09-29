-- Script para insertar tickets de prueba para probar el sistema de SLA
-- Ejecutar después de haber creado las configuraciones SLA

-- Insertar tickets de prueba con diferentes categorías y prioridades
INSERT INTO tickets (
    asunto, 
    descripcion, 
    prioridad, 
    estado, 
    categoria_nombre, 
    solicitante_email, 
    solicitante_nombre, 
    fecha_creacion, 
    fecha_actualizacion,
    -- Campos SLA (se calcularán automáticamente)
    sla_respuesta_vencimiento,
    sla_resolucion_vencimiento,
    sla_alerta_enviada,
    sla_vencido,
    fecha_primera_respuesta,
    fecha_resolucion
) VALUES 
-- Ticket 1: Redes - Alta Prioridad (SLA: 1h respuesta, 4h resolución)
(
    'Problema crítico de conectividad de red',
    'Los usuarios no pueden acceder a internet desde sus estaciones de trabajo. El problema afecta a todo el piso 3.',
    'ALTA',
    'PENDIENTE',
    'Redes',
    'admin@empresa.com',
    'Administrador Sistema',
    NOW(),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 HOUR),  -- SLA respuesta: 1 hora
    DATE_ADD(NOW(), INTERVAL 4 HOUR),  -- SLA resolución: 4 horas
    FALSE,
    FALSE,
    NULL,
    NULL
),

-- Ticket 2: Soporte Técnico - Media Prioridad (SLA: 2h respuesta, 8h resolución)
(
    'Error en aplicación de contabilidad',
    'La aplicación de contabilidad no permite generar reportes mensuales. Error al acceder al módulo de reportes.',
    'MEDIA',
    'PENDIENTE',
    'Soporte Técnico',
    'contabilidad@empresa.com',
    'María Contabilidad',
    NOW(),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 2 HOUR),  -- SLA respuesta: 2 horas
    DATE_ADD(NOW(), INTERVAL 8 HOUR),  -- SLA resolución: 8 horas
    FALSE,
    FALSE,
    NULL,
    NULL
),

-- Ticket 3: Redes - Alta Prioridad (SLA: 1h respuesta, 4h resolución) - Casi vencido
(
    'Servidor de correo no responde',
    'El servidor de correo electrónico no está respondiendo. Los usuarios no pueden enviar ni recibir emails.',
    'ALTA',
    'EN_PROGRESO',
    'Redes',
    'sistemas@empresa.com',
    'Carlos Sistemas',
    DATE_SUB(NOW(), INTERVAL 50 MINUTE),  -- Creado hace 50 minutos
    NOW(),
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 50 MINUTE), INTERVAL 1 HOUR),  -- SLA respuesta vence en 10 minutos
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 50 MINUTE), INTERVAL 4 HOUR),  -- SLA resolución vence en 3h 10min
    FALSE,
    FALSE,
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),  -- Primera respuesta hace 30 minutos
    NULL
),

-- Ticket 4: Soporte Técnico - Media Prioridad (SLA: 2h respuesta, 8h resolución) - Vencido
(
    'Problema con impresoras del piso 2',
    'Las impresoras del piso 2 no están funcionando correctamente. Error de conexión de red.',
    'MEDIA',
    'PENDIENTE',
    'Soporte Técnico',
    'recepcion@empresa.com',
    'Ana Recepción',
    DATE_SUB(NOW(), INTERVAL 3 HOUR),  -- Creado hace 3 horas
    NOW(),
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 HOUR), INTERVAL 2 HOUR),  -- SLA respuesta vencido hace 1 hora
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 HOUR), INTERVAL 8 HOUR),  -- SLA resolución vence en 5 horas
    FALSE,
    TRUE,  -- SLA vencido
    NULL,
    NULL
),

-- Ticket 5: General - Baja Prioridad (SLA: 4h respuesta, 24h resolución)
(
    'Solicitud de instalación de software',
    'Necesito instalar Microsoft Office en mi computadora nueva.',
    'BAJA',
    'PENDIENTE',
    'General',
    'usuario@empresa.com',
    'Juan Usuario',
    NOW(),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 4 HOUR),  -- SLA respuesta: 4 horas
    DATE_ADD(NOW(), INTERVAL 24 HOUR), -- SLA resolución: 24 horas
    FALSE,
    FALSE,
    NULL,
    NULL
),

-- Ticket 6: Redes - Crítica Prioridad (SLA: 1h respuesta, 4h resolución) - Resuelto
(
    'Corte total de internet',
    'Se ha cortado completamente la conexión a internet en toda la empresa.',
    'CRITICA',
    'RESUELTO',
    'Redes',
    'director@empresa.com',
    'Director General',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),  -- Creado hace 2 horas
    NOW(),
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 HOUR), INTERVAL 1 HOUR),  -- SLA respuesta vencido hace 1 hora
    DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 HOUR), INTERVAL 4 HOUR),  -- SLA resolución vence en 2 horas
    TRUE,  -- Alerta enviada
    FALSE,
    DATE_SUB(NOW(), INTERVAL 1 HOUR 30 MINUTE),  -- Primera respuesta hace 1.5 horas
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)  -- Resuelto hace 30 minutos
);

-- Mostrar los tickets creados
SELECT 
    id,
    asunto,
    prioridad,
    estado,
    categoria_nombre,
    solicitante_nombre,
    fecha_creacion,
    sla_respuesta_vencimiento,
    sla_resolucion_vencimiento,
    sla_alerta_enviada,
    sla_vencido,
    fecha_primera_respuesta,
    fecha_resolucion,
    -- Calcular tiempo restante para SLA
    CASE 
        WHEN sla_respuesta_vencimiento > NOW() THEN 
            CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), sla_respuesta_vencimiento), ' min')
        ELSE 'VENCIDO'
    END as tiempo_restante_respuesta,
    CASE 
        WHEN sla_resolucion_vencimiento > NOW() THEN 
            CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), sla_resolucion_vencimiento), ' min')
        ELSE 'VENCIDO'
    END as tiempo_restante_resolucion
FROM tickets 
WHERE asunto IN (
    'Problema crítico de conectividad de red',
    'Error en aplicación de contabilidad',
    'Servidor de correo no responde',
    'Problema con impresoras del piso 2',
    'Solicitud de instalación de software',
    'Corte total de internet'
)
ORDER BY fecha_creacion DESC;
