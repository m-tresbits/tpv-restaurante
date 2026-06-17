# Sistema TPV para la gestión de un restaurante

Aplicación web TPV desarrollada como Trabajo de Fin de Grado Superior del ciclo Desarrollo de Aplicaciones Web (DAW).

El proyecto tiene como objetivo desarrollar un sistema de gestión para restaurantes que permita administrar pedidos, mesas, cocina, carta y stock actual mediante una arquitectura cliente-servidor.

## Tecnologías utilizadas

### Frontend

- Angular 21
- TypeScript
- SCSS
- Angular Router
- Standalone Components
- Signals

### Backend

- NestJS
- TypeScript
- API REST
- TypeORM
- Argon2 para generación de hashes de PIN
- PostgreSQL como base de datos

### Base de datos

- Supabase PostgreSQL
- Scripts SQL de estructura y datos iniciales en la carpeta `database`

## Arquitectura general

El sistema sigue una arquitectura cliente-servidor:

```text
Angular → API REST NestJS → Supabase PostgreSQL
