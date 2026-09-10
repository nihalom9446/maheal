import {
  MadrasaFeeCategory,
  MadrasaStudentStatus,
  MadrasaTeacherDesignation,
  MadrasaTeacherStatus,
  MadrasaAttendanceStatus,
} from '../schemas/madrasa';
import { PaymentMethod } from '../constants';

export interface MadrasaStudentItem {
  id: string;
  mahal_id: string;
  member_id: string;
  student_name: string;
  student_name_ml?: string | null;
  gender?: 'M' | 'F' | null;
  date_of_birth?: string | null;
  board_admission_number?: string | null;
  class_level: number;
  enrollment_date: string;
  fee_category: MadrasaFeeCategory;
  monthly_fee: number;
  parent_consent_confirmed: boolean;
  parent_user_id?: string | null;
  status: MadrasaStudentStatus;
  family_id: string;
  family_number: string;
  house_name: string;
  house_name_ml?: string | null;
  ward_name?: string | null;
  ward_name_ml?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface MadrasaStudentDetail extends MadrasaStudentItem {
  attendance_stats: {
    total_days: number;
    present_days: number;
    absent_days: number;
    leave_days: number;
    percentage: number;
  };
  fee_status: {
    total_paid: number;
    last_paid_month?: string | null;
    paid_months: string[];
    recent_receipts: MadrasaFeeReceipt[];
  };
}

export interface MadrasaTeacherItem {
  id: string;
  mahal_id: string;
  member_id: string;
  teacher_name: string;
  teacher_name_ml?: string | null;
  phone?: string | null;
  designation: MadrasaTeacherDesignation;
  classes_assigned: number[];
  monthly_salary: number;
  joining_date: string;
  status: MadrasaTeacherStatus;
  family_id?: string | null;
  house_name?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface MadrasaAttendanceRecord {
  id: string;
  mahal_id: string;
  student_id: string;
  student_name: string;
  student_name_ml?: string | null;
  board_admission_number?: string | null;
  class_level: number;
  attendance_date: string;
  status: MadrasaAttendanceStatus;
  notes?: string | null;
  marked_by_user_id?: string | null;
  marked_by_name?: string | null;
  created_at: Date | string;
}

export interface MadrasaClassAttendanceItem {
  student_id: string;
  student_name: string;
  student_name_ml?: string | null;
  board_admission_number?: string | null;
  status: MadrasaAttendanceStatus | 'UNMARKED';
  notes?: string | null;
  record_id?: string | null;
}

export interface MadrasaMonthlyAttendanceStudentSummary {
  student_id: string;
  student_name: string;
  student_name_ml?: string | null;
  total_working_days: number;
  present_count: number;
  absent_count: number;
  leave_count: number;
  attendance_percentage: number;
  daily_statuses: Record<string, MadrasaAttendanceStatus>; // 'YYYY-MM-DD' -> status
}

export interface MadrasaFeeReceipt {
  id: string;
  mahal_id: string;
  student_id: string;
  student_name: string;
  student_name_ml?: string | null;
  class_level: number;
  parent_name?: string | null;
  parent_phone?: string | null;
  receipt_number: string;
  fee_months: string[]; // YYYY-MM-01 format
  amount_per_month: number;
  total_amount: number;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  collected_by_user_id: string;
  collected_by_name?: string | null;
  created_at: Date | string;
}

export interface MadrasaClassOverview {
  class_level: number;
  student_count: number;
  active_students: number;
  teacher_in_charge?: {
    id: string;
    name: string;
    designation: string;
  } | null;
  today_attendance_percentage?: number | null;
}

export interface MadrasaOverviewStats {
  total_students: number;
  total_active_students: number;
  total_teachers: number;
  active_teachers: number;
  today_attendance_percentage: number;
  today_total_marked: number;
  today_present_count: number;
  current_month_fee_collected: number;
  classes: MadrasaClassOverview[];
}
