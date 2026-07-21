# Jacks Stocks

Sistema de gestión de inventario para pymes. Administra productos, proveedores, bodegas, compras y movimientos de stock, y calcula automáticamente EOQ (cantidad económica de pedido), clasificación ABC y punto de reorden (ROP) para decidir qué comprar y cuándo.

Repositorio único con dos carpetas independientes que se comunican por HTTP:

```
PROJECT-JACKS-STOCK/
├── PROJECT-JACKS-STOCK-BACKEND/   API REST (Express + PostgreSQL)
└── riwi-frontend/                  SPA (HTML + CSS + JavaScript vanilla)
```

Proyecto Integrador de CodeUp RIWI.

## Qué problema resuelve

Sin un sistema como este, decidir cuánto y cuándo comprar de cada producto se hace a ojo. Jacks Stocks toma los datos de demanda, costos y tiempos de entrega ya cargados en el sistema y calcula:

- **EOQ**: cuánto pedir en cada orden para minimizar el costo total (de ordenar + de almacenar).
- **ROP**: en qué nivel de stock hay que volver a pedir, según la demanda diaria y el lead time del proveedor.
- **Clasificación ABC**: qué productos concentran la mayor parte del valor de consumo anual (regla de Pareto), para priorizar la atención sobre esos.
- **Semáforo de compra**: una vista roja/amarilla/verde de qué se necesita comprar ya mismo.

## Arquitectura general

```
┌─────────────────────┐                              ┌──────────────────────┐                ┌──────────────┐
│  riwi-frontend        │                              │  PROJECT-JACKS-       │                │  PostgreSQL   │
│  (SPA, sin build)      │ ───── fetch() + JWT ───────▶ │  STOCK-BACKEND          │ ── pg.Pool ──▶ │  (Supabase)    │
│  hash router (#/ruta)   │ ◀──── { success, data } ──── │  Express + routers/       │                │                │
└─────────────────────┘                              │  controllers por recurso   │                └──────────────┘
                                                       └──────────────────────┘
```

El frontend no tiene lógica propia de persistencia: cada acción (crear un producto, registrar un movimiento, marcar una compra como recibida) termina en una llamada `fetch` contra el backend. El backend no tiene vistas ni renderiza HTML: solo responde JSON.

## Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Backend | Node.js, Express 5, `pg` (PostgreSQL), `bcrypt`, `jsonwebtoken`, `cors`, `morgan` |
| Frontend | HTML5, CSS3, JavaScript (ES Modules), Bootstrap 5 y Bootstrap Icons (vía CDN) |
| Base de datos | PostgreSQL (Supabase) |

El frontend no usa ningún framework (React, Vue, Angular) ni bundler (Webpack, Vite): son archivos `.js` con `import`/`export` nativos, cargados directo por el navegador.

## Funcionalidades principales

- CRUD de productos, categorías, proveedores, bodegas, inventario, movimientos y compras (con su detalle).
- Login y registro con contraseña hasheada (`bcrypt`) y token de sesión (`jsonwebtoken`).
- Stock llevado por bodega (un mismo producto puede tener existencias en varias bodegas a la vez), no un total único por producto.
- Espacio disponible por bodega, calculado en SQL (`GET /warehouses/capacity`).
- Órdenes de compra con estado (`pending` / `received` / `cancelled`); marcar una como recibida genera automáticamente los movimientos de entrada correspondientes.
- Reportes: distribución ABC, semáforo de criticidad, top de productos por valor de consumo, y un reporte de EOQ/ROP calculado enteramente en SQL.

## Flujo general del sistema

```
Usuario abre la app
      |
      v
¿hay sesión guardada en localStorage? --no--> pantalla de Login/Registro
      |                                              |
     sí                                    POST /users/login o /users/register
      |                                              |
      v                                              v
Dashboard (privado)                    guarda { token, user } en localStorage
      |
      v
Cada pantalla pide sus datos a un *.service.js
      |
      v
El service llama a api.js, que hace fetch() con el token en el header Authorization
      |
      v
El backend responde { success, message, data }
      |
      v
La pantalla vuelve a dibujar su contenido con los datos recibidos
```

## Requisitos

- Node.js (versión con soporte para `--env-file`, usada en los scripts del backend).
- Una base de datos PostgreSQL accesible (el proyecto está armado contra Supabase).
- Un servidor de archivos estáticos para el frontend (no corre directo desde `file://`).

## Instalación

```bash
git clone <url-del-repositorio>
cd PROJECT-JACKS-STOCK
```

### Backend

```bash
cd PROJECT-JACKS-STOCK-BACKEND
npm install
```

Crear `config/.env` con:

```env
DB_USER=postgres.zhwyvnxbanyoqcykgkjf
DB_PASSWORD="Project#12345*"
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
```

`PORT` y `JWT_SECRET` son opcionales — si faltan, el backend usa `6543` y un secreto de desarrollo (`dev-secret-change-me`) respectivamente, que no debería usarse fuera de desarrollo local.

### Frontend

No requiere instalación: es HTML/CSS/JS estático. Solo hay que confirmar que `riwi-frontend/src/js/services/api.js` apunte al backend:

```js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:6543',
};
```

## Ejecución

```bash
# Terminal 1 — backend
cd PROJECT-JACKS-STOCK-BACKEND
npm run dev

# Terminal 2 — frontend
cd riwi-frontend
npx serve .
```

El backend queda escuchando en el puerto configurado (por defecto `6543`) y loguea `✅ Conectado a Supabase` si la conexión a la base de datos funcionó. El frontend queda disponible en el puerto que asigne el servidor estático (por ejemplo `http://localhost:3000` con `serve`).

La primera vez, hay que crear una cuenta desde la pantalla de Registro — los usuarios de ejemplo que trae el script SQL tienen una contraseña de relleno, no un hash real, así que no van a poder iniciar sesión.

## Estructura de carpetas

```
PROJECT-JACKS-STOCK-BACKEND/
  config/          credenciales y conexión a PostgreSQL
  migrations.sql   cambios pendientes sobre el esquema original
  src/
    controllers/   lógica de cada endpoint (una consulta SQL por función)
    routes/        definición de rutas por recurso
    services/      (solo un archivo, sin uso actual)
    utils/         helpers de respuesta estándar y de JWT
    server.js      arranque del servidor Express

riwi-frontend/
  index.html
  src/
    assets/        CSS e imágenes
    js/
      core/        router propio y manejo de sesión
      components/  piezas de UI reutilizables (modal, sidebar, toasts, badges...)
      services/    un archivo por recurso, hablan con el backend vía api.js
      utils/       cálculos de EOQ/ROP/ABC, validadores de formularios, formateo
      pages/       una función render*Page() por pantalla
      main.js      registra las rutas y arranca la app
```

## Relación entre Frontend y Backend

El frontend no asume ninguna estructura de base de datos: cada `*.service.js` traduce entre la forma que usan las pantallas y la forma exacta de las tablas del backend (por ejemplo, el backend guarda `category_id` como número y el frontend resuelve el nombre de la categoría combinando `/products` con `/categories`). Si el backend cambia el nombre de una columna o de un endpoint, el único lugar que hay que tocar del lado del frontend es el service correspondiente — las páginas no le hablan a la API directamente.

La autenticación es la única pieza compartida de punta a punta: el backend firma un JWT en login/registro, el frontend lo guarda en `localStorage` y lo reenvía en cada request. El backend, sin embargo, no valida ese token en ningún endpoint todavía (ver el README del backend) — cualquier ruta puede llamarse sin sesión.

## Posibles mejoras futuras

- Middleware de autenticación real en el backend (el token se emite pero no se verifica en las rutas protegidas).
- Exportar reportes a PDF/Excel.
- Sugerencia automática de orden de compra a partir del ROP.
- Permisos diferenciados por rol (administrador vs. encargado de bodega).

## Autores

Proyecto Integrador — CodeUp RIWI.
