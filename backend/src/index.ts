import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routerApi from './routes/index.routes.js';
import { AppDataSource } from './config/db.config.js';

dotenv.config();

AppDataSource.initialize().then(() => {
  console.log('Conexión a la base de datos establecida');
}).catch((error) => {
  console.error('Error al conectar a la base de datos:', error);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

routerApi(app);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
