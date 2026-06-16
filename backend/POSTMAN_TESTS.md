# API Tests

Pruebas rápidas para comprobar el backend en Postman.

Usar `Authorization > Bearer Token` en todas las rutas protegidas.

Variables recomendadas:

```text
baseUrl = http://localhost:3000
fecha = 2026-06-16
productId = id real de un producto
tableId = id real de una mesa libre
orderId = id devuelto por POST /orders
detailId = id devuelto al añadir un producto al pedido
```

---

## Auth

Login como administrador.

```http
POST {{baseUrl}}/auth/login
```

```json
{
  "nombre": "Administrador",
  "pin": "1111"
}
```

Login como camarero.

```http
POST {{baseUrl}}/auth/login
```

```json
{
  "nombre": "Camarero",
  "pin": "2222"
}
```

Login como cocina.

```http
POST {{baseUrl}}/auth/login
```

```json
{
  "nombre": "Cocina",
  "pin": "3333"
}
```

---

## Categories

ADMIN obtiene todas las categorías.

```http
GET {{baseUrl}}/categories
```

ADMIN o CAMARERO obtiene categorías activas.

```http
GET {{baseUrl}}/categories/active
```

ADMIN crea una categoría.

```http
POST {{baseUrl}}/categories
```

```json
{
  "nombre": "Postres"
}
```

ADMIN edita una categoría.

```http
PATCH {{baseUrl}}/categories/6
```

```json
{
  "nombre": "Postres caseros"
}
```

ADMIN desactiva una categoría.

```http
PATCH {{baseUrl}}/categories/6/deactivate
```

ADMIN activa una categoría.

```http
PATCH {{baseUrl}}/categories/6/activate
```

---

## Products

ADMIN obtiene todos los productos.

```http
GET {{baseUrl}}/products
```

ADMIN o CAMARERO obtiene productos disponibles.

```http
GET {{baseUrl}}/products/available
```

ADMIN o CAMARERO obtiene un producto.

```http
GET {{baseUrl}}/products/{{productId}}
```

ADMIN crea un producto.

```http
POST {{baseUrl}}/products
```

```json
{
  "nombre": "Burger prueba",
  "descripcion": "Producto de prueba",
  "precio": 9.5,
  "categoriaId": 1
}
```

ADMIN edita un producto.

```http
PATCH {{baseUrl}}/products/{{productId}}
```

```json
{
  "precio": 10.5,
  "descripcion": "Hamburguesa clásica con queso"
}
```

ADMIN desactiva un producto.

```http
PATCH {{baseUrl}}/products/{{productId}}/deactivate
```

ADMIN activa un producto.

```http
PATCH {{baseUrl}}/products/{{productId}}/activate
```

---

## Tables

ADMIN obtiene todas las mesas.

```http
GET {{baseUrl}}/tables
```

ADMIN o CAMARERO obtiene mesas activas.

```http
GET {{baseUrl}}/tables/active
```

ADMIN o CAMARERO obtiene una mesa.

```http
GET {{baseUrl}}/tables/{{tableId}}
```

ADMIN crea una mesa.

```http
POST {{baseUrl}}/tables
```

```json
{
  "numero": 99,
  "capacidad": 4
}
```

ADMIN edita una mesa.

```http
PATCH {{baseUrl}}/tables/{{tableId}}
```

```json
{
  "capacidad": 6
}
```

ADMIN o CAMARERO cambia el estado de una mesa.

```http
PATCH {{baseUrl}}/tables/{{tableId}}/status
```

```json
{
  "estado": "OCUPADA"
}
```

Liberar mesa.

```http
PATCH {{baseUrl}}/tables/{{tableId}}/status
```

```json
{
  "estado": "LIBRE"
}
```

---

## Stock

ADMIN obtiene todo el stock.

```http
GET {{baseUrl}}/stock
```

ADMIN, CAMARERO o COCINA obtiene stock por fecha.

```http
GET {{baseUrl}}/stock/date/{{fecha}}
```

ADMIN, CAMARERO o COCINA obtiene stock de un producto en una fecha.

```http
GET {{baseUrl}}/stock/product/{{productId}}/date/{{fecha}}
```

ADMIN crea o actualiza stock diario.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": {{productId}},
  "fecha": "{{fecha}}",
  "cantidadInicial": 20
}
```

---

## Orders

Antes de añadir productos, debe existir stock diario para el producto y la fecha del pedido.

CAMARERO abre un pedido en una mesa libre.

```http
POST {{baseUrl}}/orders
```

```json
{
  "mesaId": {{tableId}}
}
```

Guardar el `id` de la respuesta como `orderId`.

CAMARERO añade un producto al pedido.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": {{productId}},
  "cantidad": 2,
  "observaciones": "Sin cebolla"
}
```

Guardar el `id` de la línea añadida como `detailId`.

Comprobar que el stock ha bajado.

```http
GET {{baseUrl}}/stock/product/{{productId}}/date/{{fecha}}
```

CAMARERO envía el pedido a cocina.

```http
POST {{baseUrl}}/orders/{{orderId}}/send-to-kitchen
```

ADMIN, CAMARERO o COCINA obtiene pedidos abiertos o en cocina.

```http
GET {{baseUrl}}/orders/open
```

ADMIN, CAMARERO o COCINA obtiene un pedido.

```http
GET {{baseUrl}}/orders/{{orderId}}
```

COCINA marca una línea en preparación.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "EN_PREPARACION"
}
```

COCINA marca una línea como lista.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "LISTO"
}
```

CAMARERO marca una línea como servida.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "SERVIDO"
}
```

CAMARERO cierra el pedido.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/close
```

Al cerrar un pedido, el stock no se restaura.

ADMIN o CAMARERO cancela un pedido.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/cancel
```

Al cancelar un pedido, el stock se restaura. Para probar cancelación, usar un pedido distinto al cerrado.

---

## Negative tests

CAMARERO intenta crear una categoría. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/categories
```

```json
{
  "nombre": "Prueba camarero"
}
```

CAMARERO intenta crear un producto. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/products
```

```json
{
  "nombre": "Producto prueba",
  "descripcion": "No debería crearse",
  "precio": 5,
  "categoriaId": 1
}
```

CAMARERO intenta crear una mesa. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/tables
```

```json
{
  "numero": 100,
  "capacidad": 2
}
```

CAMARERO intenta crear stock. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": {{productId}},
  "fecha": "{{fecha}}",
  "cantidadInicial": 20
}
```

ADMIN intenta crear stock con fecha incorrecta. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": {{productId}},
  "fecha": "16-06-2026",
  "cantidadInicial": 20
}
```

ADMIN intenta crear stock con cantidad negativa. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": {{productId}},
  "fecha": "{{fecha}}",
  "cantidadInicial": -1
}
```

COCINA intenta usar un estado no permitido. Resultado esperado: `400 Bad Request`.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "MAL"
}
```

ADMIN intenta abrir un pedido. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/orders
```

```json
{
  "mesaId": {{tableId}}
}
```

COCINA intenta añadir productos a un pedido. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": {{productId}},
  "cantidad": 1
}
```

CAMARERO intenta añadir un producto sin stock diario configurado. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 2,
  "cantidad": 1,
  "observaciones": "Sin stock configurado"
}
```

CAMARERO intenta añadir más cantidad que el stock disponible. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": {{productId}},
  "cantidad": 999,
  "observaciones": "Stock insuficiente"
}
```

Las pruebas de stock insuficiente o sin stock deben hacerse con un pedido en estado `ABIERTO`.

---

## Flujo recomendado

1. Login ADMIN.
2. Consultar productos y mesas.
3. Crear stock diario para `productId` y `fecha`.
4. Login CAMARERO.
5. Crear pedido y guardar `orderId`.
6. Añadir producto y guardar `detailId`.
7. Comprobar que el stock baja.
8. Enviar pedido a cocina.
9. Login COCINA.
10. Marcar línea como `EN_PREPARACION`.
11. Marcar línea como `LISTO`.
12. Login CAMARERO.
13. Marcar línea como `SERVIDO`.
14. Cerrar pedido.
15. Comprobar que la mesa queda `LIBRE`.

Para probar cancelación, crear otro pedido, añadir producto y cancelar. El stock debe restaurarse.

---

## Notes

No asumir ids fijos. Usar siempre los ids reales devueltos por la API.

`401 Unauthorized`: falta token o el token no es válido.

`403 Forbidden`: el usuario tiene token válido, pero no tiene permisos.

`400 Bad Request`: la petición no cumple validaciones o reglas de negocio.
