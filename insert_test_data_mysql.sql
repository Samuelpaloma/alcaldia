-- Script para insertar datos de prueba en MySQL
-- Ejecutar después de que la aplicación Spring Boot esté corriendo

USE ticket;

-- Insertar categorías de prueba
INSERT INTO categorias (nombre, descripcion, activa, orden, fecha_creacion, fecha_actualizacion) VALUES
('Sistemas', 'Problemas relacionados con sistemas informáticos', true, 1, NOW(), NOW()),
('Redes', 'Problemas de conectividad y red', true, 2, NOW(), NOW()),
('Hardware', 'Problemas con equipos físicos', true, 3, NOW(), NOW()),
('Software', 'Problemas con aplicaciones y programas', true, 4, NOW(), NOW()),
('Soporte', 'Consultas y soporte general', true, 5, NOW(), NOW());

-- Insertar técnicos de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, cargo, departamento, ubicacion, tipo_usuario, activo, require_2fa, password_temporal, fecha_creacion, ultimo_acceso) VALUES
('Carlos', 'Mendoza', 'carlos.mendoza@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 123 4567', 'Técnico Senior', 'Sistemas', 'Bogotá, Colombia', 'TECNICO', true, false, false, NOW(), NOW()),
('Ana', 'Rodriguez', 'ana.rodriguez@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 234 5678', 'Técnico de Redes', 'Sistemas', 'Bogotá, Colombia', 'TECNICO', true, false, false, NOW(), NOW()),
('Luis', 'García', 'luis.garcia@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 345 6789', 'Técnico de Hardware', 'Sistemas', 'Bogotá, Colombia', 'TECNICO', true, false, false, NOW(), NOW()),
('María', 'López', 'maria.lopez@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 456 7890', 'Técnico de Software', 'Sistemas', 'Bogotá, Colombia', 'TECNICO', false, false, false, NOW(), NOW());

-- Insertar administradores de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, cargo, departamento, ubicacion, tipo_usuario, activo, require_2fa, password_temporal, fecha_creacion, ultimo_acceso) VALUES
('Roberto', 'Silva', 'roberto.silva@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 567 8901', 'Administrador de Sistemas', 'Sistemas', 'Bogotá, Colombia', 'ADMINISTRADOR', true, false, false, NOW(), NOW()),
('Patricia', 'Vega', 'patricia.vega@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 678 9012', 'Jefe de Sistemas', 'Sistemas', 'Bogotá, Colombia', 'ADMINISTRADOR', true, false, false, NOW(), NOW());

-- Insertar funcionarios de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, cargo, departamento, ubicacion, tipo_usuario, activo, require_2fa, password_temporal, fecha_creacion, ultimo_acceso) VALUES
('Juan', 'Pérez', 'juan.perez@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 789 0123', 'Funcionario', 'Administración', 'Bogotá, Colombia', 'FUNCIONARIO', true, false, false, NOW(), NOW()),
('Carmen', 'Herrera', 'carmen.herrera@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 890 1234', 'Funcionaria', 'Recursos Humanos', 'Bogotá, Colombia', 'FUNCIONARIO', true, false, false, NOW(), NOW()),
('Pedro', 'Martínez', 'pedro.martinez@alcaldia.gov.co', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '+57 300 901 2345', 'Funcionario', 'Contabilidad', 'Bogotá, Colombia', 'FUNCIONARIO', true, false, false, NOW(), NOW());

-- Insertar tickets de prueba
INSERT INTO tickets (asunto, descripcion, categoria, estado, prioridad, tecnico_asignado, fecha_creacion, fecha_actualizacion, creado_por) VALUES
('Problema con el servidor de correo', 'El servidor de correo electrónico no está funcionando correctamente. Los usuarios no pueden enviar ni recibir emails.', 'Sistemas', 'ABIERTO', 'ALTA', NULL, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, 1),
('Lentitud en la red local', 'La conexión a internet está muy lenta en toda la oficina. Los usuarios reportan tiempos de carga excesivos.', 'Redes', 'EN_PROGRESO', 'MEDIA', 'Carlos Mendoza', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 HOUR, 1),
('Impresora no funciona', 'La impresora del piso 3 no está imprimiendo. Se escucha el ruido pero no sale papel.', 'Hardware', 'ABIERTO', 'BAJA', NULL, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR, 1),
('Actualización de software requerida', 'Necesitamos actualizar el software de contabilidad a la última versión para cumplir con los nuevos requisitos fiscales.', 'Software', 'RESUELTO', 'ALTA', 'Ana Rodriguez', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY, 1),
('Configuración de VPN', 'Los funcionarios remotos no pueden acceder a la VPN. Necesitamos configurar nuevos certificados.', 'Redes', 'ABIERTO', 'MEDIA', NULL, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR, 1),
('Backup de datos', 'Realizar backup completo de la base de datos antes del fin de mes.', 'Sistemas', 'CERRADO', 'MEDIA', 'Carlos Mendoza', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 2 DAY, 1),
('Problema con Windows Update', 'Las actualizaciones de Windows están fallando en varios equipos. Error 0x80070005.', 'Software', 'EN_PROGRESO', 'MEDIA', 'Luis García', NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 30 MINUTE, 1),
('Instalación de nuevo servidor', 'Instalar y configurar el nuevo servidor de archivos en el rack principal.', 'Hardware', 'ABIERTO', 'ALTA', NULL, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR, 1),
('Configuración de firewall', 'Actualizar reglas del firewall para permitir el tráfico de la nueva aplicación web.', 'Redes', 'RESUELTO', 'MEDIA', 'Ana Rodriguez', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, 1),
('Mantenimiento preventivo', 'Realizar mantenimiento preventivo a todos los equipos de cómputo.', 'Hardware', 'ABIERTO', 'BAJA', NULL, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, 1);

-- Insertar evidencias de prueba
INSERT INTO evidencias (ticket_id, nombre_archivo, tipo_evidencia, descripcion, ruta_archivo, tamanio_archivo, extension_archivo, activa, fecha_subida, subido_por) VALUES
(1, 'error_servidor_correo.png', 'IMAGEN', 'Captura de pantalla del error del servidor de correo', '/evidencias/ticket_1/error_servidor_correo.png', 245760, 'png', true, NOW() - INTERVAL 1 DAY, 'carlos.mendoza@alcaldia.gov.co'),
(1, 'logs_servidor.txt', 'DOCUMENTO', 'Logs del servidor de correo con los errores', '/evidencias/ticket_1/logs_servidor.txt', 1024000, 'txt', true, NOW() - INTERVAL 1 DAY, 'carlos.mendoza@alcaldia.gov.co'),
(2, 'test_velocidad_red.pdf', 'DOCUMENTO', 'Reporte de velocidad de red con mediciones', '/evidencias/ticket_2/test_velocidad_red.pdf', 512000, 'pdf', true, NOW() - INTERVAL 2 HOUR, 'ana.rodriguez@alcaldia.gov.co'),
(3, 'impresora_error.jpg', 'IMAGEN', 'Foto del error en la impresora', '/evidencias/ticket_3/impresora_error.jpg', 189440, 'jpg', true, NOW() - INTERVAL 1 HOUR, 'luis.garcia@alcaldia.gov.co'),
(4, 'software_actualizado.png', 'IMAGEN', 'Captura de la nueva versión instalada', '/evidencias/ticket_4/software_actualizado.png', 156720, 'png', true, NOW() - INTERVAL 1 DAY, 'maria.lopez@alcaldia.gov.co');

-- Insertar configuraciones del sistema
INSERT INTO configuraciones (clave, valor, descripcion, categoria, activa, fecha_creacion, fecha_actualizacion) VALUES
('color_primario', '#3b82f6', 'Color primario del sistema', 'apariencia', true, NOW(), NOW()),
('color_secundario', '#6b7280', 'Color secundario del sistema', 'apariencia', true, NOW(), NOW()),
('color_fondo', '#ffffff', 'Color de fondo del sistema', 'apariencia', true, NOW(), NOW()),
('nombre_sistema', 'Sistema de Gestión de Tickets', 'Nombre del sistema', 'general', true, NOW(), NOW()),
('version_sistema', '1.0.0', 'Versión actual del sistema', 'general', true, NOW(), NOW());

-- Mostrar resumen de datos insertados
SELECT 'Categorías insertadas:' as tipo, COUNT(*) as cantidad FROM categorias
UNION ALL
SELECT 'Técnicos insertados:', COUNT(*) FROM usuarios WHERE tipo_usuario = 'TECNICO'
UNION ALL
SELECT 'Administradores insertados:', COUNT(*) FROM usuarios WHERE tipo_usuario = 'ADMINISTRADOR'
UNION ALL
SELECT 'Funcionarios insertados:', COUNT(*) FROM usuarios WHERE tipo_usuario = 'FUNCIONARIO'
UNION ALL
SELECT 'Tickets insertados:', COUNT(*) FROM tickets
UNION ALL
SELECT 'Evidencias insertadas:', COUNT(*) FROM evidencias
UNION ALL
SELECT 'Configuraciones insertadas:', COUNT(*) FROM configuraciones;
