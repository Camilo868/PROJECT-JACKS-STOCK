# 📦 JACKS STOCKS — Backend

> API REST para un sistema de gestión de inventario con cálculo automático de **EOQ** (cantidad económica de pedido), **clasificación ABC** y **punto de reorden (ROP)**.

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

<!-- Logo del proyecto -->
<!-- ![Jacks Stocks](./docs/logo.png) -->

---

## 📖 Descripción del proyecto

**Jacks Stocks** es un sistema de gestión de inventario pensado para pequeñas y medianas empresas. Permite administrar productos, proveedores, bodegas, compras y movimientos de stock, y calcula automáticamente:

- **EOQ** — cuánto pedir en cada orden de compra para minimizar costos.
- **ROP** — en qué punto de stock se debe volver a pedir.
- **Clasificación ABC** — qué productos merecen más atención según su valor de consumo anual.

Este repositorio contiene únicamente el **backend**: una API REST construida con Express.js sobre PostgreSQL (Supabase). El frontend (HTML + CSS + JavaScript Vanilla) vive en un repositorio aparte y consume esta API por HTTP.

---

## ✨ Características principales

- CRUD completo para productos, categorías, proveedores, bodegas, inventario, movimientos, compras y detalle de compras.
- Autenticación con **bcrypt** (hash de contraseñas) y **JWT** (sesión).
- Respuestas HTTP estandarizadas en todos los endpoints.
- Endpoint de **espacio disponible por bodega**, calculado en SQL.
- Endpoints de **reportes** (EOQ/ROP, movimientos por tipo, stock por producto) calculados en SQL.
- Manejo de estado de órdenes de compra (`pendiente` / `recibida` / `cancelada`).

---

## 🏗️ Arquitectura del proyecto

El proyecto sigue una arquitectura **MVC simplificada**, organizada por recurso:

```
Request → Router → Controller → PostgreSQL (pool) → Response estándar
```

Cada recurso (productos, proveedores, bodegas, etc.) tiene su propio archivo de rutas y su propio controlador, siguiendo el mismo patrón CRUD.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| Express 5 | Framework HTTP / enrutamiento |
| PostgreSQL (Supabase) | Base de datos relacional |
| `pg` | Cliente de PostgreSQL para Node |
| `bcrypt` | Hash seguro de contraseñas |
| `jsonwebtoken` | Autenticación basada en tokens |
| `cors` | Permitir peticiones desde el frontend |
| `morgan` | Logging de peticiones HTTP |

---

## 📂 Estructura del proyecto

```
PROJECT-JACKS-STOCK-BACKEND/
├── config/
│   ├── .env                 # Variables de entorno (no versionado)
│   ├── config.js             # Config exportada (PORT)
│   └── db.js                  # Pool de conexión a PostgreSQL
├── migrations.sql              # Cambios pendientes sobre el esquema original
├── src/
│   ├── controllers/             # Lógica de cada endpoint
│   ├── routes/                    # Definición de rutas por recurso
│   ├── services/                   # Lógica reutilizable (ej. hashing)
│   ├── utils/
│   │   ├── jwt.js                    # Firmar/verificar tokens
│   │   └── response.js                # Envoltura estándar de respuestas
│   └── server.js                        # Punto de entrada
├── package.json
└── README.md
```

---

## 🚀 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <url-del-repositorio>
cd PROJECT-JACKS-STOCK-BACKEND
npm install
```

### 2. Variables de entorno

Crea `config/.env` con tus credenciales de PostgreSQL/Supabase:

```env
DB_USER=tu_usuario
DB_HOST=tu_host
DB_PASSWORD=tu_password
DB_DATABASE=tu_base_de_datos
DB_PORT=5432

PORT=6543
JWT_SECRET=una_cadena_larga_y_aleatoria
```

### 3. Configurar PostgreSQL

Ejecuta el script `BDT + queries.sql` (crea las tablas y datos de ejemplo) y luego `migrations.sql` (agrega la columna `status` a `purchases`, necesaria para el flujo de compras del frontend).

### 4. Inicializar el servidor

```bash
npm run dev     # con recarga automática
# o
npm start
```

Deberías ver en consola:

```
✅ Conectado a Supabase
Jacks Stocks API listening on port: 6543
```

### 5. Ejecutar el frontend

El frontend es un sitio estático (sin build). Sírvelo con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

Y asegúrate de que `API_CONFIG.BASE_URL` en `src/js/services/api.js` apunte a `http://localhost:6543` con `MOCK_MODE: false`.

---

## 🔌 Endpoints disponibles

Todas las respuestas siguen el formato:

```json
{ "success": true, "message": "Data obtained successfully", "data": [...] }
```

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/users/login` | Iniciar sesión (devuelve `token` + `user`) |
| POST | `/users/register` | Registrar usuario |
| GET | `/users` | Listar usuarios |
| GET/PUT/DELETE | `/users/:id` | Obtener/actualizar/eliminar usuario |
| GET | `/categories` | Listar categorías |
| POST/GET/PUT/DELETE | `/categories(/:id)` | CRUD de categorías |
| GET | `/suppliers` | Listar proveedores |
| POST/GET/PUT/DELETE | `/suppliers(/:id)` | CRUD de proveedores |
| GET | `/warehouses` | Listar bodegas |
| GET | `/warehouses/capacity` | Espacio disponible por bodega (SQL) |
| POST/GET/PUT/DELETE | `/warehouses(/:id)` | CRUD de bodegas |
| GET | `/products` | Listar productos |
| POST/GET/PUT/DELETE | `/products(/:id)` | CRUD de productos |
| GET | `/inventory` | Listar inventario |
| GET | `/inventory/product/:product_id` | Stock de un producto por bodega |
| POST/PUT/DELETE | `/inventory(/:id)` | CRUD de inventario |
| GET | `/movements` | Listar movimientos |
| GET | `/movements/product/:product_id` | Historial de un producto |
| POST/PUT/DELETE | `/movements(/:id)` | CRUD de movimientos |
| GET | `/purchases` | Listar compras |
| GET | `/purchases/supplier/:supplier_id` | Compras de un proveedor |
| PATCH | `/purchases/:id/status` | Cambiar estado de una compra |
| POST/GET/PUT/DELETE | `/purchases(/:id)` | CRUD de compras |
| GET | `/purchase-details/purchase/:purchase_id` | Ítems de una compra |
| POST/GET/PUT/DELETE | `/purchase-details(/:id)` | CRUD de detalle de compras |
| GET | `/reports/eoq` | EOQ/ROP calculado en SQL |
| GET | `/reports/movements-summary` | Movimientos agrupados por tipo |
| GET | `/reports/stock-by-product` | Stock total por producto |

---

## 🔄 Flujo de funcionamiento

```
Frontend (fetch)
      ↓
   Router (Express)
      ↓
  Controller
      ↓
  PostgreSQL (pool)
      ↓
Respuesta estándar { success, message, data }
```

---

## 📸 Capturas

<!-- Espacio reservado para capturas de pantalla del sistema en funcionamiento -->

---

## 👥 Autores

Proyecto Integrador — CodeUp RIWI 2026.

## 📄 Licencia

ISC.
