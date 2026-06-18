import dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/entities/entities.index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
