-- Migración para agregar campos de nivel y especialización a técnicos
-- Fecha: 2024-01-XX
-- Descripción: Agrega campos nivel_tecnico, area_especializacion y observaciones a la tabla usuarios

-- Agregar columnas para técnicos
ALTER TABLE usuarios 
ADD COLUMN nivel_tecnico VARCHAR(20) DEFAULT NULL,
ADD COLUMN area_especializacion VARCHAR(100) DEFAULT NULL,
ADD COLUMN observaciones VARCHAR(500) DEFAULT NULL;

-- Crear índice para búsquedas por nivel de técnico
CREATE INDEX idx_usuarios_nivel_tecnico ON usuarios(nivel_tecnico);

-- Crear índice para búsquedas por área de especialización
CREATE INDEX idx_usuarios_area_especializacion ON usuarios(area_especializacion);

-- Actualizar técnicos existentes con nivel BAJO por defecto
UPDATE usuarios 
SET nivel_tecnico = 'BAJO' 
WHERE tipo_usuario = 'TECNICO' 
AND nivel_tecnico IS NULL;

-- Comentarios sobre las columnas
COMMENT ON COLUMN usuarios.nivel_tecnico IS 'Nivel del técnico: BAJO, MEDIO, ALTO';
COMMENT ON COLUMN usuarios.area_especializacion IS 'Área de especialización del técnico';
COMMENT ON COLUMN usuarios.observaciones IS 'Notas adicionales sobre el técnico';
