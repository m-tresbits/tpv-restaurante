BEGIN;

TRUNCATE TABLE detalle_pedido, pedidos, stock, productos, categorias, mesas
RESTART IDENTITY CASCADE;

INSERT INTO categorias (nombre, activo)
VALUES
('Hamburguesas', true),
('Pizzas', true),
('Carnes', true),
('Guarniciones', true),
('Ensaladas', true),
('Postres', false);

INSERT INTO productos (nombre, descripcion, precio, activo, categoria_id)
VALUES
(
'Burger',
'Hamburguesa clásica con carne, queso y pan brioche.',
8.50,
true,
(SELECT id FROM categorias WHERE nombre = 'Hamburguesas')
),
(
'Burger vegetal',
'Hamburguesa vegetal con verduras y pan brioche.',
8.00,
true,
(SELECT id FROM categorias WHERE nombre = 'Hamburguesas')
),
(
'Pizza 4 quesos',
'Pizza con mezcla de cuatro quesos.',
9.50,
true,
(SELECT id FROM categorias WHERE nombre = 'Pizzas')
),
(
'Pizza BBQ',
'Pizza con salsa barbacoa, carne y queso.',
10.00,
true,
(SELECT id FROM categorias WHERE nombre = 'Pizzas')
),
(
'Cerdo asado',
'Ración de cerdo asado con guarnición.',
11.50,
true,
(SELECT id FROM categorias WHERE nombre = 'Carnes')
),
(
'Patatas fritas',
'Ración de patatas fritas.',
4.00,
true,
(SELECT id FROM categorias WHERE nombre = 'Guarniciones')
),
(
'Ensalada',
'Ensalada fresca de la casa.',
6.50,
true,
(SELECT id FROM categorias WHERE nombre = 'Ensaladas')
);

INSERT INTO mesas (numero, capacidad, estado)
VALUES
(1, 2, 'LIBRE'),
(2, 4, 'LIBRE'),
(3, 4, 'LIBRE'),
(4, 6, 'LIBRE'),
(5, 8, 'LIBRE');

INSERT INTO stock (producto_id, cantidad)
SELECT p.id,
CASE p.nombre
WHEN 'Burger' THEN 25
WHEN 'Burger vegetal' THEN 12
WHEN 'Pizza 4 quesos' THEN 18
WHEN 'Pizza BBQ' THEN 0
WHEN 'Cerdo asado' THEN 5
WHEN 'Patatas fritas' THEN 30
WHEN 'Ensalada' THEN 14
END
FROM productos p
WHERE p.nombre IN (
'Burger',
'Burger vegetal',
'Pizza 4 quesos',
'Pizza BBQ',
'Cerdo asado',
'Patatas fritas',
'Ensalada'
);

SELECT setval(pg_get_serial_sequence('categorias', 'id'), COALESCE((SELECT MAX(id) FROM categorias), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('mesas', 'id'), COALESCE((SELECT MAX(id) FROM mesas), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('stock', 'id'), COALESCE((SELECT MAX(id) FROM stock), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('pedidos', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('detalle_pedido', 'id'), 1, false);

COMMIT;
