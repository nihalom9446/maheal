import {
  pgTable, uuid, text, boolean,
  timestamp, integer, pgEnum
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';

export const mahalRoleEnum = pgEnum('mahal_role', [
  'MAHAL_ADMIN', 'TREASURER', 'COMMITTEE',
  'MADRASA_ADMIN', 'MADRASA_TEACHER', 'VIEWER',
  'FAMILY_HEAD', 'MEMBER',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').unique().notNull(),
  name: text('name'),
  is_verified: boolean('is_verified').default(false).notNull(),
  last_login_at: timestamp('last_login_at', { withTimezone: true }),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const user_mahal_roles = pgTable('user_mahal_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  member_id: uuid('member_id'),  // FK to family_members (nullable)
  role: mahalRoleEnum('role').notNull(),
  granted_by_user_id: uuid('granted_by_user_id'),
  granted_at: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean('is_active').default(true).notNull(),
});

export const otp_sessions = pgTable('otp_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  otp_hash: text('otp_hash').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refresh_tokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  token_hash: text('token_hash').notNull(),  // bcrypt hash
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked_at: timestamp('revoked_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Tracks OTP rate limiting per phone number (PostgreSQL-backed, no Redis needed for pilot)
export const otp_rate_limits = pgTable('otp_rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  window_start: timestamp('window_start', { withTimezone: true }).defaultNow().notNull(),
  blocked_until: timestamp('blocked_until', { withTimezone: true }),
});

// Privacy consent records (DPDPA compliance)
export const privacy_consents = pgTable('privacy_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  consent_version: text('consent_version').notNull().default('1.0'),
  consented_at: timestamp('consented_at', { withTimezone: true }).defaultNow().notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
});