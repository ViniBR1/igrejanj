import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const pedidosOracao = pgTable('pedidos_oracao', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  motivo: text('motivo').notNull(),
  contato: varchar('contato', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pendente'),
  oracoes: integer('oracoes').default(0),
  criado_em: timestamp('criado_em').defaultNow(),
  respondido_em: timestamp('respondido_em'),
});