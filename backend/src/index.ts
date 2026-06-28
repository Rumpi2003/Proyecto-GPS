import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routerApi from './routes/index.routes.js';
import { AppDataSource } from './config/db.config.js';
import { UniversidadService } from './services/universidad.service.js';

dotenv.config();

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

AppDataSource.initialize()
  .then(async () => {
    console.log('Conexión a la base de datos establecida');

    const universidadService = new UniversidadService();
    await universidadService.create({
    nombre_universidad: 'Universidad del Bío-Bío',
    direccion: 'Collao 1202, Casilla 5-C, Concepción, Bío Bío, Chile',
    coordenadas: { type: 'Point', coordinates: [-73.01201929673114, -36.823169511968544] },
    });
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });
