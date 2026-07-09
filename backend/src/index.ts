import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import routerApi from './routes/index.routes.js';
import { AppDataSource } from './config/db.config.js';
import { UniversidadService } from './services/universidad.service.js';
import { EtiquetaService } from './services/etiqueta.service.js';
import { CategoriaEtiquetaService } from './services/categoriaEtiqueta.service.js';
import { crearAdminSiNoExiste } from './services/usuario.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env.local'), override: true });

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

// Crear carpeta uploads si no existe y servir archivos estáticos
const uploadsDir = resolve(__dirname, '../uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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

    const etiquetas = [
      { nombreEtiqueta: 'Solo Hombres', url_icono: '/logos_etiquetas/genero/solo_hombres.svg', id_categoria: 1 },
      { nombreEtiqueta: 'Solo Mujeres', url_icono: '/logos_etiquetas/genero/solo_mujeres.svg', id_categoria: 1 },
      { nombreEtiqueta: 'Pieza', url_icono: '/logos_etiquetas/propiedad/pieza.svg', id_categoria: 2 },
      { nombreEtiqueta: 'Departamento', url_icono: '/logos_etiquetas/propiedad/departamento.svg', id_categoria: 2 },
      { nombreEtiqueta: 'Pensión', url_icono: '/logos_etiquetas/propiedad/casa.svg', id_categoria: 2 },
      { nombreEtiqueta: 'Residencia', url_icono: '/logos_etiquetas/propiedad/casa.svg', id_categoria: 2 },
      { nombreEtiqueta: 'Casa', url_icono: '/logos_etiquetas/propiedad/casa.svg', id_categoria: 2 },
      { nombreEtiqueta: 'Wi-fi alta velocidad', url_icono: '/logos_etiquetas/servicio/wifi_alta_velocidad.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Baño privado', url_icono: '/logos_etiquetas/servicio/baño_privado.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Amoblado', url_icono: '/logos_etiquetas/servicio/amoblado.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Calefacción', url_icono: '/logos_etiquetas/servicio/calefaccion.png', id_categoria: 3 },
      { nombreEtiqueta: 'Lavandería', url_icono: '/logos_etiquetas/servicio/lavanderia.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Agua caliente', url_icono: '/logos_etiquetas/servicio/agua_caliente.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Cocina', url_icono: '/logos_etiquetas/servicio/cocina.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Parking', url_icono: '/logos_etiquetas/servicio/parking.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Aseo', url_icono: '/logos_etiquetas/servicio/aseo.svg', id_categoria: 3 },
      { nombreEtiqueta: 'Pet-friendly', url_icono: '/logos_etiquetas/servicio/pet-friendly.svg', id_categoria: 3 },
    ];

    for (const etiqueta of etiquetas) {
      try {
        await etiquetaService.createEtiqueta(etiqueta);
      } catch (e) {
        console.log(`Etiqueta ${etiqueta.nombreEtiqueta}:`, (e as Error).message);
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
