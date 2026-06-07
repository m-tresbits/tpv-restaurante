INSERT INTO
    roles (nombre)
VALUES
    ('ADMIN'),
    ('CAMARERO'),
    ('COCINA') ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    usuarios (nombre, pin_hash, rol_id)
SELECT
    'Administrador',
    '$argon2id$v=19$m=65536,t=3,p=4$6spMTHXG+CFZwNyQOxpftA$1RttkM27A9a3KlNH3LyridHl5mrAz7quomkJuu0N4GM',
    r.id
FROM
    roles r
WHERE
    r.nombre = 'ADMIN' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    usuarios (nombre, pin_hash, rol_id)
SELECT
    'Camarero',
    '$argon2id$v=19$m=65536,t=3,p=4$mhpj0EQy640D5IxxSjs/Lw$hTrzDgd32K7+fIlGwb5KO0w8okswxxbMjDbxJP/vy3A',
    r.id
FROM
    roles r
WHERE
    r.nombre = 'CAMARERO' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    usuarios (nombre, pin_hash, rol_id)
SELECT
    'Cocina',
    '$argon2id$v=19$m=65536,t=3,p=4$l0N4nWr698x59FdkbiCQag$3ZDSRV8WMscrpb6rDoX3Py7Jr2T5hB3bAFnjkVDFBFw',
    r.id
FROM
    roles r
WHERE
    r.nombre = 'COCINA' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    categorias (nombre)
VALUES
    ('Hamburguesas'),
    ('Pizzas'),
    ('Carnes'),
    ('Entrantes'),
    ('Ensaladas') ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    mesas (numero, capacidad, estado)
VALUES
    (1, 4, 'LIBRE'),
    (2, 4, 'LIBRE'),
    (3, 4, 'LIBRE'),
    (4, 4, 'LIBRE'),
    (5, 4, 'LIBRE') ON CONFLICT (numero) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Burger',
    'Hamburguesa clásica de la casa',
    8.50,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Hamburguesas' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Burger vegetal',
    'Hamburguesa vegetal',
    8.90,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Hamburguesas' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Pizza 4 quesos',
    'Pizza con mezcla de cuatro quesos',
    10.50,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Pizzas' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Pizza BBQ',
    'Pizza con salsa barbacoa',
    10.90,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Pizzas' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Cerdo asado',
    'Plato principal de cerdo asado',
    12.50,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Carnes' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Patatas fritas',
    'Ración de patatas fritas',
    4.50,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Entrantes' ON CONFLICT (nombre) DO NOTHING;

INSERT INTO
    productos (nombre, descripcion, precio, categoria_id)
SELECT
    'Ensalada',
    'Ensalada sencilla',
    6.50,
    c.id
FROM
    categorias c
WHERE
    c.nombre = 'Ensaladas' ON CONFLICT (nombre) DO NOTHING;