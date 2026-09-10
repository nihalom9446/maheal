import type { INCOME_CATEGORIES, EXPENSE_CATEGORIES, FUND_TYPES, PAYMENT_METHODS } from '../constants';

export interface PirivuCollection {
  id: string;
  mahal_id: string;
  family_id: string;
  collected_by_user_id: string;
  amount: string;
  payment_month: string; // YYYY-MM-01
  payment_method: typeof PAYMENT_METHODS[number];
  utr_reference: string | null;
  gateway_payment_id: string | null;
  payment_order_id: string | null;
  receipt_number: string;
  notes: string | null;
  created_at: Date;
}

export interface IncomeRecord {
  id: string;
  mahal_id: string;
  category: typeof INCOME_CATEGORIES[number] | string;
  fund_type: typeof FUND_TYPES[number];
  amount: string;
  payment_date: string;
  description: string | null;
  description_ml: string | null;
  payer_name: string | null;
  payment_method: string | null;
  reference: string | null;
  receipt_key: string | null;
  created_by_user_id: string;
  created_at: Date;
}

export interface ExpenseRecord {
  id: string;
  mahal_id: string;
  category: typeof EXPENSE_CATEGORIES[number] | string;
  fund_type: typeof FUND_TYPES[number];
  amount: string;
  expense_date: string;
  description: string | null;
  description_ml: string | null;
  payee_name: string | null;
  payment_method: string | null;
  reference: string | null;
  voucher_key: string | null;
  created_by_user_id: string;
  created_at: Date;
}

export interface PirivuCollectionItem {
  id: string;
  mahal_id: string;
  family_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string | null;
  door_number: string | null;
  ward_id: string | null;
  ward_name: string | null;
  ward_name_ml: string | null;
  head_name: string | null;
  head_phone: string | null;
  collected_by_user_id: string;
  collected_by_name?: string | null;
  amount: string;
  payment_month: string;
  payment_method: typeof PAYMENT_METHODS[number];
  utr_reference: string | null;
  gateway_payment_id: string | null;
  receipt_number: string;
  notes: string | null;
  created_at: Date | string;
}

export interface FamilyPirivuMonthStatus {
  month: string; // YYYY-MM-01
  month_name: string; // 'January'
  status: 'PAID' | 'UNPAID';
  amount_paid: string | null;
  receipt_number: string | null;
  paid_date: Date | string | null;
  payment_method: string | null;
}

export interface FamilyPirivuStatus {
  family_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string | null;
  door_number: string | null;
  ward_id: string | null;
  ward_name: string | null;
  head_name: string | null;
  head_phone: string | null;
  pirivu_amount: string;
  year: number;
  monthly_status: FamilyPirivuMonthStatus[];
  total_paid_year: number;
  total_due_year: number;
  unpaid_months_count: number;
}

export interface PirivuArrearsItem {
  family_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string | null;
  door_number: string | null;
  ward_id: string | null;
  ward_name: string | null;
  ward_name_ml: string | null;
  head_name: string | null;
  head_phone: string | null;
  monthly_pirivu_amount: number;
  unpaid_months: string[]; // e.g. ['2026-01-01', '2026-02-01']
  unpaid_months_count: number;
  total_arrears: number;
  last_payment_month: string | null;
  last_payment_date: Date | string | null;
}

export interface IncomeListItem {
  id: string;
  mahal_id: string;
  category: typeof INCOME_CATEGORIES[number] | string;
  fund_type: typeof FUND_TYPES[number];
  amount: string;
  payment_date: string;
  description: string | null;
  description_ml: string | null;
  payer_name: string | null;
  payment_method: string | null;
  reference: string | null;
  receipt_key: string | null;
  created_by_user_id: string;
  created_by_name?: string | null;
  created_at: Date | string;
}

export interface ExpenseListItem {
  id: string;
  mahal_id: string;
  category: typeof EXPENSE_CATEGORIES[number] | string;
  fund_type: typeof FUND_TYPES[number];
  amount: string;
  expense_date: string;
  description: string | null;
  description_ml: string | null;
  payee_name: string | null;
  payment_method: string | null;
  reference: string | null;
  voucher_key: string | null;
  voucher_no?: string | null;
  created_by_user_id: string;
  created_by_name?: string | null;
  created_at: Date | string;
}

export interface FundSummary {
  fund_type: typeof FUND_TYPES[number];
  income: number;
  expense: number;
  net: number;
}

export interface RecentTransactionItem {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'PIRIVU';
  category: string;
  fund_type: typeof FUND_TYPES[number];
  amount: number;
  date: string;
  description: string | null;
  party_name: string | null;
  payment_method: string | null;
  reference?: string | null;
}

export interface FinancialSummaryDto {
  period: {
    year: number;
    month?: number;
    start_date: string;
    end_date: string;
    period_type: 'month' | 'year' | 'all';
  };
  total_income: number;
  total_expense: number;
  net_balance: number;
  funds: {
    GENERAL: FundSummary;
    ZAKAT: FundSummary;
    MADRASA: FundSummary;
  };
  comparison: {
    prev_month_income: number;
    prev_month_expense: number;
    income_change_percentage: number;
    expense_change_percentage: number;
  };
  pirivu: {
    total_expected: number;
    total_collected: number;
    collection_percentage: number;
    paying_families_count: number;
    total_families_count: number;
  };
  recent_transactions: RecentTransactionItem[];
}

export interface PirivuReceiptResponse {
  receipt_number: string;
  family_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string | null;
  door_number: string | null;
  head_name: string | null;
  head_phone: string | null;
  ward_name: string | null;
  ward_name_ml: string | null;
  payment_months: string[];
  amount_per_month: number;
  total_amount: number;
  payment_method: typeof PAYMENT_METHODS[number];
  utr_reference: string | null;
  notes: string | null;
  collected_at: Date | string;
  collection_ids: string[];
  income_record_id: string;
  collected_by_name?: string | null;
}

export type {
  PaymentOrderDto,
  PaymentOrderItem,
  PaymentTransactionItem,
  CreateOrderResponse,
  PaymentVerificationResult,
  PaymentStatusResponse,
} from './payment';