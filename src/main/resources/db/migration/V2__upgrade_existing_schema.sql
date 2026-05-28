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

CALL add_column_if_missing(
    'producto_stock',
    'stock_minimo',
    'ALTER TABLE producto_stock ADD COLUMN stock_minimo INT NOT NULL DEFAULT 0'
);

CALL add_column_if_missing(
    'producto_stock',
    'unidad_medida',
    'ALTER TABLE producto_stock ADD COLUMN unidad_medida VARCHAR(30) NOT NULL DEFAULT ''unidades'''
);

CALL add_column_if_missing(
    'reserva',
    'estado',
    'ALTER TABLE reserva ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT ''CONFIRMADA'''
);

CALL add_index_if_missing(
    'reserva',
    'idx_reserva_mesa_inicio',
    'CREATE INDEX idx_reserva_mesa_inicio ON reserva (mesa_id, fecha_hora_inicio)'
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
