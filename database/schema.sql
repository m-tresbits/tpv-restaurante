CREATE TABLE
    roles (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE
    );

CREATE TABLE
    usuarios (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        pin VARCHAR(10) NOT NULL,
        rol_id INTEGER NOT NULL REFERENCES roles (id)
    );

CREATE TABLE
    categorias (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
    );

CREATE TABLE
    productos (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio NUMERIC(10, 2) NOT NULL,
        categoria_id INTEGER NOT NULL REFERENCES categorias (id),
        activo BOOLEAN DEFAULT TRUE
    );

CREATE TABLE
    mesas (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        numero INTEGER NOT NULL UNIQUE,
        estado VARCHAR(30) NOT NULL DEFAULT 'LIBRE'
    );

CREATE TABLE
    pedidos (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        mesa_id INTEGER NOT NULL REFERENCES mesas (id),
        usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
        estado VARCHAR(30) NOT NULL DEFAULT 'ABIERTO',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    detalle_pedido (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos (id),
        producto_id INTEGER NOT NULL REFERENCES productos (id),
        cantidad INTEGER NOT NULL,
        precio_unitario NUMERIC(10, 2) NOT NULL,
        estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'
    );

CREATE TABLE
    stock_diario (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos (id),
        fecha DATE NOT NULL,
        cantidad_disponible INTEGER NOT NULL,
        UNIQUE (producto_id, fecha)
    );