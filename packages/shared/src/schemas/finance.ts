import { z } from 'zod';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, FUND_TYPES, PAYMENT_METHODS } from '../constants';

export const recordPirivuSchema = z.object({
  family_id: z.string().uuid('Invalid family ID'),
  payment_months: z
    .array(z.string().regex(/^\d{4}-\d{2}-01$/, 'Must be YYYY-MM-01 format'))
    .min(1, 'At least one month must be selected')
    .max(60),
  amount_per_month: z.number().positive('Amount per month must be greater than 0'),
  payment_method: z.enum(PAYMENT_METHODS).default('CASH'),
  utr_reference: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const createIncomeSchema = z.object({
  category: z.enum(INCOME_CATEGORIES),
  fund_type: z.enum(FUND_TYPES).default('GENERAL'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  description: z.string().trim().optional().nullable(),
  description_ml: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((s) => (s ? s.normalize('NFC') : null)),
  payer_name: z.string().trim().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS).optional().nullable().default('CASH'),
  reference: z.string().trim().optional().nullable(),
});

export const updateIncomeSchema = z.object({
  category: z.enum(INCOME_CATEGORIES).optional(),
  fund_type: z.enum(FUND_TYPES).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  description: z.string().trim().optional().nullable(),
  description_ml: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((s) => (s ? s.normalize('NFC') : null)),
  payer_name: z.string().trim().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS).optional().nullable(),
  reference: z.string().trim().optional().nullable(),
});

export const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  fund_type: z.enum(FUND_TYPES).default('GENERAL'),
  amount: z.number().positive('Amount must be positive'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  description: z.string().trim().optional().nullable(),
  description_ml: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((s) => (s ? s.normalize('NFC') : null)),
  payee_name: z.string().trim().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS).optional().nullable().default('CASH'),
  reference: z.string().trim().optional().nullable(),
  voucher_no: z.string().trim().optional().nullable(),
});

export const updateExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  fund_type: z.enum(FUND_TYPES).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  description: z.string().trim().optional().nullable(),
  description_ml: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((s) => (s ? s.normalize('NFC') : null)),
  payee_name: z.string().trim().optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS).optional().nullable(),
  reference: z.string().trim().optional().nullable(),
  voucher_no: z.string().trim().optional().nullable(),
});

export const pirivuFilterSchema = z.object({
  family_id: z.string().uuid().optional(),
  ward_id: z.string().uuid().optional(),
  start_month: z.string().regex(/^\d{4}-\d{2}-01$/).optional(),
  end_month: z.string().regex(/^\d{4}-\d{2}-01$/).optional(),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export const incomeFilterSchema = z.object({
  category: z.enum(INCOME_CATEGORIES).optional(),
  fund_type: z.enum(FUND_TYPES).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export const expenseFilterSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  fund_type: z.enum(FUND_TYPES).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export const arrearsFilterSchema = z.object({
  ward_id: z.string().uuid().optional(),
  min_months: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const financeSummaryQuerySchema = z.object({
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  period: z.enum(['month', 'year', 'all']).default('month').optional(),
});

export type RecordPirivuDto = z.input<typeof recordPirivuSchema>;
export type CreateIncomeDto = z.input<typeof createIncomeSchema>;
export type UpdateIncomeDto = z.input<typeof updateIncomeSchema>;
export type CreateExpenseDto = z.input<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.input<typeof updateExpenseSchema>;
export type PirivuFilterDto = z.input<typeof pirivuFilterSchema>;
export type IncomeFilterDto = z.input<typeof incomeFilterSchema>;
export type ExpenseFilterDto = z.input<typeof expenseFilterSchema>;
export type ArrearsFilterDto = z.input<typeof arrearsFilterSchema>;
export type FinanceSummaryQueryDto = z.input<typeof financeSummaryQuerySchema>;

export {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  razorpayWebhookPayloadSchema,
  paymentOrderFilterSchema,
  paymentPurposeEnum,
  paymentOrderStatusSchema,
} from './payment';
export type {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  RazorpayWebhookPayload,
  PaymentOrderFilterDto,
  PaymentPurpose,
  PaymentOrderStatus,
} from './payment';