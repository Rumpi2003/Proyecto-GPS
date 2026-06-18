import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const etiqueta = pgTable('etiqueta', {
  id_etiqueta: serial('id_etiqueta').primaryKey(),
  nombre_etiqueta: varchar('nombre_etiqueta', { length: 100 }).notNull(),
  icono: varchar('icono', { length: 255 }).notNull(),
});

export type Etiqueta = typeof etiqueta.$inferSelect;
export type NewEtiqueta = typeof etiqueta.$inferInsert;
