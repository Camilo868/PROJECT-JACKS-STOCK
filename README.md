# StockWise — Frontend

Frontend del Proyecto Integrador **CodeUp RIWI: Beyond Limits**.
Sistema de gestión de inventario para pymes que calcula automáticamente
**EOQ** (cantidad económica de pedido), **clasificación ABC** y
**punto de reorden (ROP)** con semáforo de criticidad.

Este repositorio contiene **únicamente el Frontend**. El Backend
(Express.js) es responsabilidad de otro integrante del equipo y se
integrará consumiendo la misma capa de servicios (`src/js/services`).

## Stack

- HTML5 + CSS3
- Bootstrap 5 + Bootstrap Icons
- JavaScript Vanilla (ES Modules) — sin frameworks
- SPA con router basado en hash (`#/ruta`)

## Cómo ejecutar

No requiere build ni instalación de dependencias. Debe servirse como
sitio estático (los ES Modules no funcionan con `file://`):

```bash
# Con Python
python3 -m http.server 5500

# O con la extensión "Live Server" de VS Code
```

Luego abre `http://localhost:5500`.

## Modo mock (sin backend)

Por defecto, `src/js/services/api.js` tiene `MOCK_MODE: true`: todas las
peticiones se resuelven contra `localStorage`, simulando una API REST,
con datos de ejemplo precargados (usuario, proveedores, bodegas,
productos y movimientos).

**Cuenta demo:** `admin@stockwise.com` / `admin123`

## Conectar el backend Express real

En `src/js/services/api.js`:

```js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // ajustar a la URL del backend
  MOCK_MODE: false,                      // desactivar el modo mock
};
```

Ningún servicio ni página necesita cambios: todos consumen `api.js`,
que ya envía el token de sesión (`Authorization: Bearer`) y maneja
errores 401 redirigiendo a `/login`.

El backend Express debe exponer estos endpoints:

| Recurso     | Endpoints                                                        |
|-------------|-------------------------------------------------------------------|
| Auth        | `POST /auth/login`, `POST /auth/register`                        |
| Productos   | `GET/POST /products`, `GET/PUT/DELETE /products/:id`             |
| Proveedores | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id`           |
| Bodegas     | `GET/POST /warehouses`, `GET/PUT/DELETE /warehouses/:id`         |
| Movimientos | `GET /movements?productId=`, `POST /movements`                   |
| Compras     | `GET/POST /purchases`, `GET/PUT/DELETE /purchases/:id`           |

## Estructura del proyecto

```
src/
  assets/
    css/main.css        # Design tokens y estilos del sistema
    img/
  js/
    core/
      router.js          # Router hash con rutas privadas y 404
      session.js          # Persistencia de sesión (localStorage)
      mock-db.js           # Backend simulado (solo modo MOCK)
    components/
      layout.js            # Shell: sidebar + navbar + contenido
      sidebar.js
      navbar.js
      form-modal.js         # Modal de formulario reutilizable (CRUD)
      confirm-dialog.js       # Modal de confirmación
      toast.js                # Notificaciones
      badges.js                # Badges ABC / semáforo
    services/
      api.js                    # Cliente HTTP central (mock/real)
      auth.service.js
      product.service.js
      supplier.service.js
      warehouse.service.js
      movement.service.js
      purchase.service.js
      settings.service.js
    utils/
      inventory-calc.js          # Lógica de negocio: EOQ, ROP, ABC
      validators.js
      format.js
    pages/
      login.page.js / register.page.js
      dashboard.page.js
      products.page.js / suppliers.page.js / warehouses.page.js
      movements.page.js / semaphore.page.js / purchases.page.js
      reports.page.js / settings.page.js
      notfound.page.js
    main.js                      # Registro de rutas y arranque
index.html
```

## Lógica de negocio implementada

- **EOQ** = √(2·D·S / H) — `utils/inventory-calc.js`
- **ROP** = demanda diaria × lead time del proveedor + stock de seguridad
- **Clasificación ABC** por regla de Pareto sobre el valor de consumo anual
  (A = 80% del valor, B = siguiente 15%, C = 5% restante)
- **Semáforo de criticidad**: rojo (comprar ya), amarillo (vigilar), verde
  (saludable), según stock actual frente al ROP
- Registrar una **entrada/salida** actualiza el stock del producto
- Marcar una **orden de compra como recibida** genera automáticamente los
  movimientos de entrada correspondientes

## Roadmap (fuera de alcance del MVP)

- Exportar reportes a PDF/Excel (v2)
- Sugerencia automática de orden de compra (v2)
