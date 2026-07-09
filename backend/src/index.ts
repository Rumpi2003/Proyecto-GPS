import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import routerApi from './routes/index.routes.js';
import { AppDataSource } from './config/db.config.js';
import { UniversidadService } from './services/universidad.service.js';
import { EtiquetaService } from './services/etiqueta.service.js';
import { CategoriaEtiquetaService } from './services/categoriaEtiqueta.service.js';
import { crearAdminSiNoExiste } from './services/usuario.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',          
      'http://127.0.0.1:5173',
      'http://146.83.198.35:1243'       
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
    const categoriaEtiquetaService = new CategoriaEtiquetaService();
    const etiquetaService = new EtiquetaService();

    // Se crean Universidades de Concepción según alcance del proyecto

    // UBB 1
    await universidadService.create({
    nombre_universidad: 'Universidad del Bío-Bío, Concepción',
    direccion: 'Collao 1202, Casilla 5-C, Concepción, Bío Bío, Chile',
    coordenadas: { type: 'Point', coordinates: [-73.01201929673114, -36.823169511968544] },
    });

    // UdeC 2
    await universidadService.create({
      nombre_universidad: 'Universidad de Concepción',
      direccion: 'Edmundo Larenas 219, 4070409 Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.03570189999999, -36.8299341] },
    });

    // UCSC 3
    await universidadService.create({
      nombre_universidad: 'Universidad Católica de la Santísima Concepción',
      direccion: 'Av. Alonso de Ribera 2850, Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.05591799999999, -36.79852580000001] },
    });

    // USS 4
    await universidadService.create({
      nombre_universidad: 'Universidad San Sebastián, Campus Las Tres Pascualas',
      direccion: 'Lientur 1457, 4081339 Concepción, Bío Bío, Chile',
      coordenadas: { type: 'Point', coordinates: [-73.0426492, -36.81299660000001] },
    });

    // Se crean Categorías de Etiquetas según alcance del proyecto
    try {
      await categoriaEtiquetaService.create({
        nombre_categoria: 'genero',
        es_excluyente: true,
      });
    } catch (e) {
      console.log('Categoria genero: ', (e as Error).message);
    }

    try {
      await categoriaEtiquetaService.create({
        nombre_categoria: 'propiedad',
        es_excluyente: true,
      });
    } catch (e) {
      console.log('Categoria propiedad: ', (e as Error).message);
    }

    try {
      await categoriaEtiquetaService.create({
        nombre_categoria: 'servicio',
        es_excluyente: false,
      });
    } catch (e) {
      console.log('Categoria servicio: ', (e as Error).message);
    }

    // Se crean Etiquetas según alcance del proyecto
    // Segun la categoría genero (id_categoria: 1)
    try {
      await etiquetaService.createEtiqueta({
        nombreEtiqueta: 'Solo Hombres',
        url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
        id_categoria: 1,
      });
    } catch (e) {
      console.log('Etiqueta Solo Hombres:', (e as Error).message);
    }

    try {
      await etiquetaService.createEtiqueta({
        nombreEtiqueta: 'Solo Mujeres',
        url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
        id_categoria: 1,
      });
    } catch (e) {
      console.log('Etiqueta Solo Mujeres:', (e as Error).message);
    }

    // Segun la categoría propiedad (id_categoria: 2)
    const propiedadLabels = ['Pieza','Departamento','Pensión','Residencia','Casa'];
    for (const nombre of propiedadLabels) {
      try {
        await etiquetaService.createEtiqueta({
          nombreEtiqueta: nombre,
          url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
          id_categoria: 2,
        });
      } catch (e) {
        console.log(`Etiqueta ${nombre}:`, (e as Error).message);
      }
    }

    // Segun la categoría servicio (id_categoria: 3)
    const servicioLabels = [
      'Wi-fi alta velocidad',
      'Baño privado',
      'Amoblado',
      'Calefacción',
      'Lavandería',
      'Agua caliente',
      'Cocina',
      'Parking',
      'Aseo',
      'Pet-friendly',
    ];

    for (const nombre of servicioLabels) {
      try {
        await etiquetaService.createEtiqueta({
          nombreEtiqueta: nombre,
          url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
          id_categoria: 3,
        });
      } catch (e) {
        console.log(`Etiqueta ${nombre}:`, (e as Error).message);
      }
    }

    //==========admin inicial==========
    const adminCorreo = process.env.ADMIN_CORREO;
    const adminNombre = process.env.ADMIN_NOMBRE;
    const adminContraseña = process.env.ADMIN_PASSWORD;

    if (adminCorreo && adminNombre && adminContraseña) {
      await crearAdminSiNoExiste(adminCorreo, adminNombre, adminContraseña);
    }

    app.listen(Number(PORT),'0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });
