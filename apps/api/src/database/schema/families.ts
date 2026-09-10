import {
  pgTable, uuid, text, boolean,
  timestamp, integer, decimal, pgEnum, unique
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { wards } from './wards';

export const familyStatusEnum = pgEnum('family_status', [
  'ACTIVE', 'INACTIVE', 'TRANSFERRED'
]);

export const families = pgTable('families', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  family_number: integer('family_number').notNull(),
  house_name: text('house_name').notNull(),
  house_name_ml: text('house_name_ml'),
  door_number: text('door_number'),
  address: text('address'),
  ward_id: uuid('ward_id').references(() => wards.id),
  pirivu_amount: decimal('pirivu_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  head_member_id: uuid('head_member_id'),  // FK set after members table
  is_nri_household: boolean('is_nri_household').default(false).notNull(),
  status: familyStatusEnum('status').default('ACTIVE').notNull(),
  notes: text('notes'),
  created_by_user_id: uuid('created_by_user_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueFamilyNumber: unique().on(table.mahal_id, table.family_number),
}));