import { z } from 'zod';

export const paymentPurposeEnum = z.enum(['PIRIVU', 'DONATION', 'MADRASA_FEE']);
export type PaymentPurpose = z.infer<typeof paymentPurposeEnum>;

export const paymentOrderStatusSchema = z.enum([
  'CREATED',
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
]);
export type PaymentOrderStatus = z.infer<typeof paymentOrderStatusSchema>;

export const createPaymentOrderSchema = z.object({
  family_id: z.string().uuid('Invalid family ID'),
  purpose: paymentPurposeEnum.default('PIRIVU'),
  payment_months: z
    .array(z.string().regex(/^\d{4}-\d{2}-01$/, 'Must be YYYY-MM-01 format'))
    .optional()
    .default([]),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().trim().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});

export const razorpayWebhookPayloadSchema = z.object({
  entity: z.string().optional(),
  account_id: z.string().optional(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string().nullable().optional(),
          amount: z.number().or(z.string()),
          currency: z.string().default('INR'),
          status: z.string(),
          method: z.string().optional().nullable(),
          vpa: z.string().optional().nullable(),
          email: z.string().optional().nullable(),
          contact: z.string().optional().nullable(),
          notes: z.record(z.any()).optional().nullable(),
          created_at: z.number().optional(),
        }),
      })
      .optional(),
    order: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number().or(z.string()),
          currency: z.string().default('INR'),
          status: z.string().optional(),
          receipt: z.string().optional().nullable(),
          notes: z.record(z.any()).optional().nullable(),
        }),
      })
      .optional(),
  }),
  created_at: z.number().optional(),
});

export const paymentOrderFilterSchema = z.object({
  family_id: z.string().uuid().optional(),
  status: paymentOrderStatusSchema.optional(),
  purpose: paymentPurposeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePaymentOrderDto = z.input<typeof createPaymentOrderSchema>;
export type VerifyPaymentDto = z.input<typeof verifyPaymentSchema>;
export type RazorpayWebhookPayload = z.infer<typeof razorpayWebhookPayloadSchema>;
export type PaymentOrderFilterDto = z.input<typeof paymentOrderFilterSchema>;
