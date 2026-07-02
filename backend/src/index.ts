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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',          
      'http://127.0.0.1:5173',
      'http://146.83.198.35:5173'       
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
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

    // Se crean Universidades de Concepción según alcance del proyecto

    // UBB
    await universidadService.create({
    nombre_universidad: 'Universidad del Bío-Bío, Concepción',
    direccion: 'Collao 1202, Casilla 5-C, Concepción, Bío Bío, Chile',
    coordenadas: { type: 'Point', coordinates: [-73.01201929673114, -36.823169511968544] },
    });

    // UdeC
    await universidadService.create({
      nombre_universidad: 'Universidad de Concepción',
      direccion: 'Edmundo Larenas 219, 4070409 Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.03570189999999, -36.8299341] },
    });

    // UCSC
    await universidadService.create({
      nombre_universidad: 'Universidad Católica de la Santísima Concepción',
      direccion: 'Av. Alonso de Ribera 2850, Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.05591799999999, -36.79852580000001] },
    });

    // USS
    await universidadService.create({
      nombre_universidad: 'Universidad San Sebastián, Campus Las Tres Pascualas',
      direccion: 'Lientur 1457, 4081339 Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.0426492, -36.81299660000001] },
    });

    app.listen(Number(PORT),'0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });
