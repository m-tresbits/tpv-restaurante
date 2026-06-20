# API Tests

Pruebas rapidas para comprobar el backend en Postman.

Usar `Authorization > Bearer Token` en todas las rutas protegidas.

Variables recomendadas:

```text
baseUrl = http://localhost:3000
productId = id real de un producto
tableId = id real de una mesa libre
orderId = id devuelto por POST /orders
detailId = id devuelto al anadir un producto al pedido
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

## Health

Comprobar estado del backend.

```http
GET {{baseUrl}}/health
```

---

## Roles y usuarios

ADMIN obtiene los roles disponibles.

```http
GET {{baseUrl}}/roles
```

ADMIN obtiene los usuarios iniciales registrados.

```http
GET {{baseUrl}}/users
```

---

## Categories

ADMIN obtiene todas las categorias.

```http
GET {{baseUrl}}/categories
```

ADMIN o CAMARERO obtiene categorias activas.

```http
GET {{baseUrl}}/categories/active
```

ADMIN crea una categoria.

```http
POST {{baseUrl}}/categories
```

```json
{
  "nombre": "Postres"
}
```

ADMIN edita una categoria.

```http
PATCH {{baseUrl}}/categories/6
```

```json
{
  "nombre": "Postres caseros"
}
```

ADMIN desactiva una categoria.

```http
PATCH {{baseUrl}}/categories/6/deactivate
```

ADMIN activa una categoria.

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
  "descripcion": "Hamburguesa clasica con queso"
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

ADMIN, CAMARERO o COCINA obtiene el stock actual.

```http
GET {{baseUrl}}/stock
```

ADMIN actualiza el stock actual de un producto.

```http
PATCH {{baseUrl}}/stock/{{productId}}
```

```json
{
  "cantidad": 20
}
```

---

## Orders

Antes de anadir productos, debe existir stock configurado para el producto.

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

CAMARERO anade un producto al pedido.

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

Guardar el `id` de la linea anadida como `detailId`.

Comprobar que el stock ha bajado.

```http
GET {{baseUrl}}/stock
```

CAMARERO modifica la cantidad de una linea de pedido abierto.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/quantity
```

```json
{
  "cantidad": 3
}
```

CAMARERO elimina una linea de pedido abierto.

```http
DELETE {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}
```

CAMARERO envia el pedido a cocina.

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

COCINA marca una linea en preparacion.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "EN_PREPARACION"
}
```

COCINA marca una linea como lista.

```http
PATCH {{baseUrl}}/orders/{{orderId}}/items/{{detailId}}/status
```

```json
{
  "estado": "LISTO"
}
```

CAMARERO marca una linea como servida.

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

Al cancelar un pedido, el stock se restaura. Para probar cancelacion, usar un pedido distinto al cerrado.

---

## Negative tests

CAMARERO intenta crear una categoria. Resultado esperado: `403 Forbidden`.

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
  "descripcion": "No deberia crearse",
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

CAMARERO intenta actualizar stock. Resultado esperado: `403 Forbidden`.

```http
PATCH {{baseUrl}}/stock/{{productId}}
```

```json
{
  "cantidad": 20
}
```

ADMIN intenta actualizar stock con cantidad negativa. Resultado esperado: `400 Bad Request`.

```http
PATCH {{baseUrl}}/stock/{{productId}}
```

```json
{
  "cantidad": -1
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

COCINA intenta anadir productos a un pedido. Resultado esperado: `403 Forbidden`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": {{productId}},
  "cantidad": 1
}
```

CAMARERO intenta anadir un producto sin stock configurado. Resultado esperado: `400 Bad Request`.

```http
POST {{baseUrl}}/orders/{{orderId}}/items
```

```json
{
  "productoId": 999,
  "cantidad": 1,
  "observaciones": "Sin stock configurado"
}
```

CAMARERO intenta anadir mas cantidad que el stock disponible. Resultado esperado: `400 Bad Request`.

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
3. Actualizar stock actual de `productId` si es necesario.
4. Login CAMARERO.
5. Crear pedido y guardar `orderId`.
6. Anadir producto y guardar `detailId`.
7. Comprobar que el stock baja.
8. Enviar pedido a cocina.
9. Login COCINA.
10. Marcar linea como `EN_PREPARACION`.
11. Marcar linea como `LISTO`.
12. Login CAMARERO.
13. Marcar linea como `SERVIDO`.
14. Cerrar pedido.
15. Comprobar que la mesa queda `LIBRE`.

Para probar cancelacion, crear otro pedido, anadir producto y cancelar. El stock debe restaurarse.

---

## Notes

No asumir ids fijos. Usar siempre los ids reales devueltos por la API.

`401 Unauthorized`: falta token o el token no es valido.

`403 Forbidden`: el usuario tiene token valido, pero no tiene permisos.

`400 Bad Request`: la peticion no cumple validaciones o reglas de negocio.
