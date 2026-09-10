import {
  pgTable, uuid, text, boolean,
  timestamp, date, pgEnum
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { families } from './families';

export const memberStatusEnum = pgEnum('member_status', [
  'ACTIVE', 'DECEASED', 'TRANSFERRED', 'INACTIVE'
]);

export const genderEnum = pgEnum('gender', ['M', 'F']);

export const family_members = pgTable('family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  family_id: uuid('family_id').notNull().references(() => families.id),
  name: text('name').notNull(),
  name_ml: text('name_ml'),
  gender: genderEnum('gender'),
  date_of_birth: date('date_of_birth'),
  relationship_to_head: text('relationship_to_head'),
  // HEAD/SPOUSE/SON/DAUGHTER/FATHER/MOTHER/SIBLING/OTHER
  phone: text('phone'),
  blood_group: text('blood_group'),
  occupation: text('occupation'),
  is_nri: boolean('is_nri').default(false).notNull(),
  nri_country: text('nri_country'),
  status: memberStatusEnum('status').default('ACTIVE').notNull(),
  profile_image_key: text('profile_image_key'),  // S3/Spaces key, never URL
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});