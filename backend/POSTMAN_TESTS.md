# API Tests

Pruebas rápidas para comprobar los endpoints del backend en Postman.

Usar `Authorization > Bearer Token` en todas las rutas protegidas.

Variables recomendadas en Postman:

```text
baseUrl = http://localhost:3000
fecha = 2026-06-16
productId = 1
tableId = 1
orderId = id devuelto por POST /orders
detailId = id devuelto dentro de details al añadir un producto
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

ADMIN o CAMARERO obtiene solo categorías activas.

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

CAMARERO intenta crear una categoría. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/categories
```

```json
{
  "nombre": "Prueba camarero"
}
```

---

## Products

ADMIN obtiene todos los productos.

```http
GET {{baseUrl}}/products
```

ADMIN o CAMARERO obtiene solo productos disponibles.

```http
GET {{baseUrl}}/products/available
```

ADMIN o CAMARERO obtiene un producto por id.

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

CAMARERO intenta obtener todos los productos. Resultado esperado: `403 Forbidden`.

```http
GET {{baseUrl}}/products
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

CAMARERO intenta editar un producto. Resultado esperado: `403 Forbidden`.

```http
PATCH {{baseUrl}}/products/{{productId}}
```

```json
{
  "precio": 1
}
```

---

## Tables

ADMIN obtiene todas las mesas.

```http
GET {{baseUrl}}/tables
```

ADMIN o CAMARERO obtiene solo las mesas activas.

```http
GET {{baseUrl}}/tables/active
```

ADMIN o CAMARERO obtiene una mesa por id.

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

ADMIN o CAMARERO libera una mesa.

```http
PATCH {{baseUrl}}/tables/{{tableId}}/status
```

```json
{
  "estado": "LIBRE"
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

---

## Stock

ADMIN obtiene todo el stock diario.

```http
GET {{baseUrl}}/stock
```

ADMIN, CAMARERO o COCINA obtiene el stock de una fecha.

```http
GET {{baseUrl}}/stock/date/{{fecha}}
```

ADMIN, CAMARERO o COCINA obtiene el stock de un producto en una fecha.

```http
GET {{baseUrl}}/stock/product/{{productId}}/date/{{fecha}}
```

ADMIN crea o actualiza el stock diario de un producto antes de usarlo en pedidos.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": 1,
  "fecha": "2026-06-16",
  "cantidadInicial": 20
}
```

ADMIN intenta crear stock con una fecha incorrecta. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": 1,
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
  "productoId": 1,
  "fecha": "2026-06-16",
  "cantidadInicial": -1
}
```

CAMARERO intenta crear o actualizar stock diario. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/stock/daily
```

```json
{
  "productoId": 1,
  "fecha": "2026-06-16",
  "cantidadInicial": 20
}
```

---

## Orders

Antes de añadir productos a un pedido, debe existir stock diario para el producto y la fecha del pedido.

CAMARERO abre un pedido en una mesa libre.

```http
POST {{baseUrl}}/orders
```

```json
{
  "mesaId": 1
}
```

Guardar el campo `id` de la respuesta como `orderId`.

CAMARERO añade un producto al pedido usando el `orderId` real.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 1,
  "cantidad": 2,
  "observaciones": "Sin cebolla"
}
```

Guardar el campo `details[0].id` de la respuesta como `detailId`.

ADMIN, CAMARERO o COCINA comprueba que el stock se ha descontado.

```http
GET {{baseUrl}}/stock/product/{{productId}}/date/{{fecha}}
```

CAMARERO envía el pedido a cocina.

```http
POST {{baseUrl}}/orders/{{orderId}}/send-to-kitchen
```

ADMIN, CAMARERO o COCINA obtiene los pedidos abiertos o enviados a cocina.

```http
GET {{baseUrl}}/orders/open
```

ADMIN, CAMARERO o COCINA obtiene un pedido por id.

```http
GET {{baseUrl}}/orders/{{orderId}}
```

COCINA marca una línea del pedido como en preparación.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "EN_PREPARACION"
}
```

COCINA marca una línea del pedido como lista.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "LISTO"
}
```

CAMARERO marca una línea del pedido como servida.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "SERVIDO"
}
```

COCINA intenta marcar una línea con un estado no permitido. Resultado esperado: `400 Bad Request`.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "MAL"
}
```

CAMARERO cierra un pedido.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/close
```

El stock no se restaura al cerrar el pedido.

ADMIN o CAMARERO cancela un pedido.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/cancel
```

El stock se restaura al cancelar el pedido. Para probar cancelación, usar un pedido distinto al que se haya cerrado.

CAMARERO intenta añadir un producto sin stock diario configurado. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 2,
  "cantidad": 2,
  "observaciones": "Sin stock configurado"
}
```

CAMARERO intenta añadir más cantidad que el stock disponible. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 1,
  "cantidad": 999,
  "observaciones": "Más cantidad que stock disponible"
}
```

ADMIN intenta abrir un pedido. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/orders
```

```json
{
  "mesaId": 1
}
```

COCINA intenta añadir productos a un pedido. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 1,
  "cantidad": 1
}
```

---

## Flujo recomendado

1. Login como ADMIN.
2. Consultar productos y mesas.
3. Crear stock diario para `productId` y `fecha`.
4. Login como CAMARERO.
5. Crear pedido y guardar `orderId`.
6. Añadir producto al pedido y guardar `detailId`.
7. Comprobar que el stock baja.
8. Enviar pedido a cocina.
9. Login como COCINA.
10. Marcar la línea como `EN_PREPARACION`.
11. Marcar la línea como `LISTO`.
12. Login como CAMARERO.
13. Marcar la línea como `SERVIDO`.
14. Cerrar el pedido.
15. Comprobar que la mesa vuelve a `LIBRE`.

Para probar cancelación, crear otro pedido distinto, añadir producto y cancelar. El stock debe restaurarse.

---

## Notes

No asumir que los ids son `1`. Usar siempre los ids reales devueltos por la API.

Cambiar `{{productId}}`, `{{tableId}}`, `{{orderId}}`, `{{detailId}}` y `{{fecha}}` por valores reales o variables de Postman.

`401 Unauthorized` significa que falta token o el token no es válido.

`403 Forbidden` significa que el usuario tiene token válido, pero no tiene permisos.

`400 Bad Request` significa que el cuerpo de la petición no cumple las validaciones del DTO o las reglas del servicio.
