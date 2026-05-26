-- ============================================================================
-- RESTAURANTE CRM - SCHEMA DE BASE DE DATOS MYSQL
-- ============================================================================
-- Este archivo documenta la estructura completa de la base de datos.
-- Las migraciones de Flyway en BackendAPI/demoPruebaNueva/src/main/resources/db/migration/
-- se encargan de crear y actualizar automáticamente las tablas.
--
-- TABLAS PRINCIPALES:
-- - mesa: Información de mesas del restaurante
-- - turno_reserva: Horarios de servicio (comida/cena)
-- - reserva: Registro de reservas de clientes
-- - empleado: Datos del personal del restaurante
-- - categoria_stock: Categorías de productos en inventario
-- - producto_stock: Inventario de productos
-- ============================================================================

-- TABLA: mesa
-- Almacena la configuración de mesas del establecimiento
CREATE TABLE IF NOT EXISTS mesa (
    id BIGINT NOT NULL AUTO_INCREMENT,
    numero_mesa INT NOT NULL,          -- Identificador único de mesa (1, 2, 3...)
    capacidad INT NOT NULL,            -- Número máximo de comensales
    PRIMARY KEY (id),
    CONSTRAINT uk_mesa_numero_mesa UNIQUE (numero_mesa),
    CONSTRAINT chk_mesa_numero_mesa_positive CHECK (numero_mesa > 0),
    CONSTRAINT chk_mesa_capacidad_positive CHECK (capacidad > 0)
);

-- TABLA: turno_reserva
-- Define los horarios de servicio del restaurante
CREATE TABLE IF NOT EXISTS turno_reserva (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,       -- Ej: "Comida 1", "Cena 2"
    hora_inicio TIME NOT NULL,         -- Hora de inicio del turno
    hora_fin TIME NOT NULL,            -- Hora de fin del turno
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_turno_reserva_nombre UNIQUE (nombre)
);

-- Insertar turnos por defecto
INSERT IGNORE INTO turno_reserva (nombre, hora_inicio, hora_fin, activo) VALUES
('Comida 1', '13:00:00', '14:30:00', TRUE),
('Comida 2', '14:30:00', '16:00:00', TRUE),
('Cena 1', '20:00:00', '21:30:00', TRUE),
('Cena 2', '21:30:00', '23:00:00', TRUE);

-- TABLA: reserva
-- Almacena todas las reservas de clientes
CREATE TABLE IF NOT EXISTS reserva (
    id BIGINT NOT NULL AUTO_INCREMENT,
    mesa_id BIGINT NOT NULL,           -- Referencia a la mesa
    turno_id BIGINT,                  -- Referencia al turno
    nombre_cliente VARCHAR(160) NOT NULL,
    telefono_cliente VARCHAR(30),
    numero_personas INT NOT NULL,      -- Cantidad de comensales
    fecha_reserva DATE,                -- Fecha de la reserva
    hora_inicio TIME,                  -- Hora de entrada
    hora_fin TIME,                     -- Hora de salida aproximada
    fecha_hora_inicio DATETIME(6) NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 90,
    estado VARCHAR(30) NOT NULL DEFAULT 'CONFIRMADA',  -- PENDIENTE, CONFIRMADA, SENTADO, FINALIZADA, CANCELADA
    observaciones VARCHAR(500),        -- Alergias, requerimientos especiales, etc.
    PRIMARY KEY (id),
    CONSTRAINT fk_reserva_mesa FOREIGN KEY (mesa_id) REFERENCES mesa (id),
    CONSTRAINT fk_reserva_turno FOREIGN KEY (turno_id) REFERENCES turno_reserva (id),
    CONSTRAINT chk_reserva_numero_personas_positive CHECK (numero_personas > 0),
    CONSTRAINT chk_reserva_duracion_minutos_positive CHECK (duracion_minutos > 0)
);

-- TABLA: empleado
-- Información del personal del restaurante
CREATE TABLE IF NOT EXISTS empleado (
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

-- TABLA: categoria_stock
-- Categorización de productos en el inventario
CREATE TABLE IF NOT EXISTS categoria_stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,      -- Ej: "Bebidas", "Fruta", "Carne"
    PRIMARY KEY (id),
    CONSTRAINT uk_categoria_stock_nombre UNIQUE (nombre)
);

-- TABLA: producto_stock
-- Inventario detallado de productos
CREATE TABLE IF NOT EXISTS producto_stock (
    id BIGINT NOT NULL AUTO_INCREMENT,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    cantidad INT NOT NULL,             -- Cantidad actual en inventario
    stock_minimo INT NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'unidades',
    telefono_proveedor VARCHAR(30),
    PRIMARY KEY (id),
    CONSTRAINT uk_producto_stock_categoria_nombre UNIQUE (categoria_id, nombre),
    CONSTRAINT fk_producto_stock_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_stock (id),
    CONSTRAINT chk_producto_stock_cantidad_non_negative CHECK (cantidad >= 0),
    CONSTRAINT chk_producto_stock_stock_minimo_non_negative CHECK (stock_minimo >= 0)
);

-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
CREATE INDEX IF NOT EXISTS idx_reserva_mesa_inicio ON reserva (mesa_id, fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_reserva_fecha_turno ON reserva (fecha_reserva, turno_id);
CREATE INDEX IF NOT EXISTS idx_reserva_mesa_fecha_hora ON reserva (mesa_id, fecha_reserva, hora_inicio);
CREATE INDEX IF NOT EXISTS idx_producto_stock_categoria_nombre ON producto_stock (categoria_id, nombre);

-- ============================================================================
-- NOTAS DE IMPLEMENTACIÓN:
-- ============================================================================
-- 1. Las migraciones Flyway aplican automáticamente al iniciar Spring Boot
-- 2. El backend en port 8082 proporciona APIs REST para acceder a estos datos
-- 3. El frontend consume los datos a través de endpoints /api/*
-- 4. Las contraseñas de empleados se manejan en el frontend (localStorage)
-- 5. Para conexión, configurar variables de entorno: DB_URL, DB_USERNAME, DB_PASSWORD
-- ============================================================================