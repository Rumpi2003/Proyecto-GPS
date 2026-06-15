import { drizzle } from 'drizzle-orm/node-postgres';
import pool from '../config/db.js';

const db = drizzle(pool);
export default db;