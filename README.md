# JACKS STOCKS — Frontend

Frontend for the **CodeUp RIWI: Beyond Limits** capstone project.
Inventory management system for SMBs that automatically calculates
**EOQ** (Economic Order Quantity), **ABC classification**, and
**Reorder Point (ROP)** with a criticality semaphore.

This repository contains **only the frontend**. The backend
(Express.js) is another team member's responsibility and integrates
by consuming the same service layer (`src/js/services`).

## Stack

- HTML5 + CSS3
- Bootstrap 5 + Bootstrap Icons
- Vanilla JavaScript (ES Modules) — no frameworks
- Hash-based SPA router (`#/route`)

## How to run

No build step or dependency installation required. Must be served as
a static site (ES Modules don't work with `file://`):

```bash
# With Python
python3 -m http.server 5500

# Or with the "Live Server" VS Code extension
```

Then open `http://localhost:5500`.

## Backend required

This app **needs the Express backend running** to work — it no
longer has a built-in test-data mode. Before using it:

1. Start the backend (`npm run dev` in `PROJECT-JACKS-STOCK-BACKEND`,
   see its own README).
2. Confirm `src/js/services/api.js` points to the right URL:

```js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:6543', // adjust to the real backend URL
};
```

3. Create an account from the **Register** screen — the sample users
   from the SQL script have a placeholder password (not a real hash),
   so they won't be able to log in.

`api.js` sends the session token (`Authorization: Bearer`), unwraps
the backend's `{ success, message, data }` response, and handles
401 errors by redirecting to `/login`.

The Express backend exposes these endpoints:

| Resource    | Endpoints                                                        |
|-------------|-------------------------------------------------------------------|
| Auth        | `POST /users/login`, `POST /users/register`                      |
| Categories  | `GET/POST /categories`, `GET/PUT/DELETE /categories/:id`         |
| Products    | `GET/POST /products`, `GET/PUT/DELETE /products/:id`             |
| Suppliers   | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id`           |
| Warehouses  | `GET/POST /warehouses`, `GET/PUT/DELETE /warehouses/:id`, `GET /warehouses/capacity` |
| Inventory   | `GET /inventory`, `GET /inventory/product/:product_id`, `POST/PUT/DELETE /inventory/:id` |
| Movements   | `GET /movements`, `GET /movements/product/:product_id`, `POST /movements` |
| Purchases   | `GET/POST /purchases`, `PATCH /purchases/:id/status`, `GET /purchases/supplier/:supplier_id` |
| Purchase details | `GET/POST /purchase-details`, `GET /purchase-details/purchase/:purchase_id` |
| Reports     | `GET /reports/eoq`, `GET /reports/movements-summary`, `GET /reports/stock-by-product` |

## Project structure

```
src/
  assets/
    css/main.css        # Design tokens and system styles
    img/
  js/
    core/
      router.js          # Hash router with private routes and 404
      session.js          # Session persistence (localStorage)
    components/
      layout.js            # Shell: sidebar + navbar + content
      sidebar.js
      navbar.js
      form-modal.js         # Reusable form modal (CRUD)
      confirm-dialog.js       # Confirmation modal
      toast.js                # Notifications
      badges.js                # ABC / semaphore badges
    services/
      api.js                    # Central HTTP client
      auth.service.js
      product.service.js
      supplier.service.js
      warehouse.service.js
      movement.service.js
      purchase.service.js
      settings.service.js
    utils/
      inventory-calc.js          # Business logic: EOQ, ROP, ABC
      validators.js
      format.js
    pages/
      login.page.js / register.page.js
      dashboard.page.js
      products.page.js / suppliers.page.js / warehouses.page.js
      movements.page.js / semaphore.page.js / purchases.page.js
      reports.page.js / settings.page.js
      notfound.page.js
    main.js                      # Route registration and bootstrap
index.html
```

## Implemented business logic

- **EOQ** = √(2·D·S / H) — `utils/inventory-calc.js`
- **ROP** = daily demand × supplier lead time + safety stock
- **ABC classification** using the Pareto rule on annual consumption value
  (A = 80% of value, B = next 15%, C = remaining 5%)
- **Criticality semaphore**: red (buy now), yellow (watch), green
  (healthy), based on current stock vs. ROP
- Logging an **entry/exit** updates the product's stock
- Marking a **purchase order as received** automatically generates the
  corresponding entry movements

## Roadmap (out of MVP scope)

- Export reports to PDF/Excel (v2)
- Automatic purchase order suggestions (v2)
