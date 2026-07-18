import express from 'express';
import { PORT } from '../config/config.js';
import administradorRouter from './routes/administrador.routes.js';
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use (administradorRouter);

app.listen(PORT)
console.log('server port:', PORT);
