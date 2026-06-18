import { pgTable, integer, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { publicacion } from './publicacion.entity.js';
import { etiqueta } from './etiqueta.entity.js';

export const publicacion_etiqueta = pgTable(
  'publicacion_etiqueta',
  {
    id_publicacion: integer('id_publicacion').notNull(),
    id_etiqueta: integer('id_etiqueta').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.id_publicacion, table.id_etiqueta],
    }),
    foreignKey({
      columns: [table.id_publicacion],
      foreignColumns: [publicacion.id_publicacion],
    }),
    foreignKey({
      columns: [table.id_etiqueta],
      foreignColumns: [etiqueta.id_etiqueta],
    }),
  ]
);

export type PublicacionEtiqueta = typeof publicacion_etiqueta.$inferSelect;
export type NewPublicacionEtiqueta = typeof publicacion_etiqueta.$inferInsert;
