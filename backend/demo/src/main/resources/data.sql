-- Datos de prueba para el sistema de encuestas de satisfacción
-- Este archivo se ejecuta automáticamente al iniciar la aplicación

-- Insertar algunos tickets de ejemplo para las encuestas
INSERT INTO tickets (id, creador_id, tecnico_id, estado, ubicacion, consulta, categoria, categoria_nombre, asunto, descripcion, prioridad, fecha_creacion, fecha_actualizacion) VALUES
(1, 1, 2, 'RESUELTO', 'Oficina Principal', 'Problema con la impresora', 'Hardware', 'Hardware', 'Impresora no funciona', 'La impresora no imprime correctamente', 'ALTA', '2024-09-01 10:00:00', '2024-09-02 14:30:00'),
(2, 1, 2, 'RESUELTO', 'Oficina Principal', 'Problema con el sistema', 'Software', 'Software', 'Error en el sistema', 'El sistema no responde', 'MEDIA', '2024-09-02 09:15:00', '2024-09-03 11:45:00'),
(3, 1, 3, 'PENDIENTE', 'Oficina Principal', 'Problema de red', 'Red', 'Red', 'Conexión lenta', 'La conexión a internet está muy lenta', 'ALTA', '2024-09-03 14:20:00', '2024-09-03 14:20:00'),
(4, 1, 2, 'EN_PROCESO', 'Oficina Principal', 'Problema con el servidor', 'Sistemas', 'Sistemas', 'Servidor caído', 'El servidor principal está caído', 'CRITICA', '2024-09-04 08:30:00', '2024-09-04 10:15:00'),
(5, 1, 3, 'RESUELTO', 'Oficina Principal', 'Problema con el email', 'Software', 'Software', 'Email no funciona', 'No se pueden enviar emails', 'MEDIA', '2024-09-05 11:00:00', '2024-09-06 16:20:00'),
(6, 1, 2, 'RESUELTO', 'Oficina Principal', 'Problema con la base de datos', 'Sistemas', 'Sistemas', 'BD lenta', 'La base de datos está muy lenta', 'ALTA', '2024-09-06 13:45:00', '2024-09-07 09:30:00'),
(7, 1, 3, 'PENDIENTE', 'Oficina Principal', 'Problema con el antivirus', 'Software', 'Software', 'Antivirus desactualizado', 'El antivirus necesita actualización', 'BAJA', '2024-09-07 15:10:00', '2024-09-07 15:10:00'),
(8, 1, 2, 'RESUELTO', 'Oficina Principal', 'Problema con el monitor', 'Hardware', 'Hardware', 'Monitor con rayas', 'El monitor muestra rayas verticales', 'MEDIA', '2024-09-08 10:30:00', '2024-09-09 14:45:00'),
(9, 1, 3, 'EN_PROCESO', 'Oficina Principal', 'Problema con el router', 'Red', 'Red', 'Router no responde', 'El router no responde a la configuración', 'ALTA', '2024-09-09 12:00:00', '2024-09-09 15:30:00'),
(10, 1, 2, 'RESUELTO', 'Oficina Principal', 'Problema con el teclado', 'Hardware', 'Hardware', 'Teclado con teclas pegadas', 'Algunas teclas del teclado se pegan', 'BAJA', '2024-09-10 16:20:00', '2024-09-11 10:15:00');

-- Insertar algunas encuestas de satisfacción de ejemplo
INSERT INTO encuestas_satisfaccion (ticket_id, usuario_id, calificacion, comentario, aspectos_positivos, aspectos_negativos, fecha_creacion, activo) VALUES
(1, 1, 5, 'Excelente atención, problema resuelto rápidamente', '["Rapidez", "Profesionalismo"]', '[]', '2024-09-02 15:00:00', true),
(2, 1, 4, 'Buen servicio, pero tardó un poco más de lo esperado', '["Conocimiento técnico"]', '["Tiempo de respuesta"]', '2024-09-03 12:00:00', true),
(5, 1, 5, 'Perfecto, muy satisfecho con el resultado', '["Rapidez", "Solución efectiva"]', '[]', '2024-09-06 17:00:00', true),
(6, 1, 4, 'Buen trabajo, pero podría mejorar la comunicación', '["Solución técnica"]', '["Comunicación"]', '2024-09-07 10:00:00', true),
(8, 1, 5, 'Excelente servicio, muy recomendado', '["Profesionalismo", "Rapidez"]', '[]', '2024-09-09 15:00:00', true),
(10, 1, 3, 'Regular, el problema se resolvió pero tardó mucho', '["Solución final"]', '["Tiempo", "Comunicación"]', '2024-09-11 11:00:00', true);
