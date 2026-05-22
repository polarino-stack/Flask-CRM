DROP PROCEDURE IF EXISTS add_column_if_missing;

CREATE PROCEDURE add_column_if_missing(
    IN table_name_param VARCHAR(64),
    IN column_name_param VARCHAR(64),
    IN alter_sql_param TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = table_name_param
          AND column_name = column_name_param
    ) THEN
        SET @alter_sql = alter_sql_param;
        PREPARE stmt FROM @alter_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;

DROP PROCEDURE IF EXISTS add_index_if_missing;

CREATE PROCEDURE add_index_if_missing(
    IN table_name_param VARCHAR(64),
    IN index_name_param VARCHAR(64),
    IN alter_sql_param TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = table_name_param
          AND index_name = index_name_param
    ) THEN
        SET @alter_sql = alter_sql_param;
        PREPARE stmt FROM @alter_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;

CREATE TABLE IF NOT EXISTS turno_reserva (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_turno_reserva_nombre UNIQUE (nombre)
);

INSERT IGNORE INTO turno_reserva (nombre, hora_inicio, hora_fin, activo) VALUES
('Comida 1', '13:00:00', '14:30:00', TRUE),
('Comida 2', '14:30:00', '16:00:00', TRUE),
('Cena 1', '20:00:00', '21:30:00', TRUE),
('Cena 2', '21:30:00', '23:00:00', TRUE);

CALL add_column_if_missing(
    'reserva',
    'turno_id',
    'ALTER TABLE reserva ADD COLUMN turno_id BIGINT NULL'
);

CALL add_column_if_missing(
    'reserva',
    'telefono_cliente',
    'ALTER TABLE reserva ADD COLUMN telefono_cliente VARCHAR(30) NULL'
);

CALL add_column_if_missing(
    'reserva',
    'fecha_reserva',
    'ALTER TABLE reserva ADD COLUMN fecha_reserva DATE NULL'
);

CALL add_column_if_missing(
    'reserva',
    'hora_inicio',
    'ALTER TABLE reserva ADD COLUMN hora_inicio TIME NULL'
);

CALL add_column_if_missing(
    'reserva',
    'hora_fin',
    'ALTER TABLE reserva ADD COLUMN hora_fin TIME NULL'
);

CALL add_column_if_missing(
    'reserva',
    'observaciones',
    'ALTER TABLE reserva ADD COLUMN observaciones VARCHAR(500) NULL'
);

UPDATE reserva
SET fecha_reserva = DATE(fecha_hora_inicio)
WHERE fecha_reserva IS NULL
  AND fecha_hora_inicio IS NOT NULL;

UPDATE reserva
SET hora_inicio = TIME(fecha_hora_inicio)
WHERE hora_inicio IS NULL
  AND fecha_hora_inicio IS NOT NULL;

UPDATE reserva
SET hora_fin = TIME(DATE_ADD(fecha_hora_inicio, INTERVAL duracion_minutos MINUTE))
WHERE hora_fin IS NULL
  AND fecha_hora_inicio IS NOT NULL
  AND duracion_minutos IS NOT NULL;

UPDATE reserva r
JOIN turno_reserva t
  ON r.hora_inicio >= t.hora_inicio
 AND r.hora_inicio < t.hora_fin
 AND t.activo = TRUE
SET r.turno_id = t.id
WHERE r.turno_id IS NULL
  AND r.hora_inicio IS NOT NULL;

CALL add_index_if_missing(
    'reserva',
    'idx_reserva_fecha_turno',
    'CREATE INDEX idx_reserva_fecha_turno ON reserva (fecha_reserva, turno_id)'
);

CALL add_index_if_missing(
    'reserva',
    'idx_reserva_mesa_fecha_hora',
    'CREATE INDEX idx_reserva_mesa_fecha_hora ON reserva (mesa_id, fecha_reserva, hora_inicio)'
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
