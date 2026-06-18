import { pgTable, serial, integer, varchar, foreignKey } from 'drizzle-orm/pg-core';
import { usuario } from './usuario.entity.js';

export const comentario = pgTable(
  'comentario',
  {
    id_comentario: serial('id_comentario').primaryKey(),
    id_usuario: integer('id_usuario').notNull(),
    id_publicacion: integer('id_publicacion').notNull(),
    texto: varchar('texto', { length: 1000 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id_usuario],
      foreignColumns: [usuario.id_usuario],
    }),
  ]
);

export type Comentario = typeof comentario.$inferSelect;
export type NewComentario = typeof comentario.$inferInsert;
