BEGIN;

CREATE TABLE
    IF NOT EXISTS roles (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS usuarios (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        pin_hash VARCHAR(255) NOT NULL,
        rol_id INTEGER NOT NULL REFERENCES roles (id),
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        ultimo_acceso TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS categorias (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS productos (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
        categoria_id INTEGER NOT NULL REFERENCES categorias (id),
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS mesas (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        numero INTEGER NOT NULL UNIQUE,
        capacidad INTEGER NOT NULL DEFAULT 4 CHECK (capacidad > 0),
        estado VARCHAR(30) NOT NULL DEFAULT 'LIBRE' CHECK (
            estado IN ('LIBRE', 'OCUPADA', 'RESERVADA', 'INACTIVA')
        ),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS pedidos (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        mesa_id INTEGER NOT NULL REFERENCES mesas (id),
        usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
        estado VARCHAR(30) NOT NULL DEFAULT 'ABIERTO' CHECK (
            estado IN (
                'ABIERTO',
                'EN_COCINA',
                'SERVIDO',
                'CERRADO',
                'CANCELADO'
            )
        ),
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMPTZ NULL,
        total NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS detalle_pedido (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos (id),
        producto_id INTEGER NOT NULL REFERENCES productos (id),
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
        estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (
            estado IN (
                'PENDIENTE',
                'EN_PREPARACION',
                'LISTO',
                'SERVIDO',
                'CANCELADO'
            )
        ),
        observaciones VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS stock (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos (id),
        cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (producto_id)
    );

COMMIT;
