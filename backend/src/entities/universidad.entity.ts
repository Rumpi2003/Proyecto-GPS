import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const universidad = pgTable('universidad', {
  id_universidad: serial('id_universidad').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  ciudad_comuna: varchar('ciudad_comuna', { length: 100 }).notNull(),
  calle: varchar('calle', { length: 255 }).notNull(),
  numero: varchar('numero', { length: 20 }).notNull(),
  latitud: varchar('latitud', { length: 50 }).notNull(),
  longitud: varchar('longitud', { length: 50 }).notNull(),
});

export type Universidad = typeof universidad.$inferSelect;
export type NewUniversidad = typeof universidad.$inferInsert;
