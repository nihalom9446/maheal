import {
  pgTable, uuid, text, boolean,
  timestamp, decimal, pgEnum, date
} from 'drizzle-orm/pg-core';
import { mahals } from './mahals';
import { families } from './families';
import { users } from './auth';

export const fundTypeEnum = pgEnum('fund_type', ['GENERAL', 'ZAKAT', 'MADRASA']);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH', 'MANUAL_UPI', 'GATEWAY', 'BANK_TRANSFER'
]);

export const paymentOrderStatusEnum = pgEnum('payment_order_status', [
  'CREATED', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED'
]);

export const pirivu_collections = pgTable('pirivu_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  family_id: uuid('family_id').notNull().references(() => families.id),
  collected_by_user_id: uuid('collected_by_user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  payment_month: date('payment_month').notNull(),  // YYYY-MM-01
  payment_method: paymentMethodEnum('payment_method').default('CASH').notNull(),
  utr_reference: text('utr_reference'),
  gateway_payment_id: text('gateway_payment_id'),
  payment_order_id: uuid('payment_order_id'),
  receipt_number: text('receipt_number').notNull(),  // unique per mahal
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const income_records = pgTable('income_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  category: text('category').notNull(),
  fund_type: fundTypeEnum('fund_type').default('GENERAL').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  payment_date: date('payment_date').notNull(),
  description: text('description'),
  description_ml: text('description_ml'),
  payer_name: text('payer_name'),
  payment_method: text('payment_method'),
  reference: text('reference'),
  receipt_key: text('receipt_key'),
  created_by_user_id: uuid('created_by_user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const expense_records = pgTable('expense_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  category: text('category').notNull(),
  fund_type: fundTypeEnum('fund_type').default('GENERAL').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  expense_date: date('expense_date').notNull(),
  description: text('description'),
  description_ml: text('description_ml'),
  payee_name: text('payee_name'),
  payment_method: text('payment_method'),
  reference: text('reference'),
  voucher_key: text('voucher_key'),
  created_by_user_id: uuid('created_by_user_id').notNull().references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payment_orders = pgTable('payment_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  family_id: uuid('family_id').notNull().references(() => families.id),
  user_id: uuid('user_id').notNull().references(() => users.id),
  razorpay_order_id: text('razorpay_order_id').unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('INR').notNull(),
  purpose: text('purpose').notNull(),  // PIRIVU/DONATION/MADRASA_FEE
  months_covered: date('months_covered').array(),
  idempotency_key: text('idempotency_key').unique().notNull(),
  status: paymentOrderStatusEnum('status').default('CREATED').notNull(),
  razorpay_response: text('razorpay_response'),  // stored as JSON string
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payment_transactions = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  mahal_id: uuid('mahal_id').notNull().references(() => mahals.id),
  payment_order_id: uuid('payment_order_id').notNull().references(() => payment_orders.id),
  razorpay_payment_id: text('razorpay_payment_id').unique(),
  amount_paid: decimal('amount_paid', { precision: 10, scale: 2 }),
  method: text('method'),
  vpa: text('vpa'),  // UPI VPA used
  webhook_received_at: timestamp('webhook_received_at', { withTimezone: true }),
  webhook_verified: boolean('webhook_verified').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});