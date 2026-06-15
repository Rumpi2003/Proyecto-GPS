export default {
  schema: './db/schemas/schema.index.ts',
  out: './drizzle/migrations',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
