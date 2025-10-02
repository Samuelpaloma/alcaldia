-- ========================================
-- SCRIPT SQL PARA CONFIGURACIÓN DE SLA Y AUTOMATIZACIÓN
-- ========================================
-- Este script crea las tablas necesarias para el sistema de SLA y automatización
-- que se integró desde la rama paloma-HU-5

-- ========================================
-- 1. TABLA DE CONFIGURACIONES SLA
-- ========================================
CREATE TABLE IF NOT EXISTS `sla_configurations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` TEXT,
    `categoria_id` BIGINT,
    `categoria_nombre` VARCHAR(100),
    `prioridad` VARCHAR(20),
    `tiempo_respuesta_horas` INT NOT NULL,
    `tiempo_resolucion_horas` INT NOT NULL,
    `tiempo_alerta_horas` INT NOT NULL DEFAULT 2,
    `activo` BOOLEAN NOT NULL DEFAULT TRUE,
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_categoria_prioridad` (`categoria_id`, `prioridad`),
    INDEX `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. TABLA DE REGLAS DE AUTOMATIZACIÓN
-- ========================================
CREATE TABLE IF NOT EXISTS `reglas_automatizacion` (
    `id_regla` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` VARCHAR(500),
    `condicion` TEXT NOT NULL,
    `accion` TEXT NOT NULL,
    `prioridad` INT NOT NULL DEFAULT 1,
    `activa` BOOLEAN NOT NULL DEFAULT TRUE,
    `ejecuciones` INT NOT NULL DEFAULT 0,
    `ultima_ejecucion` TIMESTAMP NULL,
    `creado_por` VARCHAR(100),
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_regla`),
    INDEX `idx_activa_prioridad` (`activa`, `prioridad`),
    INDEX `idx_ultima_ejecucion` (`ultima_ejecucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. ACTUALIZAR TABLA DE TICKETS CON CAMPOS SLA
-- ========================================
-- Agregar campos SLA a la tabla tickets si no existen
ALTER TABLE `tickets` 
ADD COLUMN IF NOT EXISTS `sla_configuracion_id` BIGINT NULL,
ADD COLUMN IF NOT EXISTS `sla_fecha_limite_respuesta` TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS `sla_fecha_limite_resolucion` TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS `sla_cumplido` BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `sla_porcentaje_cumplimiento` DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `sla_alertas_enviadas` INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS `sla_ultima_verificacion` TIMESTAMP NULL;

-- Agregar índices para campos SLA
ALTER TABLE `tickets` 
ADD INDEX IF NOT EXISTS `idx_sla_configuracion` (`sla_configuracion_id`),
ADD INDEX IF NOT EXISTS `idx_sla_fecha_limite_respuesta` (`sla_fecha_limite_respuesta`),
ADD INDEX IF NOT EXISTS `idx_sla_cumplido` (`sla_cumplido`);

-- ========================================
-- 4. TABLA DE MONITOREO SLA (OPCIONAL - PARA ESTADÍSTICAS)
-- ========================================
CREATE TABLE IF NOT EXISTS `sla_monitoring_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ticket_id` BIGINT NOT NULL,
    `sla_configuracion_id` BIGINT NOT NULL,
    `tipo_verificacion` VARCHAR(50) NOT NULL, -- 'RESPUESTA', 'RESOLUCION', 'ALERTA'
    `fecha_verificacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `cumplido` BOOLEAN NOT NULL,
    `tiempo_transcurrido_horas` DECIMAL(10,2),
    `tiempo_limite_horas` DECIMAL(10,2),
    `porcentaje_cumplimiento` DECIMAL(5,2),
    `comentario` TEXT,
    PRIMARY KEY (`id`),
    INDEX `idx_ticket_fecha` (`ticket_id`, `fecha_verificacion`),
    INDEX `idx_tipo_verificacion` (`tipo_verificacion`),
    FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sla_configuracion_id`) REFERENCES `sla_configurations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. DATOS INICIALES - CONFIGURACIONES SLA BÁSICAS
-- ========================================

-- Configuración SLA para Hardware - Alta Prioridad
INSERT INTO `sla_configurations` (
    `nombre`, `descripcion`, `categoria_id`, `categoria_nombre`, `prioridad`, 
    `tiempo_respuesta_horas`, `tiempo_resolucion_horas`, `tiempo_alerta_horas`, `activo`
) VALUES (
    'SLA Hardware Alta Prioridad',
    'SLA para tickets de Hardware con prioridad alta',
    1, 'Hardware', 'ALTA',
    2, 8, 1, TRUE
);

-- Configuración SLA para Software - Alta Prioridad
INSERT INTO `sla_configurations` (
    `nombre`, `descripcion`, `categoria_id`, `categoria_nombre`, `prioridad`, 
    `tiempo_respuesta_horas`, `tiempo_resolucion_horas`, `tiempo_alerta_horas`, `activo`
) VALUES (
    'SLA Software Alta Prioridad',
    'SLA para tickets de Software con prioridad alta',
    2, 'Software', 'ALTA',
    1, 4, 1, TRUE
);

-- Configuración SLA para Hardware - Media Prioridad
INSERT INTO `sla_configurations` (
    `nombre`, `descripcion`, `categoria_id`, `categoria_nombre`, `prioridad`, 
    `tiempo_respuesta_horas`, `tiempo_resolucion_horas`, `tiempo_alerta_horas`, `activo`
) VALUES (
    'SLA Hardware Media Prioridad',
    'SLA para tickets de Hardware con prioridad media',
    1, 'Hardware', 'MEDIA',
    4, 24, 2, TRUE
);

-- Configuración SLA para Software - Media Prioridad
INSERT INTO `sla_configurations` (
    `nombre`, `descripcion`, `categoria_id`, `categoria_nombre`, `prioridad`, 
    `tiempo_respuesta_horas`, `tiempo_resolucion_horas`, `tiempo_alerta_horas`, `activo`
) VALUES (
    'SLA Software Media Prioridad',
    'SLA para tickets de Software con prioridad media',
    2, 'Software', 'MEDIA',
    2, 8, 1, TRUE
);

-- Configuración SLA para Red - Alta Prioridad
INSERT INTO `sla_configurations` (
    `nombre`, `descripcion`, `categoria_id`, `categoria_nombre`, `prioridad`, 
    `tiempo_respuesta_horas`, `tiempo_resolucion_horas`, `tiempo_alerta_horas`, `activo`
) VALUES (
    'SLA Red Alta Prioridad',
    'SLA para tickets de Red con prioridad alta',
    3, 'Red', 'ALTA',
    1, 6, 1, TRUE
);

-- ========================================
-- 6. DATOS INICIALES - REGLAS DE AUTOMATIZACIÓN BÁSICAS
-- ========================================

-- Regla para asignar tickets de Hardware a técnico especializado
INSERT INTO `reglas_automatizacion` (
    `nombre`, `descripcion`, `condicion`, `accion`, `prioridad`, `activa`, `creado_por`
) VALUES (
    'Asignar Hardware a Técnico Especializado',
    'Asignar automáticamente tickets de Hardware a técnico especializado',
    'categoria == "Hardware" AND prioridad == "ALTA"',
    'asignar_tecnico(1)',
    3, TRUE, 'sistema'
);

-- Regla para asignar tickets de Software a técnico especializado
INSERT INTO `reglas_automatizacion` (
    `nombre`, `descripcion`, `condicion`, `accion`, `prioridad`, `activa`, `creado_por`
) VALUES (
    'Asignar Software a Técnico Especializado',
    'Asignar automáticamente tickets de Software a técnico especializado',
    'categoria == "Software" AND prioridad == "ALTA"',
    'asignar_tecnico(2)',
    3, TRUE, 'sistema'
);

-- Regla para cambiar prioridad de tickets críticos
INSERT INTO `reglas_automatizacion` (
    `nombre`, `descripcion`, `condicion`, `accion`, `prioridad`, `activa`, `creado_por`
) VALUES (
    'Cambiar Prioridad de Tickets Críticos',
    'Cambiar automáticamente la prioridad de tickets críticos',
    'consulta CONTAINS "crítico" OR consulta CONTAINS "urgente"',
    'cambiar_prioridad("ALTA")',
    4, TRUE, 'sistema'
);

-- Regla para notificar sobre tickets sin asignar
INSERT INTO `reglas_automatizacion` (
    `nombre`, `descripcion`, `condicion`, `accion`, `prioridad`, `activa`, `creado_por`
) VALUES (
    'Notificar Tickets Sin Asignar',
    'Notificar a administradores sobre tickets sin asignar por más de 1 hora',
    'tecnico_asignado IS NULL AND fecha_creacion < NOW() - INTERVAL 1 HOUR',
    'notificar_admin("ticket_sin_asignar")',
    2, TRUE, 'sistema'
);

-- Regla para cerrar tickets resueltos automáticamente
INSERT INTO `reglas_automatizacion` (
    `nombre`, `descripcion`, `condicion`, `accion`, `prioridad`, `activa`, `creado_por`
) VALUES (
    'Cerrar Tickets Resueltos Automáticamente',
    'Cerrar automáticamente tickets que han estado resueltos por más de 24 horas',
    'estado == "RESUELTO" AND fecha_actualizacion < NOW() - INTERVAL 24 HOUR',
    'cambiar_estado("CERRADO")',
    1, TRUE, 'sistema'
);

-- ========================================
-- 7. VERIFICACIÓN DE DATOS INSERTADOS
-- ========================================

-- Verificar configuraciones SLA creadas
SELECT 'Configuraciones SLA creadas:' as info;
SELECT id, nombre, categoria_nombre, prioridad, tiempo_respuesta_horas, tiempo_resolucion_horas, activo 
FROM sla_configurations 
ORDER BY categoria_id, prioridad;

-- Verificar reglas de automatización creadas
SELECT 'Reglas de automatización creadas:' as info;
SELECT id_regla, nombre, prioridad, activa, creado_por 
FROM reglas_automatizacion 
ORDER BY prioridad DESC, nombre;

-- Verificar estructura de tabla tickets actualizada
SELECT 'Campos SLA en tabla tickets:' as info;
SHOW COLUMNS FROM tickets LIKE 'sla_%';

-- ========================================
-- 8. CONSULTAS DE VERIFICACIÓN ADICIONALES
-- ========================================

-- Contar configuraciones SLA por categoría
SELECT 
    categoria_nombre,
    COUNT(*) as total_configuraciones,
    SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) as configuraciones_activas
FROM sla_configurations 
GROUP BY categoria_nombre
ORDER BY categoria_nombre;

-- Contar reglas de automatización por prioridad
SELECT 
    prioridad,
    COUNT(*) as total_reglas,
    SUM(CASE WHEN activa = TRUE THEN 1 ELSE 0 END) as reglas_activas
FROM reglas_automatizacion 
GROUP BY prioridad
ORDER BY prioridad DESC;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- Este script ha creado:
-- 1. Tabla sla_configurations para configuraciones de SLA
-- 2. Tabla reglas_automatizacion para reglas de automatización
-- 3. Campos SLA adicionales en la tabla tickets
-- 4. Tabla sla_monitoring_log para logs de monitoreo
-- 5. Datos iniciales de configuración
-- 6. Reglas de automatización básicas
-- 7. Índices para optimización de consultas
-- 8. Verificaciones de datos insertados
