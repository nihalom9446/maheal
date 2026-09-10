import {
  pgTable, uuid, text, jsonb,
  timestamp
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { families } from './families';
import { family_members } from './members';

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  family_id: uuid('family_id').references(() => families.id),
  member_id: uuid('member_id').references(() => family_members.id),
  certificate_number: text('certificate_number').notNull(),
  type: text('type').notNull(), // 'NIKAH' | 'NOC' | 'MEMBERSHIP'
  recipient_name: text('recipient_name').notNull(),
  recipient_name_ml: text('recipient_name_ml'),
  data: jsonb('data').default({}).notNull(),
  content: text('content'),
  verification_token: text('verification_token').unique().notNull(),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'REVOKED'
  issued_by_user_id: uuid('issued_by_user_id').notNull(),
  issued_at: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  valid_until: timestamp('valid_until', { withTimezone: true }),
  revoked_at: timestamp('revoked_at', { withTimezone: true }),
  revoked_reason: text('revoked_reason'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
