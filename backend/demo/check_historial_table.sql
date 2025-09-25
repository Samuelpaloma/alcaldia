-- Verificar la estructura de la tabla historial_asignaciones
DESCRIBE historial_asignaciones;

-- Verificar si existe el campo email_usuario
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'historial_asignaciones' 
AND TABLE_SCHEMA = DATABASE();

-- Verificar los datos existentes
SELECT * FROM historial_asignaciones LIMIT 5;


