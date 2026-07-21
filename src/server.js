import express from 'express';
import { PORT } from '../config/config.js';
import morgan from 'morgan';
import cors from 'cors';
import usersRouter from './routes/users.routes.js';
import warehousesRouter from './routes/warehouses.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import productsRouter from './routes/products.routes.js';
import movementsRouter from './routes/movements.routes.js';
import suppliersRouter from './routes/suppliers.routes.js';
import purchasesRouter from './routes/purchases.routes.js';
import purchaseDetailsRouter from './routes/purchase_details.routes.js';
import categoriesRouter from './routes/categories.routes.js';

const app = express();

// morgan registra por consola todas las solicitudes que recive el servidor
app.use(morgan('dev'));
app.use(express.json());
// Perimite que cualquier url consuma la api
app.use(cors());

app.use (usersRouter);
app.use (warehousesRouter);
app.use (inventoryRouter);
app.use (productsRouter);
app.use (movementsRouter);
app.use (suppliersRouter);
app.use (purchasesRouter);
app.use (purchaseDetailsRouter);
app.use (categoriesRouter);

app.listen(PORT)
console.log('server port:', PORT);

// Configuración de CORS: En este caso se le da permiso al localhost
const corsOptions = {
    origin: `http://localhost:${PORT}`, 
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(cors(corsOptions));

