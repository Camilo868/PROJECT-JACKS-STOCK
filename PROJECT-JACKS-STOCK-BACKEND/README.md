# Jacks Stocks — Backend

API REST construida con Express 5 sobre PostgreSQL (Supabase). Expone operaciones CRUD para productos, categorías, proveedores, bodegas, inventario, movimientos, compras y detalle de compras, además de login/registro de usuarios y tres endpoints de reportes calculados directamente en SQL.

No hay capa de servicios como tal más allá de `src/services/users.service.js`, que actualmente solo importa `bcrypt` y define una constante (`saltRounds`) sin usarla en ningún lado — el hashing real ocurre directo en `users.controller.js`. Toda la lógica vive en los controllers, que hablan directo con el pool de `pg`.

## Qué resuelve

El sistema calcula EOQ (cantidad económica de pedido), clasificación ABC y punto de reorden (ROP) para inventario. Ese cálculo específico de negocio vive del lado del frontend (`inventory-calc.js`), pero este backend expone una versión equivalente calculada en SQL puro a través de `/reports/eoq`, usando la misma fórmula que trae el script `BDT + queries.sql`.

## Stack

| Dependencia | Versión (package.json) | Para qué se usa acá |
|---|---|---|
| express | ^5.2.1 | Enrutamiento HTTP. Un router por recurso, montado todo en `server.js` sin ningún prefijo común (no hay `/api`, cada recurso vive en la raíz: `/products`, `/warehouses`, etc.) |
| pg | ^8.22.0 | Cliente de PostgreSQL. Se usa un único `Pool` (`config/db.js`) compartido por todos los controllers, con `ssl: { rejectUnauthorized: false }` porque la conexión es contra Supabase |
| bcrypt | ^6.0.0 | Hashea la contraseña antes de guardarla (`bcrypt.hash(data.password, 10)`) y la compara en el login (`bcrypt.compare`). Nunca se guarda ni se compara texto plano |
| jsonwebtoken | ^9.0.3 | Genera el token que se devuelve en login/registro (`signToken` en `src/utils/jwt.js`). Ver la sección de Autenticación más abajo — el token se genera pero **no se valida en ningún endpoint** |
| cors | ^2.8.6 | Un solo `app.use(cors())` en `server.js`, sin restricciones de origen, para que el frontend (que corre en otro puerto) pueda llamar a la API |
| morgan | ^1.11.0 | Log de cada request en consola, modo `'dev'` |

No hay `dotenv` como dependencia: las variables de entorno se cargan con la flag nativa de Node `--env-file`, definida directo en los scripts de `package.json`.

## Configuración

### Variables de entorno (`config/.env`)

| Variable | Uso | Obligatoria |
|---|---|---|
| `DB_USER` | Usuario de PostgreSQL | Sí |
| `DB_HOST` | Host de la base de datos | Sí |
| `DB_PASSWORD` | Contraseña de la base de datos | Sí |
| `DB_DATABASE` | Nombre de la base de datos | Sí |
| `DB_PORT` | Puerto de PostgreSQL | Sí |
| `PORT` | Puerto donde escucha el servidor Express | No — si no está, `config/config.js` usa `6543` por defecto |
| `JWT_SECRET` | Clave para firmar los tokens | No — si no está, `src/utils/jwt.js` usa el literal `'dev-secret-change-me'`. En producción esto hay que setearlo explícito |

`config/db.js` lee `DB_USER`, `DB_HOST`, `DB_PASSWORD`, `DB_DATABASE` y `DB_PORT` directo de `process.env` (no pasan por `config.js`). Al arrancar, hace un `SELECT NOW()` de prueba y loguea `✅ Conectado a Supabase` si la conexión funciona.

### Scripts disponibles

```bash
npm run dev     # node --env-file ./config/.env --watch ./src/server.js
npm start       # node --env-file ./config/.env ./src/server.js
```

La única diferencia entre los dos es `--watch` (reinicia el proceso cuando cambia un archivo). Ambos cargan el mismo `.env`.

### Arrancar el servidor

```bash
npm install
npm run dev
```

Salida esperada en consola:

```
✅ Conectado a Supabase
Jacks Stocks API listening on port: 6543
```

## Estructura de carpetas

```
config/
  .env          Variables de entorno (no versionado)
  config.js     Exporta PORT
  db.js         Pool de conexión a PostgreSQL (pg)
migrations.sql  Cambios sobre el esquema original (ver sección de abajo)
src/
  controllers/  Un archivo por recurso, con las funciones que atienden cada endpoint
  routes/       Un archivo por recurso, define los path y conecta cada uno a su controller
  services/     Solo tiene users.service.js, que no se usa (ver arriba)
  utils/
    jwt.js        signToken / verifyToken
    response.js   ok / created / fail / notFound — el sobre de respuesta estándar
  server.js     Arma la app de Express, monta los routers y arranca el servidor
```

### Explicación de cada carpeta

**`config/`** — todo lo que necesita el proceso para levantar: credenciales de base de datos y el puerto. `db.js` es el único punto donde se crea el `Pool` de `pg`; todos los controllers lo importan desde ahí (`import { pool } from '../../config/db.js'`).

**`src/controllers/`** — cada función hace la consulta SQL directo con `pool.query()`, usando parámetros posicionales (`$1`, `$2`, ...) para evitar inyección SQL. El patrón se repite en los 9 archivos: `try { ... } catch (error) { console.log(error); return fail(res); }`.

**`src/routes/`** — cada archivo exporta un `Router` de Express con los path de ese recurso. Se importan todos en `server.js` y se montan con `app.use(router)` (sin prefijo).

**`src/utils/response.js`** — cuatro funciones (`ok`, `created`, `fail`, `notFound`) que arman siempre la misma forma de respuesta: `{ success, message, data }`. Todas las respuestas de la API pasan por acá.

**`src/utils/jwt.js`** — `signToken(user)` firma un JWT con `{ id, email }` y expira en 7 días (`EXPIRES_IN = '7d'`). `verifyToken(token)` está definida pero no se llama desde ningún controller ni middleware.

## API REST

Todas las respuestas tienen esta forma:

```json
{ "success": true, "message": "Data obtained successfully", "data": [...] }
```

En error, `success` es `false` y `data` normalmente es `null`.

| Método | Endpoint | Controller |
|---|---|---|
| POST | `/users/login` | `login` |
| POST | `/users/register` | `createUser` |
| POST | `/users` | `createUser` (mismo controller que `/register`) |
| GET | `/users` | `getUsers` |
| GET | `/users/:id` | `getUser` |
| GET | `/users/search/:name` | `getUserByName` |
| PUT | `/users/:id` | `updateUser` |
| DELETE | `/users/:id` | `deleteUser` |
| GET | `/categories` | `getCategories` |
| GET | `/categories/:id` | `getCategory` |
| GET | `/categories/search/:name` | `getCategoryByName` |
| POST | `/categories` | `createCategory` |
| PUT | `/categories/:id` | `updateCategory` |
| DELETE | `/categories/:id` | `deleteCategory` |
| GET | `/suppliers` | `getSuppliers` |
| GET | `/suppliers/:id` | `getSupplier` |
| GET | `/suppliers/search/:company_name` | `getSupplierByCompanyName` |
| POST | `/suppliers` | `createSupplier` |
| PUT | `/suppliers/:id` | `updateSupplier` |
| DELETE | `/suppliers/:id` | `deleteSupplier` |
| GET | `/warehouses` | `getWarehouses` |
| GET | `/warehouses/capacity` | `getWarehouseCapacity` |
| GET | `/warehouses/:id` | `getWarehouse` |
| GET | `/warehouses/search/:name` | `getWarehouseByName` |
| POST | `/warehouses` | `createWarehouse` |
| PUT | `/warehouses/:id` | `updateWarehouse` |
| DELETE | `/warehouses/:id` | `deleteWarehouse` |
| GET | `/products` | `getProducts` |
| GET | `/products/:id` | `getProduct` |
| GET | `/products/search/:name` | `getProductByName` |
| POST | `/products` | `createProduct` |
| PUT | `/products/:id` | `updateProduct` |
| DELETE | `/products/:id` | `deleteProduct` |
| GET | `/inventory` | `getInventories` |
| GET | `/inventory/:id` | `getInventory` |
| GET | `/inventory/product/:product_id` | `getInventoryByProductId` |
| POST | `/inventory` | `createInventory` |
| PUT | `/inventory/:id` | `updateInventory` |
| DELETE | `/inventory/:id` | `deleteInventory` |
| GET | `/movements` | `getMovements` |
| GET | `/movements/:id` | `getMovement` |
| GET | `/movements/product/:product_id` | `getMovementsByProductId` |
| POST | `/movements` | `createMovement` |
| PUT | `/movements/:id` | `updateMovement` |
| DELETE | `/movements/:id` | `deleteMovement` |
| GET | `/purchases` | `getPurchases` |
| GET | `/purchases/supplier/:supplier_id` | `getPurchasesBySupplierId` |
| GET | `/purchases/:id` | `getPurchase` |
| POST | `/purchases` | `createPurchase` |
| PUT | `/purchases/:id` | `updatePurchase` |
| PATCH | `/purchases/:id/status` | `updatePurchaseStatus` |
| DELETE | `/purchases/:id` | `deletePurchase` |
| GET | `/purchase-details` | `getPurchaseDetails` |
| GET | `/purchase-details/:id` | `getPurchaseDetail` |
| GET | `/purchase-details/purchase/:purchase_id` | `getDetailsByPurchaseId` |
| POST | `/purchase-details` | `createPurchaseDetail` |
| PUT | `/purchase-details/:id` | `updatePurchaseDetail` |
| DELETE | `/purchase-details/:id` | `deletePurchaseDetail` |
| GET | `/reports/eoq` | `getEoqReport` |
| GET | `/reports/movements-summary` | `getMovementsSummary` |
| GET | `/reports/stock-by-product` | `getStockByProduct` |

Nota sobre `/users`: tanto `POST /users` como `POST /users/register` apuntan al mismo controller (`createUser`). Es redundante, pero así está en `users.routes.js`.

## Autenticación

El flujo de login (`login`, en `users.controller.js`):

```
POST /users/login { email, password }
        |
        v
SELECT * FROM users WHERE email = $1
        |
        v
¿existe el usuario? --no--> 401 "Incorrect email or password"
        |
       sí
        v
bcrypt.compare(password, hash guardado)
        |
        v
¿coincide? --no--> 401 "Incorrect email or password"
        |
       sí
        v
signToken({ id, email }) + se quita el password de la respuesta
        |
        v
200 { token, user }
```

El registro (`POST /users/register` o `POST /users`) hace `bcrypt.hash(data.password, 10)` antes del `INSERT`, y también devuelve `{ token, user }` usando el mismo `signToken`.

**Sobre autorización**: el token se genera y se firma, pero ningún endpoint lo verifica. `verifyToken()` existe en `src/utils/jwt.js` y no se importa en ningún controller ni ruta — no hay middleware que revise el header `Authorization` antes de responder. En la práctica, cualquiera puede llamar a `GET /products`, `DELETE /warehouses/:id`, etc. sin mandar ningún token. Esto es lo primero que habría que resolver antes de exponer esta API fuera de un entorno de desarrollo.

## Manejo de errores

Todos los controllers siguen el mismo patrón: si algo falla en la consulta, cae al `catch`, se hace `console.log(error)` (para verlo en la terminal del servidor) y se responde con `fail(res)`, que por defecto es un 500 con el mensaje genérico `"Internal server error"`. Los casos esperados (no encontrado, credenciales incorrectas, email duplicado) se manejan explícitamente antes de eso:

- `notFound(res, 'X not found')` → 404
- `fail(res, 'Incorrect email or password', 401)` → 401 en login
- `fail(res, 'This email is already registered', 400)` → 400, cuando Postgres devuelve el código `23505` (violación de constraint único) al registrar un email repetido

## Reglas de borrado en cascada

El esquema original (`BDT + queries.sql`) define las foreign keys sin ninguna acción `ON DELETE`, lo que significa que Postgres rechaza el borrado de cualquier fila que todavía tenga referencias (por ejemplo, borrar un producto que ya tiene registros en `inventory` o `movements`). `migrations.sql` reemplaza esas constraints:

- Borrar un producto, bodega o compra arrastra (`CASCADE`) sus registros dependientes en `inventory`, `movements` y `purchase_details`.
- Borrar una categoría o un proveedor no borra los productos asociados: la referencia queda en `NULL` (`SET NULL`).
- Borrar un usuario no borra las bodegas que tenga asignadas como responsable: `warehouses.user_id` queda en `NULL`.

También agrega dos columnas que no estaban en el esquema original: `purchases.status` (`VARCHAR(20)`, default `'pending'`) y `movements.note` (`VARCHAR(255)`, opcional). Hay que correr este archivo una sola vez contra la base de datos antes de usar el sistema completo.

## Posibles mejoras

- Agregar un middleware que valide el JWT (`verifyToken` ya existe, pero no se usa) en las rutas que no sean login/registro.
- Quitar `src/services/users.service.js`, que no se usa desde ningún lado.
- Unificar `POST /users` y `POST /users/register`, que hoy hacen exactamente lo mismo.
- Mover las consultas SQL de los controllers a una capa de repositorio, para no repetir el manejo de `try/catch` en cada función.
