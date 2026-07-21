# JACKS STOCKS — Frontend

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

## Backend requerido

Esta app **necesita el backend Express corriendo** para funcionar — ya
no tiene un modo de datos de prueba integrado. Antes de usarla:

1. Levanta el backend (`npm run dev` en `PROJECT-JACKS-STOCK-BACKEND`,
   ver su propio README).
2. Confirma que `src/js/services/api.js` apunte a la URL correcta:

```js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:6543', // ajustar a la URL real del backend
};
```

3. Crea una cuenta desde la pantalla de **Registro** — los usuarios de
   ejemplo del script SQL tienen una contraseña de relleno (no un hash
   real), así que no van a poder iniciar sesión.

`api.js` envía el token de sesión (`Authorization: Bearer`), desenvuelve
la respuesta `{ success, message, data }` del backend, y maneja
errores 401 redirigiendo a `/login`.

El backend Express expone estos endpoints:

| Recurso     | Endpoints                                                        |
|-------------|-------------------------------------------------------------------|
| Auth        | `POST /users/login`, `POST /users/register`                      |
| Categorías  | `GET/POST /categories`, `GET/PUT/DELETE /categories/:id`         |
| Productos   | `GET/POST /products`, `GET/PUT/DELETE /products/:id`             |
| Proveedores | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id`           |
| Bodegas     | `GET/POST /warehouses`, `GET/PUT/DELETE /warehouses/:id`, `GET /warehouses/capacity` |
| Inventario  | `GET /inventory`, `GET /inventory/product/:product_id`, `POST/PUT/DELETE /inventory/:id` |
| Movimientos | `GET /movements`, `GET /movements/product/:product_id`, `POST /movements` |
| Compras     | `GET/POST /purchases`, `PATCH /purchases/:id/status`, `GET /purchases/supplier/:supplier_id` |
| Detalle compra | `GET/POST /purchase-details`, `GET /purchase-details/purchase/:purchase_id` |
| Reportes    | `GET /reports/eoq`, `GET /reports/movements-summary`, `GET /reports/stock-by-product` |

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
    components/
      layout.js            # Shell: sidebar + navbar + contenido
      sidebar.js
      navbar.js
      form-modal.js         # Modal de formulario reutilizable (CRUD)
      confirm-dialog.js       # Modal de confirmación
      toast.js                # Notificaciones
      badges.js                # Badges ABC / semáforo
    services/
      api.js                    # Cliente HTTP central
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
