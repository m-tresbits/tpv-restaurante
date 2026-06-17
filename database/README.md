# Base de datos

Esta carpeta contiene los scripts SQL utilizados para definir la estructura inicial y los datos base de la aplicación TPV para la gestión de un restaurante.

La base de datos utilizada en el proyecto es PostgreSQL, alojada en Supabase como servicio gestionado.

## Archivos

- `schema.sql`: define las tablas, relaciones y restricciones principales de la base de datos.
- `seed.sql`: inserta los datos iniciales necesarios para arrancar la aplicación.

## Modelo inicial

El modelo de datos se compone de las siguientes entidades principales:

- `roles`: almacena los perfiles de usuario del sistema.
- `usuarios`: almacena los usuarios que acceden al TPV.
- `categorias`: agrupa los productos de la carta.
- `productos`: representa los platos o productos disponibles.
- `mesas`: representa las mesas del restaurante.
- `pedidos`: almacena la cabecera de cada pedido.
- `detalle_pedido`: almacena las líneas concretas de cada pedido.
- `stock`: controla el stock actual de cada producto, sin dependencia de fecha.

## Usuarios iniciales

El sistema se inicializa con tres roles base:

- `ADMIN`
- `CAMARERO`
- `COCINA`

También se crean usuarios iniciales asociados a estos roles para poder probar el flujo básico de autenticación y acceso por perfil.

Posteriormente, la gestión de usuarios deberá realizarse desde la propia aplicación, permitiendo que el usuario administrador cree nuevos usuarios, especialmente camareros.

## Seguridad de PIN

Los usuarios no almacenan el PIN en texto plano.

En su lugar, el PIN se transforma previamente mediante Argon2 y se almacena en la columna `pin_hash`.

Durante el inicio de sesión, el backend deberá comparar el PIN introducido con el hash almacenado mediante verificación criptográfica, evitando exponer la credencial real en la base de datos.

## Generación de hashes

Los hashes de los PIN iniciales se generan mediante el script auxiliar del backend:

```powershell
npm run hash:pins -- <pin1> <pin2> <pin3>
```
