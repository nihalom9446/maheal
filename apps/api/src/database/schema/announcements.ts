import {
  pgTable, uuid, text, boolean,
  timestamp, pgEnum
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { families } from './families';

export const announcementCategoryEnum = pgEnum('announcement_category', [
  'GENERAL', 'EMERGENCY', 'JANAZAH', 'FINANCE',
  'MADRASA', 'EVENT', 'WELFARE', 'COMMUNITY'
]);

export const announcementPriorityEnum = pgEnum('announcement_priority', [
  'NORMAL', 'HIGH', 'URGENT'
]);

export const announcementAudienceEnum = pgEnum('announcement_audience', [
  'ALL', 'COMMITTEE', 'MADRASA', 'WARD'
]);

export const announcementStatusEnum = pgEnum('announcement_status', [
  'DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
]);

export const death_records = pgTable('death_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  name: text('name').notNull(),            // PUBLIC
  name_ml: text('name_ml'),               // PUBLIC
  photo_key: text('photo_key'),           // PUBLIC (via signed URL)
  date_of_death: text('date_of_death'),   // PRIVATE (DATE as text for simplicity)
  burial_location: text('burial_location'), // PRIVATE
  family_id: uuid('family_id').references(() => families.id), // PRIVATE
  notes: text('notes'),                   // PRIVATE
  is_details_public: boolean('is_details_public').default(false).notNull(),
  announcement_id: uuid('announcement_id'), // FK added after announcements table
  created_by_user_id: uuid('created_by_user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  title: text('title').notNull(),
  title_ml: text('title_ml'),
  content: text('content'),
  content_ml: text('content_ml'),
  category: announcementCategoryEnum('category').default('GENERAL').notNull(),
  priority: announcementPriorityEnum('priority').default('NORMAL').notNull(),
  attachment_key: text('attachment_key'),
  audience: announcementAudienceEnum('audience').default('ALL').notNull(),
  target_ward_ids: uuid('target_ward_ids').array(),
  death_record_id: uuid('death_record_id').references(() => death_records.id),
  status: announcementStatusEnum('status').default('DRAFT').notNull(),
  publish_at: timestamp('publish_at', { withTimezone: true }),
  published_by_user_id: uuid('published_by_user_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  title: text('title').notNull(),
  title_ml: text('title_ml'),
  description: text('description'),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  location: text('location'),
  image_key: text('image_key'),
  status: text('status').default('ACTIVE').notNull(),
  created_by_user_id: uuid('created_by_user_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});