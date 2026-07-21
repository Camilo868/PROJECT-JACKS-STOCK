# 📦 JACKS STOCKS — Backend

> REST API for an inventory management system with automatic **EOQ** (Economic Order Quantity), **ABC classification**, and **Reorder Point (ROP)** calculation.

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

<!-- Project logo -->
<!-- ![Jacks Stocks](./docs/logo.png) -->

---

## 📖 Project description

**Jacks Stocks** is an inventory management system built for small and medium businesses. It manages products, suppliers, warehouses, purchases, and stock movements, and automatically calculates:

- **EOQ** — how much to order in each purchase to minimize costs.
- **ROP** — at what stock level a new order should be placed.
- **ABC classification** — which products deserve the most attention based on annual consumption value.

This repository contains only the **backend**: a REST API built with Express.js on top of PostgreSQL (Supabase). The frontend (HTML + CSS + Vanilla JavaScript) lives in a separate repository and consumes this API over HTTP.

---

## ✨ Key features

- Full CRUD for products, categories, suppliers, warehouses, inventory, movements, purchases, and purchase details.
- Authentication with **bcrypt** (password hashing) and **JWT** (session tokens).
- Standardized HTTP responses across every endpoint.
- **Available warehouse space** endpoint, calculated in SQL.
- **Reports** endpoints (EOQ/ROP, movements by type, stock by product) calculated in SQL.
- Purchase order status handling (`pending` / `received` / `cancelled`).

---

## 🏗️ Project architecture

The project follows a simplified **MVC architecture**, organized by resource:

```
Request → Router → Controller → PostgreSQL (pool) → Standard response
```

Each resource (products, suppliers, warehouses, etc.) has its own route file and its own controller, following the same CRUD pattern.

---

## 🛠️ Technologies used

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express 5 | HTTP framework / routing |
| PostgreSQL (Supabase) | Relational database |
| `pg` | PostgreSQL client for Node |
| `bcrypt` | Secure password hashing |
| `jsonwebtoken` | Token-based authentication |
| `cors` | Allow requests from the frontend |
| `morgan` | HTTP request logging |

---

## 📂 Project structure

```
PROJECT-JACKS-STOCK-BACKEND/
├── config/
│   ├── .env                 # Environment variables (not versioned)
│   ├── config.js             # Exported config (PORT)
│   └── db.js                  # PostgreSQL connection pool
├── migrations.sql              # Pending changes on top of BDT + queries.sql
├── src/
│   ├── controllers/             # Logic for each endpoint
│   ├── routes/                    # Route definitions per resource
│   ├── services/                   # Reusable logic (e.g. hashing)
│   ├── utils/
│   │   ├── jwt.js                    # Sign/verify tokens
│   │   └── response.js                # Standard response envelope
│   └── server.js                        # Entry point
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Clone the repository and install dependencies

```bash
git clone <repository-url>
cd PROJECT-JACKS-STOCK-BACKEND
npm install
```

### 2. Environment variables

Create `config/.env` with your PostgreSQL/Supabase credentials:

```env
DB_USER=your_user
DB_HOST=your_host
DB_PASSWORD=your_password
DB_DATABASE=your_database
DB_PORT=5432

PORT=6543
JWT_SECRET=a_long_random_string
```

### 3. Set up PostgreSQL

Run the `BDT + queries.sql` script (creates tables and sample data), then `migrations.sql` (adds the `status` column to `purchases` and the `note` column to `movements`, both required for the frontend's purchase and movement flows).

### 4. Start the server

```bash
npm run dev     # with auto-reload
# or
npm start
```

If everything is configured correctly, you should see:

```
✅ Connected to Supabase
Jacks Stocks API listening on port: 6543
```

### 5. Run the frontend

The frontend is a static site (no build step). Serve it with any static server, for example:

```bash
npx serve .
```

Make sure `API_CONFIG.BASE_URL` in `src/js/services/api.js` points to `http://localhost:6543`.

---

## 🔌 Available endpoints

Every response follows this shape:

```json
{ "success": true, "message": "Data obtained successfully", "data": [...] }
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/login` | Log in (returns `token` + `user`) |
| POST | `/users/register` | Register a user |
| GET | `/users` | List users |
| GET/PUT/DELETE | `/users/:id` | Get/update/delete a user |
| GET | `/categories` | List categories |
| POST/GET/PUT/DELETE | `/categories(/:id)` | Category CRUD |
| GET | `/suppliers` | List suppliers |
| POST/GET/PUT/DELETE | `/suppliers(/:id)` | Supplier CRUD |
| GET | `/warehouses` | List warehouses |
| GET | `/warehouses/capacity` | Available space per warehouse (SQL) |
| POST/GET/PUT/DELETE | `/warehouses(/:id)` | Warehouse CRUD |
| GET | `/products` | List products |
| POST/GET/PUT/DELETE | `/products(/:id)` | Product CRUD |
| GET | `/inventory` | List inventory |
| GET | `/inventory/product/:product_id` | Stock of a product per warehouse |
| POST/PUT/DELETE | `/inventory(/:id)` | Inventory CRUD |
| GET | `/movements` | List movements |
| GET | `/movements/product/:product_id` | History for a product |
| POST/PUT/DELETE | `/movements(/:id)` | Movement CRUD |
| GET | `/purchases` | List purchase orders |
| GET | `/purchases/supplier/:supplier_id` | Purchases from a supplier |
| PATCH | `/purchases/:id/status` | Change a purchase order's status |
| POST/GET/PUT/DELETE | `/purchases(/:id)` | Purchase order CRUD |
| GET | `/purchase-details/purchase/:purchase_id` | Items of a purchase order |
| POST/GET/PUT/DELETE | `/purchase-details(/:id)` | Purchase detail CRUD |
| GET | `/reports/eoq` | EOQ/ROP calculated in SQL |
| GET | `/reports/movements-summary` | Movements grouped by type |
| GET | `/reports/stock-by-product` | Total stock per product |

---

## 🔄 Data flow

```
Frontend (fetch)
      ↓
   Router (Express)
      ↓
  Controller
      ↓
  PostgreSQL (pool)
      ↓
Standard response { success, message, data }
```

---

## 📸 Screenshots

<!-- Reserved space for screenshots of the running system -->

---

## 👥 Authors

Capstone Project — CodeUp RIWI 2026.

## 📄 License

ISC.
