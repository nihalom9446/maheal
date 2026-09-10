import {
  pgTable, uuid, text, integer,
  timestamp
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';

export const wards = pgTable('wards', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  name: text('name').notNull(),
  name_ml: text('name_ml'),
  ward_number: integer('ward_number'),
  convener_member_id: uuid('convener_member_id'),  // FK set after members table
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});