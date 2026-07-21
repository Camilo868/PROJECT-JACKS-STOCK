# Jacks Stocks — Frontend

SPA en HTML, CSS y JavaScript vanilla (ES Modules), sin framework y sin build. Consume la API REST del backend (`PROJECT-JACKS-STOCK-BACKEND`) para todo lo que no sea preferencias puramente locales.

No hay `package.json` en este proyecto: no hay dependencias de npm, ni bundler, ni transpilador. Bootstrap 5 y Bootstrap Icons se cargan directo desde CDN en `index.html`.

## Stack

| Tecnología | Dónde se usa |
|---|---|
| JavaScript (ES Modules) | Todo `src/js/`, cargado con `<script type="module" src="src/js/main.js">` en `index.html` |
| Bootstrap 5 + Bootstrap Icons (CDN) | Estructura visual y iconografía de toda la interfaz |
| Fetch API | Único mecanismo de comunicación con el backend, centralizado en `src/js/services/api.js` |
| localStorage | Sesión del usuario (`session.js`) y preferencias locales (`settings.service.js`) |

## Cómo ejecutarlo

Al no tener build, hay que servirlo como sitio estático (abrir `index.html` con doble clic no funciona: los módulos ES no cargan sobre `file://`):

```bash
npx serve .
```

o la extensión Live Server de VS Code. Luego confirmar que `API_CONFIG.BASE_URL` en `src/js/services/api.js` apunte al backend real:

```js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:6543',
};
```

No hay modo de datos de prueba: si el backend no está corriendo, ninguna pantalla carga datos.

## Arquitectura

```
index.html
  └── src/js/main.js            registra rutas y arranca el router
        └── src/js/core/router.js    resuelve el hash actual contra las rutas registradas
              └── pages/*.page.js    cada página arma su HTML y pide datos a través de services/
                    └── services/*.service.js   traducen entre lo que la pantalla necesita y lo que expone el backend
                          └── services/api.js         fetch() real, agrega el token, desenvuelve la respuesta
```

No hay un framework de componentes (React, Vue, etc.). Cada `*.page.js` exporta una función `render*Page(container)` que:

1. Pide los datos a uno o más servicios.
2. Genera el HTML con template strings y lo asigna a `container.innerHTML`.
3. Vuelve a buscar los elementos con `querySelector` y les agrega los `addEventListener` necesarios.

## Flujo de navegación

`core/router.js` implementa un router propio basado en el hash de la URL (`#/ruta`). No usa ninguna librería de routing.

- `addRoute(path, handler, { private })` registra una ruta. Los `:parámetro` se resuelven comparando segmentos.
- Al cambiar el hash (`hashchange`) o al cargar la página (`DOMContentLoaded`), `resolveRoute()` busca la ruta que coincide y llama a su `handler(container, params)`.
- Si la ruta es `private: true` y `isAuthenticated()` (definida en `session.js`) devuelve `false`, redirige a `/login` sin llamar al handler.
- Si ninguna ruta coincide, se usa el handler registrado con `setNotFound()`.

Rutas registradas en `main.js`:

| Ruta | Página | Privada |
|---|---|---|
| `/` | Redirige a `/dashboard` o `/login` según `isAuthenticated()` | — |
| `/login` | `login.page.js` | No |
| `/register` | `register.page.js` | No |
| `/dashboard` | `dashboard.page.js` | Sí |
| `/products` | `products.page.js` | Sí |
| `/suppliers` | `suppliers.page.js` | Sí |
| `/warehouses` | `warehouses.page.js` | Sí |
| `/movements` | `movements.page.js` | Sí |
| `/semaphore` | `semaphore.page.js` | Sí |
| `/purchases` | `purchases.page.js` | Sí |
| `/reports` | `reports.page.js` | Sí |
| `/settings` | `settings.page.js` | Sí |

## Consumo de la API

Todo pasa por `src/js/services/api.js`. Expone `api.get/post/put/patch/delete(endpoint, body)`, que internamente llaman a `request(method, endpoint, body)`:

```
request(method, endpoint, body)
    |
    v
arma headers: Content-Type + Authorization (si hay token en sesión)
    |
    v
fetch(BASE_URL + endpoint)
    |
    v
¿fetch tiró error de red? --sí--> ApiError('Could not connect to the server...')
    |
    no
    v
¿status 401 Y había token Y no es /users/login ni /users/register?
    |            |
   sí            no
    |            |
    v            v
clearSession()   sigue
navigateTo('/login')
throw 'Session expired...'
    |
    v
¿response.ok? --no--> throw ApiError(payload.message)
    |
   sí
    v
devuelve payload.data (desenvuelve el { success, message, data } del backend)
```

El punto importante de ese `if`: un 401 al hacer login con credenciales incorrectas **no** dispara el cierre de sesión — eso solo pasa si ya había un token guardado y el backend lo rechaza en una ruta distinta a login/registro.

Cada archivo en `src/js/services/` (`product.service.js`, `supplier.service.js`, `warehouse.service.js`, `movement.service.js`, `purchase.service.js`, `category.service.js`) traduce entre la forma que usa el backend (columnas en `snake_case`, tablas separadas para inventario y categorías) y la forma que consumen las páginas. Por ejemplo, `product.service.js` combina tres llamadas (`/products`, `/categories`, `/inventory`) para armar un objeto de producto con el nombre de la categoría ya resuelto y el stock total sumado entre bodegas.

`settings.service.js` es la única excepción: no llama a la API, guarda y lee directo de `localStorage` bajo la clave `stockwise_settings`.

## Manejo de autenticación y token

- `core/session.js` guarda `{ token, user }` completo bajo la clave `stockwise_session` en `localStorage`. No hay cookies ni manejo de expiración del lado del cliente.
- `isAuthenticated()` solo verifica que exista algo guardado bajo esa clave — no valida el token en sí (el backend tampoco lo hace, ver el README del backend).
- `api.js` agrega `Authorization: Bearer <token>` en cada request si hay sesión activa.
- `logout()` (en `auth.service.js`) llama a `clearSession()`, que borra la clave de `localStorage`.
- Login y registro llaman a `POST /users/login` y `POST /users/register` respectivamente (`auth.service.js`), guardan la respuesta completa con `setSession()` y devuelven `data.user` a la página que los llamó.

## Componentes

Todos en `src/js/components/`, sin estado propio — reciben datos por parámetro y devuelven HTML o manipulan el DOM directo:

| Componente | Qué hace |
|---|---|
| `layout.js` | Arma el shell de las páginas privadas: sidebar + navbar + contenedor de contenido. Conecta el botón de logout y el toggle del sidebar en mobile |
| `sidebar.js` | Menú de navegación, marca el link activo según la ruta actual |
| `navbar.js` | Barra superior con el nombre/iniciales del usuario logueado (leído de `getCurrentUser()`) |
| `form-modal.js` | Genera un modal de Bootstrap a partir de un arreglo de campos declarativo (`{ name, label, type, required, options, ... }`). Soporta `text`, `number`, `email`, `password`, `select`, `textarea`, `date`. Lo usan todas las pantallas de CRUD |
| `confirm-dialog.js` | Modal de confirmación que devuelve una Promise resuelta en `true`/`false`, usado antes de cada borrado |
| `toast.js` | Notificaciones flotantes de éxito/error, inyectadas en el `#toast-container` de `index.html` |
| `badges.js` | Renderiza los badges de clase ABC y de semáforo (colores según el estado) |

## Formularios y CRUD

Cada página de catálogo (`products`, `suppliers`, `warehouses`) sigue el mismo patrón:

1. `loadData()` trae los datos del/los servicio(s) correspondiente(s) y los guarda en una variable de módulo.
2. `paint(content)` genera la tabla/lista completa con template strings.
3. Los botones "editar"/"eliminar" llevan `data-id="${item.id}"`; el listener busca el registro comparando `String(item.id) === String(btn.dataset.id)` (los IDs vienen de PostgreSQL como número, y `dataset.id` siempre es string — de ahí la conversión explícita).
4. `openXModal()` llama a `openFormModal()` con la lista de campos y un `onSubmit` que valida con `validateForm()` (`utils/validators.js`) y llama al service correspondiente (`create`/`update`).
5. Después de guardar, se vuelve a llamar `loadData()` + `paint()` para refrescar la vista completa (no hay actualización incremental del DOM).

El caso más largo es `products.page.js`: el formulario de producto no solo escribe en la tabla `products`, también resuelve la bodega/stock inicial contra `inventory` (`ProductService.create/update` hacen esa segunda llamada internamente).

`purchases.page.js` es el único que arma su propio modal a mano (no usa `form-modal.js`), porque necesita filas dinámicas para agregar varios productos a una misma orden de compra, con un total que se recalcula en cada cambio.

## Validaciones

`utils/validators.js` expone reglas reutilizables (`required`, `email`, `minLength`, `positiveNumber`, `nonNegativeNumber`, `integer`, `match`) y `validateForm(data, schema)`, que corre cada regla y devuelve `{ valid, errors }`. No hay ninguna librería de validación externa — son funciones puras escritas a mano.

## Manejo de errores

- Errores de red o de respuesta no-2xx: `api.js` los envuelve en una `ApiError` con `message` y `status`.
- Cada `onSubmit` de un formulario está dentro de un `try/catch` que muestra el error con `showError()` (toast rojo) sin cerrar el modal, para que el usuario pueda corregir y reintentar.
- Errores de validación de campos (antes de llamar a la API) se muestran agregando la clase `is-invalid` de Bootstrap y el texto en `.invalid-feedback`.

## Reglas de negocio calculadas en el frontend

Viven en `utils/inventory-calc.js`, sin dependencias externas:

- `calculateEOQ(product)` — EOQ = √(2·D·S / H), con `H = product.holdingCost` (un número que pone directo el administrador desde Configuración, no un porcentaje del costo unitario).
- `calculateROP(product, leadTimeDays)` — demanda diaria × lead time del producto + stock de seguridad.
- `classifyABC(products)` — clasificación A/B/C por regla de Pareto sobre `unitCost * annualDemand`.
- `getSemaphoreStatus(product, rop)` — rojo si el stock está en cero o por debajo del 60% del ROP, amarillo si está por debajo del ROP, verde en cualquier otro caso.

## Variables necesarias

No hay archivo `.env` en el frontend. La única configuración es `API_CONFIG.BASE_URL` dentro de `src/js/services/api.js`, que hay que editar a mano según dónde corra el backend.

## Posibles mejoras

- Reemplazar las comparaciones manuales `String(a) === String(b)` para IDs por una normalización única al leer los datos del backend.
- Agregar un manejo de expiración de sesión real del lado del cliente (hoy `isAuthenticated()` solo revisa que exista algo guardado, no si el token sigue siendo válido).
- Extraer `purchases.page.js` a componentes más chicos — es el archivo más largo del proyecto y mezcla la tabla principal, el modal y la lógica de recepción de orden en el mismo archivo.
