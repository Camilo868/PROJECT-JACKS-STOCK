# 📦 JACKS STOCKS

> Inventory management system with automatic **EOQ** (Economic Order Quantity), **ABC classification**, and **Reorder Point (ROP)** calculation — built as the capstone project for **CodeUp RIWI: Beyond Limits**.

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

<!-- Project logo / banner -->
<!-- ![Jacks Stocks](./docs/logo.png) -->

---

## 📖 About this project

**Jacks Stocks** helps small and medium businesses manage products, suppliers, warehouses, purchases, and stock movements — and automatically calculates:

- **EOQ** — how much to order in each purchase to minimize total cost.
- **ROP** — the exact stock level at which a new order should be placed.
- **ABC classification** — which products deserve the most attention, based on the Pareto rule applied to annual consumption value.
- **Criticality semaphore** — a red/yellow/green view of what needs to be bought right now.

This is a **capstone (Proyecto Integrador) project for CodeUp RIWI: Beyond Limits**, built collaboratively: one team member owns the backend, another owns the frontend, sharing one PostgreSQL database.

---

## 🗂️ Repositories

This project is split into two repositories that talk to each other over HTTP:

| Repository | Responsibility | README |
|---|---|---|
| `PROJECT-JACKS-STOCK-BACKEND` | Express.js REST API + PostgreSQL (Supabase) | [Backend README](../PROJECT-JACKS-STOCK-BACKEND/README.md) |
| `riwi-frontend` | HTML + CSS + Vanilla JavaScript SPA | [Frontend README](../riwi-frontend/README.md) |

Both READMEs go deeper into their own setup; this document is the entry point that explains how everything fits together.

---

## ✨ Key features

- Full CRUD for products, categories, suppliers, warehouses, inventory, movements, purchases, and purchase details.
- Authentication with **bcrypt** password hashing and **JWT** session tokens.
- Stock tracked **per warehouse** (a product can exist in several warehouses at once).
- **Available warehouse space**, calculated in SQL and displayed live.
- Purchase orders with status tracking (`pending` / `received` / `cancelled`) — marking an order as received automatically logs the matching stock entries.
- **Reports**: ABC distribution, semaphore breakdown, top products by consumption value, and a SQL-calculated EOQ/ROP report.
- Standardized API responses (`{ success, message, data }`) across every endpoint.

---

## 🏗️ Architecture

```
┌─────────────────────┐        HTTP (fetch)        ┌──────────────────────┐        SQL        ┌──────────────┐
│   riwi-frontend      │ ─────────────────────────▶ │  Backend (Express)    │ ─────────────────▶ │  PostgreSQL   │
│   Vanilla JS SPA      │ ◀───────────────────────── │  Controllers + Routes  │ ◀───────────────── │  (Supabase)    │
└─────────────────────┘     { success, data }       └──────────────────────┘                    └──────────────┘
```

- The **frontend** has no data logic of its own beyond formatting: every service (`src/js/services/*.js`) translates between the screens and the exact shape of the real database.
- The **backend** follows a simplified MVC pattern: one route file + one controller per resource, all returning the same response envelope.
- Business calculations (EOQ, ROP, ABC) live in `riwi-frontend/src/js/utils/inventory-calc.js`; equivalent SQL-only versions are exposed for reporting via `/reports/*`.

---

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES Modules), hash-based SPA router |
| Backend | Node.js, Express 5, `bcrypt`, `jsonwebtoken`, `cors`, `morgan` |
| Database | PostgreSQL (Supabase) |

---

## 🚀 Running the full project locally

### 1. Database

1. Run `BDT + queries.sql` against your Supabase project — creates the tables and sample data.
2. Run `migrations.sql` (in the backend repo) — adds the `status` column to `purchases`, the `note` column to `movements`, and the cascade-delete rules that let deletes work properly.

### 2. Backend

```bash
cd PROJECT-JACKS-STOCK-BACKEND
npm install
# create config/.env with your DB credentials, PORT, and JWT_SECRET
npm run dev
```

Runs on `http://localhost:6543` by default.

### 3. Frontend

```bash
cd riwi-frontend
npx serve .
# or the VS Code "Live Server" extension
```

Confirm `BASE_URL` in `src/js/services/api.js` points to the backend's URL, then open the app and **register a new account** — the sample SQL users have placeholder passwords and can't log in until you create your own account.

---

## 🔌 API overview

Full endpoint table lives in the [backend README](../PROJECT-JACKS-STOCK-BACKEND/README.md#-available-endpoints). Quick summary:

| Resource | Base path |
|---|---|
| Auth | `/users/login`, `/users/register` |
| Products | `/products` |
| Categories | `/categories` |
| Suppliers | `/suppliers` |
| Warehouses | `/warehouses`, `/warehouses/capacity` |
| Inventory | `/inventory` |
| Movements | `/movements` |
| Purchases | `/purchases`, `/purchases/:id/status` |
| Purchase details | `/purchase-details` |
| Reports | `/reports/eoq`, `/reports/movements-summary`, `/reports/stock-by-product` |

---

## 📐 Business logic

- **EOQ** = √(2·D·S / H) — D = annual demand, S = ordering cost, H = holding cost per unit/year (set directly by the admin, no percentage math involved).
- **ROP** = daily demand × supplier lead time (set per product) + safety stock.
- **ABC classification** — Pareto rule on annual consumption value: A = top 80% of value, B = next 15%, C = remaining 5%.
- **Semaphore** — red (stock ≤ 60% of ROP or empty), yellow (stock ≤ ROP), green (healthy).

---

## 🗺️ Roadmap (out of MVP scope)

- Export reports to PDF/Excel
- Automatic purchase order suggestions based on ROP
- Role-based permissions (admin vs. warehouse staff)

---

## 👥 Team & credits

Capstone project (Proyecto Integrador) — **CodeUp RIWI: Beyond Limits**, 2026.

## 📄 License

ISC.
