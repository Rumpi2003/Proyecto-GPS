import { pgTable, serial, integer } from 'drizzle-orm/pg-core';

export const cercania = pgTable('cercania', {
  id_cercania: serial('id_cercania').primaryKey(),
  id_publicacion: integer('id_publicacion').notNull(),
  id_universidad: integer('id_universidad').notNull(),
  distancia: integer('distancia').notNull(),
});

export type Cercania = typeof cercania.$inferSelect;
export type NewCercania = typeof cercania.$inferInsert;
