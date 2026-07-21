import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { PORT } from '../config/config.js';
import usersRouter from './routes/users.routes.js';
import warehousesRouter from './routes/warehouses.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import productsRouter from './routes/products.routes.js';
import movementsRouter from './routes/movements.routes.js';
import suppliersRouter from './routes/suppliers.routes.js';
import purchasesRouter from './routes/purchases.routes.js';
import purchaseDetailsRouter from './routes/purchase_details.routes.js';
import categoriesRouter from './routes/categories.routes.js';
import reportsRouter from './routes/reports.routes.js';

const app = express();

// Log every incoming request to the console
app.use(morgan('dev'));
app.use(express.json());

// Allow the frontend (running on a different origin) to call this API.
// NOTE: a single app.use(cors()) is enough — do not add a second,
// stricter cors() call after this one, it would override it.
app.use(cors());

app.use(usersRouter);
app.use(warehousesRouter);
app.use(inventoryRouter);
app.use(productsRouter);
app.use(movementsRouter);
app.use(suppliersRouter);
app.use(purchasesRouter);
app.use(purchaseDetailsRouter);
app.use(categoriesRouter);
app.use(reportsRouter);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', data: null });
});

app.listen(PORT, () => {
  console.log('Jacks Stocks API listening on port:', PORT);
});
