import type { PaymentPurpose, PaymentOrderStatus } from '../schemas/payment';

export interface PaymentOrderDto {
  id: string;
  mahal_id: string;
  family_id: string;
  user_id: string;
  razorpay_order_id: string | null;
  amount: string;
  currency: string;
  purpose: PaymentPurpose | string;
  months_covered: string[] | null;
  idempotency_key: string;
  status: PaymentOrderStatus;
  razorpay_response: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface PaymentOrderItem {
  id: string;
  mahal_id: string;
  family_id: string;
  family_number?: number;
  house_name?: string;
  house_name_ml?: string | null;
  user_id: string;
  user_name?: string | null;
  razorpay_order_id: string | null;
  amount: string;
  currency: string;
  purpose: PaymentPurpose | string;
  months_covered: string[] | null;
  status: PaymentOrderStatus;
  created_at: Date | string;
  updated_at: Date | string;
  transaction?: PaymentTransactionItem | null;
}

export interface PaymentTransactionItem {
  id: string;
  mahal_id: string;
  payment_order_id: string;
  razorpay_payment_id: string | null;
  amount_paid: string | null;
  method: string | null;
  vpa: string | null;
  webhook_received_at: Date | string | null;
  webhook_verified: boolean;
  created_at: Date | string;
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_order_id: string | null;
  amount: number;
  currency: string;
  purpose: string;
  key_id: string;
  is_mock: boolean;
  receipt?: string;
  notes?: string | null;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  order_id?: string;
  razorpay_payment_id?: string;
  status: PaymentOrderStatus;
  receipt_numbers?: string[];
  income_record_id?: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  razorpay_order_id: string | null;
  status: PaymentOrderStatus;
  amount: number;
  currency: string;
  purpose: string;
  months_covered: string[] | null;
  transaction?: PaymentTransactionItem | null;
  receipts?: string[];
}
