-- Script para insertar datos de prueba en el sistema de tickets
USE ticketflow;

-- Insertar técnicos
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, tipo_usuario, activo, email_verificado, require_2fa, fecha_creacion, creado_por) VALUES
('Carlos', 'Mendoza', 'carlos.mendoza@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 111 1111', 'TECNICO', 1, 1, 0, NOW(), 1),
('María', 'González', 'maria.gonzalez@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 333 3333', 'TECNICO', 1, 1, 0, NOW(), 1),
('Luis', 'Hernández', 'luis.hernandez@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 444 4444', 'TECNICO', 1, 1, 0, NOW(), 1);

-- Insertar funcionarios
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, tipo_usuario, activo, email_verificado, require_2fa, fecha_creacion, creado_por) VALUES
('Pedro', 'Martínez', 'pedro.martinez@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 555 5555', 'FUNCIONARIO', 1, 1, 0, NOW(), 1),
('Sofia', 'López', 'sofia.lopez@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 666 6666', 'FUNCIONARIO', 1, 1, 0, NOW(), 1),
('Diego', 'Ramírez', 'diego.ramirez@empresa.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqVqVqVqVqVqVqVqVqVqVqVq', '+57 300 777 7777', 'FUNCIONARIO', 1, 1, 0, NOW(), 1);

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, activa, fecha_creacion) VALUES
('Hardware', 'Problemas relacionados con equipos de computo, impresoras, etc.', 1, NOW()),
('Software', 'Problemas con aplicaciones, sistemas operativos, etc.', 1, NOW()),
('Redes', 'Problemas de conectividad, internet, intranet', 1, NOW()),
('Soporte', 'Solicitudes de soporte general', 1, NOW());

-- Insertar tickets
INSERT INTO tickets (asunto, descripcion, prioridad, estado, fecha_creacion, creador_id, categoria_id) VALUES
('Computadora no enciende', 'La computadora del escritorio 5 no enciende, no hay señal de luz de encendido', 'ALTA', 'ABIERTO', NOW(), 4, 1),
('Error en aplicación contable', 'La aplicación de contabilidad muestra error al generar reportes', 'MEDIA', 'ABIERTO', NOW(), 5, 2),
('Internet lento', 'La conexión a internet está muy lenta en toda la oficina', 'ALTA', 'ABIERTO', NOW(), 6, 3),
('Instalar nuevo software', 'Necesito instalar Microsoft Office en mi computadora', 'BAJA', 'ABIERTO', NOW(), 4, 4),
('Impresora no imprime', 'La impresora del piso 2 no responde a los trabajos de impresión', 'MEDIA', 'ABIERTO', NOW(), 5, 1);

-- Asignar algunos tickets a técnicos
UPDATE tickets SET tecnico_id = 3, estado = 'EN_PROGRESO' WHERE id = 1;
UPDATE tickets SET tecnico_id = 4, estado = 'EN_PROGRESO' WHERE id = 2;
UPDATE tickets SET tecnico_id = 5, estado = 'ABIERTO' WHERE id = 3;