import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { family_members } from './members';
import { users } from './auth';

export const madrasa_students = pgTable('madrasa_students', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  member_id: uuid('member_id').notNull().references(() => family_members.id),
  board_admission_number: text('board_admission_number'),
  class_level: integer('class_level').notNull(),
  enrollment_date: date('enrollment_date').notNull(),
  fee_category: text('fee_category').default('FULL').notNull(), // 'FULL' | 'CONCESSION' | 'EXEMPT'
  monthly_fee: decimal('monthly_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  parent_consent_confirmed: boolean('parent_consent_confirmed').default(false).notNull(),
  parent_consent_timestamp: timestamp('parent_consent_timestamp', { withTimezone: true }),
  parent_user_id: uuid('parent_user_id').references(() => users.id),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'INACTIVE' | 'GRADUATED'
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const madrasa_teachers = pgTable('madrasa_teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  member_id: uuid('member_id').notNull().references(() => family_members.id),
  designation: text('designation').default('MUALLIM').notNull(), // 'SADAR_MUALLIM' | 'MUALLIM' | 'ASSISTANT'
  classes_assigned: integer('classes_assigned').array().notNull(),
  monthly_salary: decimal('monthly_salary', { precision: 10, scale: 2 }).notNull(),
  joining_date: date('joining_date').notNull(),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'INACTIVE'
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const madrasa_attendance = pgTable('madrasa_attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  student_id: uuid('student_id').notNull().references(() => madrasa_students.id),
  class_level: integer('class_level').notNull(),
  attendance_date: date('attendance_date').notNull(),
  status: text('status').notNull(), // 'PRESENT' | 'ABSENT' | 'LEAVE'
  notes: text('notes'),
  marked_by_user_id: uuid('marked_by_user_id').references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const madrasa_fee_collections = pgTable('madrasa_fee_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  student_id: uuid('student_id').notNull().references(() => madrasa_students.id),
  receipt_number: text('receipt_number').notNull(),
  fee_months: text('fee_months').array().notNull(),
  amount_per_month: decimal('amount_per_month', { precision: 10, scale: 2 }).notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: text('payment_method').default('CASH').notNull(),
  reference: text('reference'),
  notes: text('notes'),
  collected_by_user_id: uuid('collected_by_user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
