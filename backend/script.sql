-- BASE DE DATOS: SISTEMA DE OPTIMIZACIÓN E INVENTARIO
CREATE DATABASE IF NOT EXISTS sistema_inventario;
USE sistema_inventario;

--  TABLA USUARIOS 
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'Operario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABLA CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB;

-- TABLA PRODUCTOS 
CREATE TABLE IF NOT EXISTS productos (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) NOT NULL UNIQUE,
    id_categoria INT,
    nombre_producto VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo_alerta INT NOT NULL DEFAULT 5,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Vistas espejo
CREATE OR REPLACE VIEW product AS 
SELECT *, id_product AS id_producto FROM productos;

-- TABLA TRANSACCIONES 
CREATE TABLE IF NOT EXISTS transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_product INT NOT NULL,
    id_usuario INT NULL,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'VENTA') NOT NULL,
    cantidad INT NOT NULL,
    precio_operation DECIMAL(10, 2) NULL DEFAULT 0.00,
    descripcion TEXT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_product) REFERENCES productos(id_product) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Vista espejo 
CREATE OR REPLACE VIEW transacciones_inventario AS 
SELECT 
    id_transaccion,
    id_product,
    id_product AS id_producto,
    id_usuario,
    tipo_movimiento,
    cantidad,
    precio_operation,
    descripcion,
    fecha_movimiento,
    fecha_movimiento AS fecha_transaccion
FROM transacciones;


INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES 
('admin', 'admin123', 'Carlos Mendoza', 'Admin'),
('operario', 'operario123', 'Jorge Luis Portal', 'Operario')
ON DUPLICATE KEY UPDATE id_usuario=id_usuario;


INSERT INTO categorias (nombre_categoria, descripcion) VALUES 
('Almacenamiento', 'Unidades de estado sólido SSD y discos mecánicos'),
('Componentes de Hardware', 'Tarjetas de video y procesadores')
ON DUPLICATE KEY UPDATE id_categoria=id_categoria;

-- Inserción de Productos
INSERT INTO productos (codigo_barras, id_categoria, nombre_producto, precio_unitario, stock_actual, stock_minimo_alerta) VALUES
('7501055121011', 1, 'Disco Solido SSD NVMe 1TB', 320.00, 45, 10),
('7501055121035', 2, 'Tarjeta de Video RTX 4060 Ti', 1850.00, 3, 5)
ON DUPLICATE KEY UPDATE codigo_barras=codigo_barras;

-- Historial de transacciones 
INSERT INTO transacciones (id_product, id_usuario, tipo_movimiento, cantidad, precio_operation, descripcion) VALUES
(1, 1, 'ENTRADA', 50, 320.00, 'Carga inicial de stock'),
(2, 2, 'VENTA', 2, 1850.00, 'Venta web procesada')
ON DUPLICATE KEY UPDATE id_transaccion=id_transaccion;