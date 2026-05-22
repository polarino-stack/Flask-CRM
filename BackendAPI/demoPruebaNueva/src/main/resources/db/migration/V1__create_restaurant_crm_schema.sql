CREATE TABLE categoria_stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_categoria_stock_nombre UNIQUE (nombre)
);

CREATE TABLE mesa (
    id BIGINT NOT NULL AUTO_INCREMENT,
    numero_mesa INT NOT NULL,
    capacidad INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_mesa_numero_mesa UNIQUE (numero_mesa),
    CONSTRAINT chk_mesa_numero_mesa_positive CHECK (numero_mesa > 0),
    CONSTRAINT chk_mesa_capacidad_positive CHECK (capacidad > 0)
);

CREATE TABLE turno_reserva (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_turno_reserva_nombre UNIQUE (nombre)
);

CREATE TABLE empleado (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    numero_telefono VARCHAR(30),
    dni VARCHAR(20) NOT NULL,
    horas_semanales INT NOT NULL,
    horas_mensuales INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_empleado_dni UNIQUE (dni),
    CONSTRAINT chk_empleado_horas_semanales_non_negative CHECK (horas_semanales >= 0),
    CONSTRAINT chk_empleado_horas_mensuales_non_negative CHECK (horas_mensuales >= 0)
);

CREATE TABLE producto_stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    cantidad INT NOT NULL,
    stock_minimo INT NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'unidades',
    telefono_proveedor VARCHAR(30),
    PRIMARY KEY (id),
    CONSTRAINT uk_producto_stock_categoria_nombre UNIQUE (categoria_id, nombre),
    CONSTRAINT fk_producto_stock_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_stock (id),
    CONSTRAINT chk_producto_stock_cantidad_non_negative CHECK (cantidad >= 0),
    CONSTRAINT chk_producto_stock_stock_minimo_non_negative CHECK (stock_minimo >= 0)
);

CREATE TABLE reserva (
    id BIGINT NOT NULL AUTO_INCREMENT,
    mesa_id BIGINT NOT NULL,
    turno_id BIGINT,
    nombre_cliente VARCHAR(160) NOT NULL,
    telefono_cliente VARCHAR(30),
    numero_personas INT NOT NULL,
    fecha_reserva DATE,
    hora_inicio TIME,
    hora_fin TIME,
    fecha_hora_inicio DATETIME(6) NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 90,
    estado VARCHAR(30) NOT NULL DEFAULT 'CONFIRMADA',
    observaciones VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_reserva_mesa FOREIGN KEY (mesa_id) REFERENCES mesa (id),
    CONSTRAINT fk_reserva_turno FOREIGN KEY (turno_id) REFERENCES turno_reserva (id),
    CONSTRAINT chk_reserva_numero_personas_positive CHECK (numero_personas > 0),
    CONSTRAINT chk_reserva_duracion_minutos_positive CHECK (duracion_minutos > 0)
);

CREATE INDEX idx_reserva_mesa_inicio ON reserva (mesa_id, fecha_hora_inicio);
CREATE INDEX idx_reserva_fecha_turno ON reserva (fecha_reserva, turno_id);
CREATE INDEX idx_reserva_mesa_fecha_hora ON reserva (mesa_id, fecha_reserva, hora_inicio);
CREATE INDEX idx_producto_stock_categoria_nombre ON producto_stock (categoria_id, nombre);
