# API Tests

Pruebas rápidas para comprobar los endpoints del backend en Postman.

Usar `Authorization > Bearer Token` en todas las rutas protegidas.

---

## Auth

Login como administrador.

```http
POST http://localhost:3000/auth/login
```

```json
{
  "nombre": "Administrador",
  "pin": "1111"
}
```

Login como camarero.

```http
POST http://localhost:3000/auth/login
```

```json
{
  "nombre": "Camarero",
  "pin": "2222"
}
```

Login como cocina.

```http
POST http://localhost:3000/auth/login
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
GET http://localhost:3000/categories
```

ADMIN o CAMARERO obtiene solo categorías activas.

```http
GET http://localhost:3000/categories/active
```

ADMIN crea una categoría.

```http
POST http://localhost:3000/categories
```

```json
{
  "nombre": "Postres"
}
```

ADMIN edita una categoría.

```http
PATCH http://localhost:3000/categories/6
```

```json
{
  "nombre": "Postres caseros"
}
```

ADMIN desactiva una categoría.

```http
PATCH http://localhost:3000/categories/6/deactivate
```

ADMIN activa una categoría.

```http
PATCH http://localhost:3000/categories/6/activate
```

CAMARERO intenta crear una categoría. Resultado esperado: `403 Forbidden`.

```http
POST http://localhost:3000/categories
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
GET http://localhost:3000/products
```

ADMIN o CAMARERO obtiene solo productos disponibles.

```http
GET http://localhost:3000/products/available
```

ADMIN o CAMARERO obtiene un producto por id.

```http
GET http://localhost:3000/products/1
```

ADMIN crea un producto.

```http
POST http://localhost:3000/products
```

```json
{
  "nombre": "Burger",
  "descripcion": "Hamburguesa clásica",
  "precio": 9.5,
  "categoriaId": 1
}
```

ADMIN edita un producto.

```http
PATCH http://localhost:3000/products/1
```

```json
{
  "precio": 10.5,
  "descripcion": "Hamburguesa clásica con queso"
}
```

ADMIN desactiva un producto.

```http
PATCH http://localhost:3000/products/1/deactivate
```

ADMIN activa un producto.

```http
PATCH http://localhost:3000/products/1/activate
```

CAMARERO intenta obtener todos los productos. Resultado esperado: `403 Forbidden`.

```http
GET http://localhost:3000/products
```

CAMARERO intenta crear un producto. Resultado esperado: `403 Forbidden`.

```http
POST http://localhost:3000/products
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
PATCH http://localhost:3000/products/1
```

```json
{
  "precio": 1
}
```

---

## Notes

Cambiar los ids `1` y `6` por ids reales de la base de datos.

`401 Unauthorized` significa que falta token o el token no es válido.

`403 Forbidden` significa que el usuario tiene token válido, pero no tiene permisos.
