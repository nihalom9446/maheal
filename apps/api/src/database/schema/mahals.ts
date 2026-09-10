import {
  pgTable, uuid, text, boolean,
  timestamp, jsonb, decimal
} from 'drizzle-orm/pg-core';

export const mahals = pgTable('mahals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  name_ml: text('name_ml'),
  slug: text('slug').unique().notNull(),
  faction: text('faction').default('SUNNI_EK').notNull(),
  registration_type: text('registration_type'),  // SOCIETY/TRUST/WAQF/OTHER
  waqf_number: text('waqf_number'),
  address: text('address'),
  district: text('district'),
  masjid_lat: decimal('masjid_lat', { precision: 10, scale: 7 }),
  masjid_lng: decimal('masjid_lng', { precision: 10, scale: 7 }),
  contact_phone: text('contact_phone'),
  settings: jsonb('settings').default({}).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});