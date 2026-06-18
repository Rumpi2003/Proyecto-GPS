import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Usuario } from '../entities/usuario.entity.js';

dotenv.config();

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
  entities: [Usuario],
});