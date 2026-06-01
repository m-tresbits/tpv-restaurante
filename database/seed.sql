INSERT INTO
    roles (nombre)
VALUES
    ('ADMIN'),
    ('CAMARERO'),
    ('COCINA');

INSERT INTO
    categorias (nombre)
VALUES
    ('Hamburguesas'),
    ('Pizzas'),
    ('Carnes'),
    ('Entrantes'),
    ('Ensaladas');

INSERT INTO
    productos (nombre, precio, categoria_id)
VALUES
    ('Burger', 8.50, 1),
    ('Burger vegetal', 8.90, 1),
    ('Pizza 4 quesos', 10.50, 2),
    ('Pizza BBQ', 10.90, 2),
    ('Cerdo asado', 12.50, 3),
    ('Patatas fritas', 4.50, 4),
    ('Ensalada', 6.50, 5);

INSERT INTO
    mesas (numero, estado)
VALUES
    (1, 'LIBRE'),
    (2, 'LIBRE'),
    (3, 'LIBRE'),
    (4, 'LIBRE'),
    (5, 'LIBRE');