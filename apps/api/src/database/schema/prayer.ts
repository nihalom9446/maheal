import {
  pgTable, uuid, text, integer,
  timestamp, decimal, jsonb, pgEnum, time
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';

export const madhabEnum = pgEnum('madhab', ['SHAFI', 'HANAFI']);

export const prayer_schedules = pgTable('prayer_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id).unique(),
  madhab: madhabEnum('madhab').default('SHAFI').notNull(),
  fajr_angle: decimal('fajr_angle', { precision: 4, scale: 1 }).default('18.0').notNull(),
  isha_angle: decimal('isha_angle', { precision: 4, scale: 1 }).default('18.0').notNull(),
  fajr_iqamah_offset_minutes: integer('fajr_iqamah_offset_minutes').default(20).notNull(),
  dhuhr_iqamah_offset_minutes: integer('dhuhr_iqamah_offset_minutes').default(10).notNull(),
  asr_iqamah_offset_minutes: integer('asr_iqamah_offset_minutes').default(10).notNull(),
  maghrib_iqamah_offset_minutes: integer('maghrib_iqamah_offset_minutes').default(5).notNull(),
  isha_iqamah_offset_minutes: integer('isha_iqamah_offset_minutes').default(15).notNull(),
  jumuah_time: time('jumuah_time'),
  jumuah_second_time: time('jumuah_second_time'),
  jumuah_iqamah_offset_minutes: integer('jumuah_iqamah_offset_minutes').default(5).notNull(),
  seasonal_overrides: jsonb('seasonal_overrides'),
  updated_by_user_id: uuid('updated_by_user_id'),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});