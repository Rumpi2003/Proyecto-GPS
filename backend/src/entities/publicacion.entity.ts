import { pgTable, serial, integer, varchar, real } from 'drizzle-orm/pg-core';

export const publicacion = pgTable('publicacion', {
  id_publicacion: serial('id_publicacion').primaryKey(),
  id_publicante: integer('id_publicante').notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  foto: varchar('foto', { length: 500 }).notNull(),
  descripcion: varchar('descripcion', { length: 1000 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  valoracion: real('valoracion').notNull(),
  ciudad_comuna: varchar('ciudad_comuna', { length: 100 }).notNull(),
  calle: varchar('calle', { length: 255 }).notNull(),
  numero: integer('numero').notNull(),
  latitud: varchar('latitud', { length: 50 }).notNull(),
  longitud: varchar('longitud', { length: 50 }).notNull(),
});

export type Publicacion = typeof publicacion.$inferSelect;
export type NewPublicacion = typeof publicacion.$inferInsert;
