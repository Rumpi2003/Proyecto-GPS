import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Usuario } from '../entities/usuario.entity.js';
import { Publicacion } from '../entities/publicacion.entity.js';
import { Comentario } from '../entities/comentario.entity.js';
import { Etiqueta } from '../entities/etiqueta.entity.js';
import { CategoriaEtiqueta } from '../entities/categoriaEtiqueta.entity.js';
import { Cercania } from '../entities/cercania.entity.js';
import { Universidad } from '../entities/universidad.entity.js';
import { Valoracion } from '../entities/valoracion.entity.js';
import { ReportePubli } from '../entities/reportePubli.entity.js';
import { ReporteComentario } from '../entities/reporteCom.entity.js';
import { Foto } from '../entities/foto.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

function getEnvVar(name: string): string {
  const value = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is not set`);
    return value;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getEnvVar('DB_HOST'),
  port: Number(getEnvVar('DB_PORT')),
  username: getEnvVar('DB_USER'),
  password: getEnvVar('DB_PASSWORD'),
  database: getEnvVar('DB_NAME'),
  synchronize: true,
  migrations: ['dist/migrations/*.{js,mjs,cjs}'],
  entities: [Usuario, Publicacion, Comentario, Etiqueta, CategoriaEtiqueta, Cercania, Universidad, Valoracion, ReportePubli, ReporteComentario, Foto],
});