import { z } from 'zod';

export const MADRASA_FEE_CATEGORIES = ['FULL', 'CONCESSION', 'EXEMPT'] as const;
export type MadrasaFeeCategory = typeof MADRASA_FEE_CATEGORIES[number];

export const MADRASA_STUDENT_STATUSES = ['ACTIVE', 'INACTIVE', 'GRADUATED'] as const;
export type MadrasaStudentStatus = typeof MADRASA_STUDENT_STATUSES[number];

export const MADRASA_TEACHER_DESIGNATIONS = ['SADAR_MUALLIM', 'MUALLIM', 'ASSISTANT'] as const;
export type MadrasaTeacherDesignation = typeof MADRASA_TEACHER_DESIGNATIONS[number];

export const MADRASA_TEACHER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type MadrasaTeacherStatus = typeof MADRASA_TEACHER_STATUSES[number];

export const MADRASA_ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LEAVE'] as const;
export type MadrasaAttendanceStatus = typeof MADRASA_ATTENDANCE_STATUSES[number];

export const enrollStudentSchema = z.object({
  member_id: z.string().uuid('Valid family member ID is required'),
  board_admission_number: z.string().optional().nullable(),
  class_level: z.coerce.number().int().min(1, 'Class level must be at least 1').max(10, 'Class level cannot exceed 10'),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid enrollment date in YYYY-MM-DD format is required'),
  fee_category: z.enum(MADRASA_FEE_CATEGORIES).default('FULL'),
  monthly_fee: z.coerce.number().min(0, 'Monthly fee cannot be negative').default(0),
  parent_consent_confirmed: z.boolean().refine((val) => val === true, {
    message: 'Parental consent must be explicitly confirmed under DPDPA 2023',
  }),
  parent_user_id: z.string().uuid('Valid parent user ID is required').optional().nullable(),
});

export const updateStudentSchema = z.object({
  board_admission_number: z.string().optional().nullable(),
  class_level: z.coerce.number().int().min(1).max(10).optional(),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fee_category: z.enum(MADRASA_FEE_CATEGORIES).optional(),
  monthly_fee: z.coerce.number().min(0).optional(),
  parent_consent_confirmed: z.boolean().optional(),
  parent_user_id: z.string().uuid().optional().nullable(),
  status: z.enum(MADRASA_STUDENT_STATUSES).optional(),
});

export const studentFilterSchema = z.object({
  class_level: z.coerce.number().int().min(1).max(10).optional(),
  status: z.enum(MADRASA_STUDENT_STATUSES).optional(),
  fee_category: z.enum(MADRASA_FEE_CATEGORIES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createTeacherSchema = z.object({
  member_id: z.string().uuid('Valid family member ID is required'),
  designation: z.enum(MADRASA_TEACHER_DESIGNATIONS).default('MUALLIM'),
  classes_assigned: z.array(z.coerce.number().int().min(1).max(10)).min(1, 'At least one class must be assigned (1-10)'),
  monthly_salary: z.coerce.number().positive('Monthly salary must be greater than 0'),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid joining date in YYYY-MM-DD format is required'),
});

export const updateTeacherSchema = z.object({
  designation: z.enum(MADRASA_TEACHER_DESIGNATIONS).optional(),
  classes_assigned: z.array(z.coerce.number().int().min(1).max(10)).optional(),
  monthly_salary: z.coerce.number().positive().optional(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(MADRASA_TEACHER_STATUSES).optional(),
});

export const teacherFilterSchema = z.object({
  designation: z.enum(MADRASA_TEACHER_DESIGNATIONS).optional(),
  status: z.enum(MADRASA_TEACHER_STATUSES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const attendanceRecordItemSchema = z.object({
  student_id: z.string().uuid('Valid student ID is required'),
  status: z.enum(MADRASA_ATTENDANCE_STATUSES),
  notes: z.string().optional().nullable(),
});

export const markAttendanceSchema = z.object({
  class_level: z.coerce.number().int().min(1).max(10),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid attendance date in YYYY-MM-DD format is required'),
  records: z.array(attendanceRecordItemSchema).min(1, 'At least one student record is required'),
});

export const attendanceQuerySchema = z.object({
  class_level: z.coerce.number().int().min(1).max(10).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const collectMadrasaFeeSchema = z.object({
  student_id: z.string().uuid('Valid student ID is required'),
  fee_months: z.array(z.string().regex(/^\d{4}-\d{2}-01$/, 'Month format must be YYYY-MM-01')).min(1, 'At least one fee month is required'),
  amount_per_month: z.coerce.number().positive('Amount per month must be greater than 0'),
  payment_method: z.enum(['CASH', 'MANUAL_UPI', 'GATEWAY', 'BANK_TRANSFER']).default('CASH'),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const madrasaFeeFilterSchema = z.object({
  student_id: z.string().uuid().optional(),
  class_level: z.coerce.number().int().min(1).max(10).optional(),
  fee_month: z.string().regex(/^\d{4}-\d{2}-01$/).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EnrollStudentDto = z.infer<typeof enrollStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type StudentFilterDto = z.infer<typeof studentFilterSchema>;
export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
export type TeacherFilterDto = z.infer<typeof teacherFilterSchema>;
export type AttendanceRecordItemDto = z.infer<typeof attendanceRecordItemSchema>;
export type MarkAttendanceDto = z.infer<typeof markAttendanceSchema>;
export type AttendanceQueryDto = z.infer<typeof attendanceQuerySchema>;
export type CollectMadrasaFeeDto = z.infer<typeof collectMadrasaFeeSchema>;
export type MadrasaFeeFilterDto = z.infer<typeof madrasaFeeFilterSchema>;
