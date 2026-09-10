import {
  pgTable, uuid, text, timestamp,
  jsonb, integer, pgEnum
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { users } from './auth';

export const notificationChannelEnum = pgEnum('notification_channel', [
  'FCM', 'SMS'
]);

export const notificationDeliveryStatusEnum = pgEnum('notification_delivery_status', [
  'PENDING', 'DELIVERED', 'FAILED'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  user_id: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  data: jsonb('data').default({}).notNull(),
  read_at: timestamp('read_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notification_deliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  notification_id: uuid('notification_id').notNull().references(() => notifications.id),
  channel: notificationChannelEnum('channel').notNull(),
  status: notificationDeliveryStatusEnum('status').default('PENDING').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  provider_message_id: text('provider_message_id'),
  delivered_at: timestamp('delivered_at', { withTimezone: true }),
  error_message: text('error_message'),
});