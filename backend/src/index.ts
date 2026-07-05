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
    await categoriaEtiquetaService.create({
      nombre_categoria: 'genero',
      es_excluyente: true,
    });
    await categoriaEtiquetaService.create({
      nombre_categoria: 'propiedad',
      es_excluyente: true,
    });
    await categoriaEtiquetaService.create({
      nombre_categoria: 'servicio',
      es_excluyente: false,
    });

    // Se crean Etiquetas según alcance del proyecto
    // Segun la categoría genero (id_categoria: 1)
    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Solo Hombres',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 1,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Solo Mujeres',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 1,
    });

    // Segun la categoría propiedad (id_categoria: 2)
    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Pieza',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 2,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Departamento',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 2,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Pensión',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 2,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Residencia',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 2,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Casa',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 2,
    });

    // Segun la categoría servicio (id_categoria: 3)
    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Wi-fi alta velocidad',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Baño privado',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Amoblado',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Calefacción',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Lavandería',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Agua caliente',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Cocina',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Bici parking',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });

    await etiquetaService.createEtiqueta({
      nombreEtiqueta: 'Aseo',
      url_icono: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',
      id_categoria: 3,
    });



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
