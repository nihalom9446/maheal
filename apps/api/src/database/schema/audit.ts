import {
  pgTable, uuid, text, timestamp, jsonb
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';

export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  actor_user_id: uuid('actor_user_id'),  // null for system actions
  action: text('action').notNull(),
  // e.g. FAMILY_CREATED, PIRIVU_RECORDED, CERTIFICATE_ISSUED, ROLE_GRANTED
  resource_type: text('resource_type'),  // FAMILY, MEMBER, CERTIFICATE, etc.
  resource_id: uuid('resource_id'),
  previous_value: jsonb('previous_value'),
  new_value: jsonb('new_value'),
  ip_address: text('ip_address'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  // NO updated_at — this table is append-only
});