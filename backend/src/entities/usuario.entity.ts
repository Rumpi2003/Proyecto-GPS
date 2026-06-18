import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const usuario = pgTable('usuario', {
    id_usuario: serial('id_usuario').primaryKey(),
    correo: varchar('correo', { length: 255 }).notNull(), 
    contraseña: varchar('contraseña', { length: 255 }).notNull(),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    rol: varchar('rol', { length: 50 }).notNull(),
});

export type Usuario = typeof usuario.$inferSelect;
export type NewUsuario = typeof usuario.$inferInsert;
