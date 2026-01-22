# KORE ERP - Backend

Backend completo para el sistema ERP KORE construido con NestJS, TypeORM y PostgreSQL.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ CRUD completo para todas las entidades
- ✅ Gestión de inventario con control de stock
- ✅ Sistema de ventas con transacciones
- ✅ Dashboard con estadísticas y KPIs
- ✅ Búsqueda y filtrado avanzado
- ✅ Validación de datos con class-validator
- ✅ Documentación API con Swagger
- ✅ CORS configurado para frontend

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 15+
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=kore_erp
JWT_SECRET=tu-secret-key-seguro
```

3. Crear la base de datos:
```sql
CREATE DATABASE kore_erp;
```

4. Ejecutar el servidor:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez que el servidor esté corriendo, accede a:
- Swagger UI: http://localhost:3000/api

## 🏗️ Estructura del Proyecto

```
src/
├── auth/              # Módulo de autenticación
├── branches/          # Gestión de sucursales
├── categories/        # Gestión de categorías
├── customers/         # Gestión de clientes
├── suppliers/         # Gestión de proveedores
├── inventory/         # Gestión de inventario
├── sales/             # Gestión de ventas
├── dashboard/         # Dashboard y estadísticas
├── business-config/   # Configuración del negocio
├── entities/           # Entidades TypeORM
├── config/             # Configuraciones
└── main.ts             # Punto de entrada
```

## 🔐 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile` - Perfil del usuario

### Inventario
- `GET /inventory` - Listar productos
- `POST /inventory` - Crear producto
- `GET /inventory/low-stock` - Productos con stock bajo

### Ventas
- `GET /sales` - Listar ventas
- `POST /sales` - Crear venta (con transacción)

### Dashboard
- `GET /dashboard/stats` - Estadísticas generales
- `GET /dashboard/sales-by-day` - Ventas por día
- `GET /dashboard/top-products` - Productos más vendidos

## 🛠️ Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **class-validator** - Validación de DTOs

## 📝 Notas

- El backend está configurado para desarrollo local
- TypeORM sincroniza automáticamente el esquema en desarrollo
- En producción, desactivar `synchronize` y usar migraciones
- Cambiar `JWT_SECRET` en producción por una clave segura
