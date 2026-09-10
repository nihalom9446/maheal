import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { eq, and, or, ilike, sql, desc, asc, count, gte, lte } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  madrasa_students,
  madrasa_teachers,
  madrasa_attendance,
  madrasa_fee_collections,
  income_records,
  family_members,
  families,
  wards,
  users,
} from '../../database/schema';
import type {
  EnrollStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherFilterDto,
  MarkAttendanceDto,
  CollectMadrasaFeeDto,
  MadrasaFeeFilterDto,
  MadrasaStudentItem,
  MadrasaStudentDetail,
  MadrasaTeacherItem,
  MadrasaAttendanceRecord,
  MadrasaClassAttendanceItem,
  MadrasaMonthlyAttendanceStudentSummary,
  MadrasaFeeReceipt,
  MadrasaOverviewStats,
  MadrasaClassOverview,
  PaymentMethod,
} from '@maheall/shared';

@Injectable()
export class MadrasaService {
  private readonly logger = new Logger(MadrasaService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  /**
   * Helper to format a Date as YYYY-MM-DD
   */
  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate sequential receipt number in format MAD-REC-YYYYMM-XXXX
   */
  private async generateReceiptNumber(mahalId: string, date: Date = new Date()): Promise<string> {
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `MAD-REC-${yearMonth}-`;

    const latest = await this.db
      .select({ receipt_number: madrasa_fee_collections.receipt_number })
      .from(madrasa_fee_collections)
      .where(
        and(
          eq(madrasa_fee_collections.mahal_id, mahalId),
          ilike(madrasa_fee_collections.receipt_number, `${prefix}%`),
        ),
      )
      .orderBy(desc(madrasa_fee_collections.receipt_number))
      .limit(1);

    let nextSeq = 1;
    if (latest.length > 0 && latest[0].receipt_number) {
      const match = latest[0].receipt_number.match(/MAD-REC-\d{6}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  // ===========================================================================
  // 1. STUDENT MANAGEMENT
  // ===========================================================================

  async enrollStudent(
    mahalId: string,
    dto: EnrollStudentDto,
    userId?: string,
  ): Promise<MadrasaStudentItem> {
    // 1. Verify DPDPA 2023 Parental Consent
    if (!dto.parent_consent_confirmed) {
      throw new BadRequestException(
        'DPDPA 2023 compliance requires explicit parental consent to process minor student data.',
      );
    }

    // 2. Verify family member exists in this mahal
    const [member] = await this.db
      .select({
        id: family_members.id,
        mahal_id: family_members.mahal_id,
        family_id: family_members.family_id,
        name: family_members.name,
        name_ml: family_members.name_ml,
        gender: family_members.gender,
        date_of_birth: family_members.date_of_birth,
        status: family_members.status,
      })
      .from(family_members)
      .where(and(eq(family_members.id, dto.member_id), eq(family_members.mahal_id, mahalId)))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Family member not found in this Mahal');
    }

    // 3. Check if student is already enrolled with ACTIVE status
    const existing = await this.db
      .select({ id: madrasa_students.id })
      .from(madrasa_students)
      .where(
        and(
          eq(madrasa_students.mahal_id, mahalId),
          eq(madrasa_students.member_id, dto.member_id),
          eq(madrasa_students.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('This member is already actively enrolled in the Madrasa.');
    }

    // 4. Insert student
    const [student] = await this.db
      .insert(madrasa_students)
      .values({
        mahal_id: mahalId,
        member_id: dto.member_id,
        board_admission_number: dto.board_admission_number || null,
        class_level: dto.class_level,
        enrollment_date: dto.enrollment_date,
        fee_category: dto.fee_category || 'FULL',
        monthly_fee: String(dto.monthly_fee ?? 0),
        parent_consent_confirmed: true,
        parent_consent_timestamp: new Date(),
        parent_user_id: dto.parent_user_id || null,
        status: 'ACTIVE',
      })
      .returning();

    return this.getStudentItemById(mahalId, student.id);
  }

  async listStudents(
    mahalId: string,
    filters: StudentFilterDto,
  ): Promise<{ items: MadrasaStudentItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(madrasa_students.mahal_id, mahalId)];

    if (filters.class_level !== undefined) {
      conditions.push(eq(madrasa_students.class_level, filters.class_level));
    }
    if (filters.status) {
      conditions.push(eq(madrasa_students.status, filters.status));
    }
    if (filters.fee_category) {
      conditions.push(eq(madrasa_students.fee_category, filters.fee_category));
    }
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(family_members.name, term),
          ilike(family_members.name_ml, term),
          ilike(madrasa_students.board_admission_number, term),
          ilike(families.house_name, term),
          ilike(families.family_number, term),
          ilike(family_members.phone, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(madrasa_students)
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .innerJoin(families, eq(family_members.family_id, families.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        id: madrasa_students.id,
        mahal_id: madrasa_students.mahal_id,
        member_id: madrasa_students.member_id,
        student_name: family_members.name,
        student_name_ml: family_members.name_ml,
        gender: family_members.gender,
        date_of_birth: family_members.date_of_birth,
        board_admission_number: madrasa_students.board_admission_number,
        class_level: madrasa_students.class_level,
        enrollment_date: madrasa_students.enrollment_date,
        fee_category: madrasa_students.fee_category,
        monthly_fee: madrasa_students.monthly_fee,
        parent_consent_confirmed: madrasa_students.parent_consent_confirmed,
        parent_user_id: madrasa_students.parent_user_id,
        status: madrasa_students.status,
        family_id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        ward_id: families.ward_id,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        parent_name: sql<string>`(
          SELECT fm.name FROM family_members fm 
          WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        parent_phone: sql<string>`(
          SELECT fm.phone FROM family_members fm 
          WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        created_at: madrasa_students.created_at,
        updated_at: madrasa_students.updated_at,
      })
      .from(madrasa_students)
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .innerJoin(families, eq(family_members.family_id, families.id))
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(whereClause)
      .orderBy(asc(madrasa_students.class_level), asc(family_members.name))
      .limit(limit)
      .offset(offset);

    const items: MadrasaStudentItem[] = rows.map((r) => ({
      ...r,
      family_number: String(r.family_number),
      fee_category: r.fee_category as 'FULL' | 'CONCESSION' | 'EXEMPT',
      status: r.status as 'ACTIVE' | 'INACTIVE' | 'GRADUATED',
      monthly_fee: Number(r.monthly_fee || 0),
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async getStudentItemById(mahalId: string, id: string): Promise<MadrasaStudentItem> {
    const rows = await this.db
      .select({
        id: madrasa_students.id,
        mahal_id: madrasa_students.mahal_id,
        member_id: madrasa_students.member_id,
        student_name: family_members.name,
        student_name_ml: family_members.name_ml,
        gender: family_members.gender,
        date_of_birth: family_members.date_of_birth,
        board_admission_number: madrasa_students.board_admission_number,
        class_level: madrasa_students.class_level,
        enrollment_date: madrasa_students.enrollment_date,
        fee_category: madrasa_students.fee_category,
        monthly_fee: madrasa_students.monthly_fee,
        parent_consent_confirmed: madrasa_students.parent_consent_confirmed,
        parent_user_id: madrasa_students.parent_user_id,
        status: madrasa_students.status,
        family_id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        ward_id: families.ward_id,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        parent_name: sql<string>`(
          SELECT fm.name FROM family_members fm 
          WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        parent_phone: sql<string>`(
          SELECT fm.phone FROM family_members fm 
          WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        created_at: madrasa_students.created_at,
        updated_at: madrasa_students.updated_at,
      })
      .from(madrasa_students)
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .innerJoin(families, eq(family_members.family_id, families.id))
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(and(eq(madrasa_students.id, id), eq(madrasa_students.mahal_id, mahalId)))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('Madrasa student not found');
    }

    const r = rows[0];
    return {
      ...r,
      family_number: String(r.family_number),
      fee_category: r.fee_category as 'FULL' | 'CONCESSION' | 'EXEMPT',
      status: r.status as 'ACTIVE' | 'INACTIVE' | 'GRADUATED',
      monthly_fee: Number(r.monthly_fee || 0),
    };
  }

  async getStudent(mahalId: string, id: string): Promise<MadrasaStudentDetail> {
    const student = await this.getStudentItemById(mahalId, id);

    // 1. Attendance statistics
    const attendanceRecords = await this.db
      .select({
        status: madrasa_attendance.status,
      })
      .from(madrasa_attendance)
      .where(
        and(
          eq(madrasa_attendance.mahal_id, mahalId),
          eq(madrasa_attendance.student_id, id),
        ),
      );

    const totalDays = attendanceRecords.length;
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    for (const rec of attendanceRecords) {
      if (rec.status === 'PRESENT') presentDays++;
      else if (rec.status === 'ABSENT') absentDays++;
      else if (rec.status === 'LEAVE') leaveDays++;
    }

    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // 2. Fee status & collections
    const feeRecords = await this.db
      .select({
        id: madrasa_fee_collections.id,
        receipt_number: madrasa_fee_collections.receipt_number,
        fee_months: madrasa_fee_collections.fee_months,
        amount_per_month: madrasa_fee_collections.amount_per_month,
        total_amount: madrasa_fee_collections.total_amount,
        payment_method: madrasa_fee_collections.payment_method,
        reference: madrasa_fee_collections.reference,
        notes: madrasa_fee_collections.notes,
        collected_by_user_id: madrasa_fee_collections.collected_by_user_id,
        collector_name: users.name,
        created_at: madrasa_fee_collections.created_at,
      })
      .from(madrasa_fee_collections)
      .leftJoin(users, eq(madrasa_fee_collections.collected_by_user_id, users.id))
      .where(
        and(
          eq(madrasa_fee_collections.mahal_id, mahalId),
          eq(madrasa_fee_collections.student_id, id),
        ),
      )
      .orderBy(desc(madrasa_fee_collections.created_at));

    let totalPaid = 0;
    const paidMonthsSet = new Set<string>();
    const recentReceipts: MadrasaFeeReceipt[] = [];

    for (const rec of feeRecords) {
      totalPaid += Number(rec.total_amount || 0);
      if (Array.isArray(rec.fee_months)) {
        rec.fee_months.forEach((m) => paidMonthsSet.add(m));
      }
      recentReceipts.push({
        id: rec.id,
        mahal_id: mahalId,
        student_id: id,
        student_name: student.student_name,
        student_name_ml: student.student_name_ml,
        class_level: student.class_level,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        receipt_number: rec.receipt_number,
        fee_months: rec.fee_months || [],
        amount_per_month: Number(rec.amount_per_month || 0),
        total_amount: Number(rec.total_amount || 0),
        payment_method: rec.payment_method as PaymentMethod,
        reference: rec.reference,
        notes: rec.notes,
        collected_by_user_id: rec.collected_by_user_id,
        collected_by_name: rec.collector_name || 'Admin',
        created_at: rec.created_at,
      });
    }

    const paidMonths = Array.from(paidMonthsSet).sort();
    const lastPaidMonth = paidMonths.length > 0 ? paidMonths[paidMonths.length - 1] : null;

    return {
      ...student,
      attendance_stats: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        leave_days: leaveDays,
        percentage: attendancePercentage,
      },
      fee_status: {
        total_paid: totalPaid,
        last_paid_month: lastPaidMonth,
        paid_months: paidMonths,
        recent_receipts: recentReceipts.slice(0, 10),
      },
    };
  }

  async updateStudent(
    mahalId: string,
    id: string,
    dto: UpdateStudentDto,
  ): Promise<MadrasaStudentItem> {
    const existing = await this.getStudentItemById(mahalId, id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (dto.board_admission_number !== undefined) {
      updateData.board_admission_number = dto.board_admission_number || null;
    }
    if (dto.class_level !== undefined) {
      updateData.class_level = dto.class_level;
    }
    if (dto.enrollment_date !== undefined) {
      updateData.enrollment_date = dto.enrollment_date;
    }
    if (dto.fee_category !== undefined) {
      updateData.fee_category = dto.fee_category;
    }
    if (dto.monthly_fee !== undefined) {
      updateData.monthly_fee = String(dto.monthly_fee);
    }
    if (dto.parent_user_id !== undefined) {
      updateData.parent_user_id = dto.parent_user_id || null;
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    await this.db
      .update(madrasa_students)
      .set(updateData)
      .where(and(eq(madrasa_students.id, id), eq(madrasa_students.mahal_id, mahalId)));

    return this.getStudentItemById(mahalId, id);
  }

  async deleteStudent(mahalId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.getStudentItemById(mahalId, id);

    await this.db
      .update(madrasa_students)
      .set({
        status: 'INACTIVE',
        updated_at: new Date(),
      })
      .where(and(eq(madrasa_students.id, id), eq(madrasa_students.mahal_id, mahalId)));

    return {
      success: true,
      message: 'Student marked as inactive in Madrasa.',
    };
  }

  // ===========================================================================
  // 2. TEACHER MANAGEMENT
  // ===========================================================================

  async createTeacher(
    mahalId: string,
    dto: CreateTeacherDto,
    userId?: string,
  ): Promise<MadrasaTeacherItem> {
    // 1. Verify member exists in mahal
    const [member] = await this.db
      .select({
        id: family_members.id,
        name: family_members.name,
      })
      .from(family_members)
      .where(and(eq(family_members.id, dto.member_id), eq(family_members.mahal_id, mahalId)))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Family member not found in this Mahal');
    }

    // 2. Check if active teacher already exists for this member
    const existing = await this.db
      .select({ id: madrasa_teachers.id })
      .from(madrasa_teachers)
      .where(
        and(
          eq(madrasa_teachers.mahal_id, mahalId),
          eq(madrasa_teachers.member_id, dto.member_id),
          eq(madrasa_teachers.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('This member is already an active Madrasa teacher.');
    }

    const [teacher] = await this.db
      .insert(madrasa_teachers)
      .values({
        mahal_id: mahalId,
        member_id: dto.member_id,
        designation: dto.designation || 'MUALLIM',
        classes_assigned: dto.classes_assigned,
        monthly_salary: String(dto.monthly_salary),
        joining_date: dto.joining_date,
        status: 'ACTIVE',
      })
      .returning();

    return this.getTeacherById(mahalId, teacher.id);
  }

  async listTeachers(
    mahalId: string,
    filters: TeacherFilterDto,
  ): Promise<{ items: MadrasaTeacherItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(madrasa_teachers.mahal_id, mahalId)];

    if (filters.designation) {
      conditions.push(eq(madrasa_teachers.designation, filters.designation));
    }
    if (filters.status) {
      conditions.push(eq(madrasa_teachers.status, filters.status));
    }
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(family_members.name, term),
          ilike(family_members.name_ml, term),
          ilike(family_members.phone, term),
          ilike(families.house_name, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(madrasa_teachers)
      .innerJoin(family_members, eq(madrasa_teachers.member_id, family_members.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        id: madrasa_teachers.id,
        mahal_id: madrasa_teachers.mahal_id,
        member_id: madrasa_teachers.member_id,
        teacher_name: family_members.name,
        teacher_name_ml: family_members.name_ml,
        phone: family_members.phone,
        designation: madrasa_teachers.designation,
        classes_assigned: madrasa_teachers.classes_assigned,
        monthly_salary: madrasa_teachers.monthly_salary,
        joining_date: madrasa_teachers.joining_date,
        status: madrasa_teachers.status,
        family_id: family_members.family_id,
        house_name: families.house_name,
        created_at: madrasa_teachers.created_at,
        updated_at: madrasa_teachers.updated_at,
      })
      .from(madrasa_teachers)
      .innerJoin(family_members, eq(madrasa_teachers.member_id, family_members.id))
      .leftJoin(families, eq(family_members.family_id, families.id))
      .where(whereClause)
      .orderBy(asc(madrasa_teachers.status), asc(family_members.name))
      .limit(limit)
      .offset(offset);

    const items: MadrasaTeacherItem[] = rows.map((r) => ({
      ...r,
      designation: r.designation as 'SADAR_MUALLIM' | 'MUALLIM' | 'ASSISTANT',
      status: r.status as 'ACTIVE' | 'INACTIVE',
      monthly_salary: Number(r.monthly_salary || 0),
      classes_assigned: r.classes_assigned || [],
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTeacherById(mahalId: string, id: string): Promise<MadrasaTeacherItem> {
    const rows = await this.db
      .select({
        id: madrasa_teachers.id,
        mahal_id: madrasa_teachers.mahal_id,
        member_id: madrasa_teachers.member_id,
        teacher_name: family_members.name,
        teacher_name_ml: family_members.name_ml,
        phone: family_members.phone,
        designation: madrasa_teachers.designation,
        classes_assigned: madrasa_teachers.classes_assigned,
        monthly_salary: madrasa_teachers.monthly_salary,
        joining_date: madrasa_teachers.joining_date,
        status: madrasa_teachers.status,
        family_id: family_members.family_id,
        house_name: families.house_name,
        created_at: madrasa_teachers.created_at,
        updated_at: madrasa_teachers.updated_at,
      })
      .from(madrasa_teachers)
      .innerJoin(family_members, eq(madrasa_teachers.member_id, family_members.id))
      .leftJoin(families, eq(family_members.family_id, families.id))
      .where(and(eq(madrasa_teachers.id, id), eq(madrasa_teachers.mahal_id, mahalId)))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('Madrasa teacher not found');
    }

    const r = rows[0];
    return {
      ...r,
      designation: r.designation as 'SADAR_MUALLIM' | 'MUALLIM' | 'ASSISTANT',
      status: r.status as 'ACTIVE' | 'INACTIVE',
      monthly_salary: Number(r.monthly_salary || 0),
      classes_assigned: r.classes_assigned || [],
    };
  }

  async updateTeacher(
    mahalId: string,
    id: string,
    dto: UpdateTeacherDto,
  ): Promise<MadrasaTeacherItem> {
    await this.getTeacherById(mahalId, id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (dto.designation !== undefined) {
      updateData.designation = dto.designation;
    }
    if (dto.classes_assigned !== undefined) {
      updateData.classes_assigned = dto.classes_assigned;
    }
    if (dto.monthly_salary !== undefined) {
      updateData.monthly_salary = String(dto.monthly_salary);
    }
    if (dto.joining_date !== undefined) {
      updateData.joining_date = dto.joining_date;
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    await this.db
      .update(madrasa_teachers)
      .set(updateData)
      .where(and(eq(madrasa_teachers.id, id), eq(madrasa_teachers.mahal_id, mahalId)));

    return this.getTeacherById(mahalId, id);
  }

  async deleteTeacher(mahalId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.getTeacherById(mahalId, id);

    await this.db
      .update(madrasa_teachers)
      .set({
        status: 'INACTIVE',
        updated_at: new Date(),
      })
      .where(and(eq(madrasa_teachers.id, id), eq(madrasa_teachers.mahal_id, mahalId)));

    return {
      success: true,
      message: 'Teacher set to inactive status.',
    };
  }

  // ===========================================================================
  // 3. ATTENDANCE MANAGEMENT
  // ===========================================================================

  async markAttendance(
    mahalId: string,
    dto: MarkAttendanceDto,
    userId?: string,
  ): Promise<{ success: boolean; count: number; date: string; class_level: number }> {
    if (!dto.records || dto.records.length === 0) {
      throw new BadRequestException('No student attendance records provided');
    }

    await this.db.transaction(async (tx) => {
      for (const rec of dto.records) {
        // Check if attendance already exists for this student on this date
        const existing = await tx
          .select({ id: madrasa_attendance.id })
          .from(madrasa_attendance)
          .where(
            and(
              eq(madrasa_attendance.mahal_id, mahalId),
              eq(madrasa_attendance.student_id, rec.student_id),
              eq(madrasa_attendance.attendance_date, dto.date),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(madrasa_attendance)
            .set({
              class_level: dto.class_level,
              status: rec.status,
              notes: rec.notes || null,
              marked_by_user_id: userId || null,
              updated_at: new Date(),
            })
            .where(eq(madrasa_attendance.id, existing[0].id));
        } else {
          await tx.insert(madrasa_attendance).values({
            mahal_id: mahalId,
            student_id: rec.student_id,
            class_level: dto.class_level,
            attendance_date: dto.date,
            status: rec.status,
            notes: rec.notes || null,
            marked_by_user_id: userId || null,
          });
        }
      }
    });

    return {
      success: true,
      count: dto.records.length,
      date: dto.date,
      class_level: dto.class_level,
    };
  }

  async getAttendanceForClass(
    mahalId: string,
    classLevel: number,
    date: string,
  ): Promise<MadrasaClassAttendanceItem[]> {
    // 1. Fetch active students in this class
    const students = await this.db
      .select({
        student_id: madrasa_students.id,
        student_name: family_members.name,
        student_name_ml: family_members.name_ml,
        board_admission_number: madrasa_students.board_admission_number,
      })
      .from(madrasa_students)
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .where(
        and(
          eq(madrasa_students.mahal_id, mahalId),
          eq(madrasa_students.class_level, classLevel),
          eq(madrasa_students.status, 'ACTIVE'),
        ),
      )
      .orderBy(asc(family_members.name));

    // 2. Fetch attendance records for this class & date
    const existingRecords = await this.db
      .select({
        id: madrasa_attendance.id,
        student_id: madrasa_attendance.student_id,
        status: madrasa_attendance.status,
        notes: madrasa_attendance.notes,
      })
      .from(madrasa_attendance)
      .where(
        and(
          eq(madrasa_attendance.mahal_id, mahalId),
          eq(madrasa_attendance.class_level, classLevel),
          eq(madrasa_attendance.attendance_date, date),
        ),
      );

    const recordMap = new Map<string, { id: string; status: 'PRESENT' | 'ABSENT' | 'LEAVE'; notes?: string | null }>();
    for (const r of existingRecords) {
      recordMap.set(r.student_id, {
        id: r.id,
        status: r.status as 'PRESENT' | 'ABSENT' | 'LEAVE',
        notes: r.notes,
      });
    }

    return students.map((s) => {
      const rec = recordMap.get(s.student_id);
      return {
        student_id: s.student_id,
        student_name: s.student_name,
        student_name_ml: s.student_name_ml,
        board_admission_number: s.board_admission_number,
        status: rec ? rec.status : 'UNMARKED',
        notes: rec?.notes || null,
        record_id: rec?.id || null,
      };
    });
  }

  async getAttendanceMonthlySummary(
    mahalId: string,
    classLevel: number,
    month: string, // YYYY-MM
  ): Promise<MadrasaMonthlyAttendanceStudentSummary[]> {
    const students = await this.db
      .select({
        student_id: madrasa_students.id,
        student_name: family_members.name,
        student_name_ml: family_members.name_ml,
      })
      .from(madrasa_students)
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .where(
        and(
          eq(madrasa_students.mahal_id, mahalId),
          eq(madrasa_students.class_level, classLevel),
          eq(madrasa_students.status, 'ACTIVE'),
        ),
      )
      .orderBy(asc(family_members.name));

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const records = await this.db
      .select({
        student_id: madrasa_attendance.student_id,
        attendance_date: madrasa_attendance.attendance_date,
        status: madrasa_attendance.status,
      })
      .from(madrasa_attendance)
      .where(
        and(
          eq(madrasa_attendance.mahal_id, mahalId),
          eq(madrasa_attendance.class_level, classLevel),
          gte(madrasa_attendance.attendance_date, startDate),
          lte(madrasa_attendance.attendance_date, endDate),
        ),
      );

    // Collect distinct dates
    const workingDates = new Set<string>();
    records.forEach((r) => workingDates.add(r.attendance_date));
    const totalWorkingDays = workingDates.size;

    // Student stats
    const studentMap = new Map<
      string,
      {
        present: number;
        absent: number;
        leave: number;
        daily: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'>;
      }
    >();

    for (const r of records) {
      if (!studentMap.has(r.student_id)) {
        studentMap.set(r.student_id, {
          present: 0,
          absent: 0,
          leave: 0,
          daily: {},
        });
      }
      const data = studentMap.get(r.student_id)!;
      data.daily[r.attendance_date] = r.status as 'PRESENT' | 'ABSENT' | 'LEAVE';
      if (r.status === 'PRESENT') data.present++;
      else if (r.status === 'ABSENT') data.absent++;
      else if (r.status === 'LEAVE') data.leave++;
    }

    return students.map((s) => {
      const data = studentMap.get(s.student_id) || {
        present: 0,
        absent: 0,
        leave: 0,
        daily: {},
      };

      const attendancePercentage =
        totalWorkingDays > 0 ? Math.round((data.present / totalWorkingDays) * 100) : 100;

      return {
        student_id: s.student_id,
        student_name: s.student_name,
        student_name_ml: s.student_name_ml,
        total_working_days: totalWorkingDays,
        present_count: data.present,
        absent_count: data.absent,
        leave_count: data.leave,
        attendance_percentage: attendancePercentage,
        daily_statuses: data.daily,
      };
    });
  }

  // ===========================================================================
  // 4. FEE COLLECTION
  // ===========================================================================

  async collectFee(
    mahalId: string,
    dto: CollectMadrasaFeeDto,
    userId: string,
  ): Promise<MadrasaFeeReceipt> {
    if (!dto.fee_months || dto.fee_months.length === 0) {
      throw new BadRequestException('At least one fee month must be selected');
    }

    return await this.db.transaction(async (tx) => {
      // 1. Get student detail
      const [student] = await tx
        .select({
          id: madrasa_students.id,
          mahal_id: madrasa_students.mahal_id,
          class_level: madrasa_students.class_level,
          status: madrasa_students.status,
          student_name: family_members.name,
          student_name_ml: family_members.name_ml,
          family_id: families.id,
          parent_name: sql<string>`(
            SELECT fm.name FROM family_members fm 
            WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
            LIMIT 1
          )`,
          parent_phone: sql<string>`(
            SELECT fm.phone FROM family_members fm 
            WHERE fm.family_id = ${families.id} AND fm.relationship_to_head = 'HEAD' 
            LIMIT 1
          )`,
        })
        .from(madrasa_students)
        .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
        .innerJoin(families, eq(family_members.family_id, families.id))
        .where(
          and(
            eq(madrasa_students.id, dto.student_id),
            eq(madrasa_students.mahal_id, mahalId),
          ),
        )
        .limit(1);

      if (!student) {
        throw new NotFoundException('Madrasa student not found in this Mahal');
      }

      // 2. Generate sequential receipt number
      const now = new Date();
      const receiptNumber = await this.generateReceiptNumber(mahalId, now);

      const totalAmount = dto.fee_months.length * dto.amount_per_month;
      const todayStr = this.formatDate(now);

      // 3. Insert into madrasa_fee_collections
      const [collection] = await tx
        .insert(madrasa_fee_collections)
        .values({
          mahal_id: mahalId,
          student_id: dto.student_id,
          receipt_number: receiptNumber,
          fee_months: dto.fee_months,
          amount_per_month: String(dto.amount_per_month),
          total_amount: String(totalAmount),
          payment_method: dto.payment_method || 'CASH',
          reference: dto.reference || null,
          notes: dto.notes || null,
          collected_by_user_id: userId,
        })
        .returning();

      // 4. Insert into income_records automatically (Category: MADRASA_FEES, Fund: MADRASA)
      const monthsDesc = dto.fee_months.join(', ');
      await tx.insert(income_records).values({
        mahal_id: mahalId,
        category: 'MADRASA_FEES',
        fund_type: 'MADRASA',
        amount: String(totalAmount),
        payment_date: todayStr,
        description: `Madrasa Fee - Class ${student.class_level} - ${student.student_name} (${monthsDesc})`,
        description_ml: `മദ്രസ ഫീസ് - ക്ലാസ് ${student.class_level} - ${student.student_name_ml || student.student_name} (${monthsDesc})`,
        payer_name: student.student_name,
        payment_method: dto.payment_method || 'CASH',
        reference: dto.reference || receiptNumber,
        receipt_key: receiptNumber,
        created_by_user_id: userId,
      });

      // Get collector name
      const [collector] = await tx
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return {
        id: collection.id,
        mahal_id: mahalId,
        student_id: student.id,
        student_name: student.student_name,
        student_name_ml: student.student_name_ml,
        class_level: student.class_level,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        receipt_number: receiptNumber,
        fee_months: dto.fee_months,
        amount_per_month: dto.amount_per_month,
        total_amount: totalAmount,
        payment_method: dto.payment_method as PaymentMethod,
        reference: dto.reference,
        notes: dto.notes,
        collected_by_user_id: userId,
        collected_by_name: collector?.name || 'Administrator',
        created_at: collection.created_at,
      };
    });
  }

  async listFeeCollections(
    mahalId: string,
    filters: MadrasaFeeFilterDto,
  ): Promise<{ items: MadrasaFeeReceipt[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(madrasa_fee_collections.mahal_id, mahalId)];

    if (filters.student_id) {
      conditions.push(eq(madrasa_fee_collections.student_id, filters.student_id));
    }
    if (filters.class_level !== undefined) {
      conditions.push(eq(madrasa_students.class_level, filters.class_level));
    }
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(madrasa_fee_collections.receipt_number, term),
          ilike(family_members.name, term),
          ilike(family_members.name_ml, term),
          ilike(family_members.phone, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(madrasa_fee_collections)
      .innerJoin(madrasa_students, eq(madrasa_fee_collections.student_id, madrasa_students.id))
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        id: madrasa_fee_collections.id,
        mahal_id: madrasa_fee_collections.mahal_id,
        student_id: madrasa_fee_collections.student_id,
        student_name: family_members.name,
        student_name_ml: family_members.name_ml,
        class_level: madrasa_students.class_level,
        parent_name: sql<string>`(
          SELECT fm.name FROM family_members fm 
          WHERE fm.family_id = ${family_members.family_id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        parent_phone: sql<string>`(
          SELECT fm.phone FROM family_members fm 
          WHERE fm.family_id = ${family_members.family_id} AND fm.relationship_to_head = 'HEAD' 
          LIMIT 1
        )`,
        receipt_number: madrasa_fee_collections.receipt_number,
        fee_months: madrasa_fee_collections.fee_months,
        amount_per_month: madrasa_fee_collections.amount_per_month,
        total_amount: madrasa_fee_collections.total_amount,
        payment_method: madrasa_fee_collections.payment_method,
        reference: madrasa_fee_collections.reference,
        notes: madrasa_fee_collections.notes,
        collected_by_user_id: madrasa_fee_collections.collected_by_user_id,
        collected_by_name: users.name,
        created_at: madrasa_fee_collections.created_at,
      })
      .from(madrasa_fee_collections)
      .innerJoin(madrasa_students, eq(madrasa_fee_collections.student_id, madrasa_students.id))
      .innerJoin(family_members, eq(madrasa_students.member_id, family_members.id))
      .leftJoin(users, eq(madrasa_fee_collections.collected_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(madrasa_fee_collections.created_at))
      .limit(limit)
      .offset(offset);

    const items: MadrasaFeeReceipt[] = rows.map((r) => ({
      ...r,
      fee_months: r.fee_months || [],
      amount_per_month: Number(r.amount_per_month || 0),
      total_amount: Number(r.total_amount || 0),
      payment_method: r.payment_method as PaymentMethod,
      collected_by_name: r.collected_by_name || 'Admin',
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ===========================================================================
  // 5. OVERVIEW & ANALYTICS
  // ===========================================================================

  async getMadrasaOverview(mahalId: string): Promise<MadrasaOverviewStats> {
    const todayStr = this.formatDate(new Date());
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

    // 1. Total students count
    const [allStudentsCount] = await this.db
      .select({ total: count() })
      .from(madrasa_students)
      .where(eq(madrasa_students.mahal_id, mahalId));

    const [activeStudentsCount] = await this.db
      .select({ total: count() })
      .from(madrasa_students)
      .where(
        and(
          eq(madrasa_students.mahal_id, mahalId),
          eq(madrasa_students.status, 'ACTIVE'),
        ),
      );

    // 2. Teachers count
    const [allTeachersCount] = await this.db
      .select({ total: count() })
      .from(madrasa_teachers)
      .where(eq(madrasa_teachers.mahal_id, mahalId));

    const [activeTeachersCount] = await this.db
      .select({ total: count() })
      .from(madrasa_teachers)
      .where(
        and(
          eq(madrasa_teachers.mahal_id, mahalId),
          eq(madrasa_teachers.status, 'ACTIVE'),
        ),
      );

    // 3. Today's attendance
    const todayAttendanceRecords = await this.db
      .select({
        class_level: madrasa_attendance.class_level,
        status: madrasa_attendance.status,
      })
      .from(madrasa_attendance)
      .where(
        and(
          eq(madrasa_attendance.mahal_id, mahalId),
          eq(madrasa_attendance.attendance_date, todayStr),
        ),
      );

    const todayTotalMarked = todayAttendanceRecords.length;
    const todayPresentCount = todayAttendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const todayAttendancePercentage =
      todayTotalMarked > 0 ? Math.round((todayPresentCount / todayTotalMarked) * 100) : 0;

    // 4. Current month fees collected
    const monthFees = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${madrasa_fee_collections.total_amount}), 0)`,
      })
      .from(madrasa_fee_collections)
      .where(
        and(
          eq(madrasa_fee_collections.mahal_id, mahalId),
          gte(madrasa_fee_collections.created_at, new Date(`${currentMonthPrefix}-01T00:00:00.000Z`)),
        ),
      );

    const currentMonthFeeCollected = Number(monthFees[0]?.total || 0);

    // 5. Active teachers to map classes
    const activeTeachers = await this.db
      .select({
        id: madrasa_teachers.id,
        name: family_members.name,
        designation: madrasa_teachers.designation,
        classes_assigned: madrasa_teachers.classes_assigned,
      })
      .from(madrasa_teachers)
      .innerJoin(family_members, eq(madrasa_teachers.member_id, family_members.id))
      .where(
        and(
          eq(madrasa_teachers.mahal_id, mahalId),
          eq(madrasa_teachers.status, 'ACTIVE'),
        ),
      );

    // 6. Class level breakdown (Standards 1 to 10)
    const classLevelStudents = await this.db
      .select({
        class_level: madrasa_students.class_level,
        status: madrasa_students.status,
        count: count(),
      })
      .from(madrasa_students)
      .where(eq(madrasa_students.mahal_id, mahalId))
      .groupBy(madrasa_students.class_level, madrasa_students.status);

    const classOverviews: MadrasaClassOverview[] = [];

    for (let cl = 1; cl <= 10; cl++) {
      let totalStudentsInClass = 0;
      let activeStudentsInClass = 0;

      for (const row of classLevelStudents) {
        if (row.class_level === cl) {
          totalStudentsInClass += row.count;
          if (row.status === 'ACTIVE') {
            activeStudentsInClass += row.count;
          }
        }
      }

      // Find teacher assigned
      const teacher = activeTeachers.find((t) =>
        Array.isArray(t.classes_assigned) && t.classes_assigned.includes(cl),
      );

      // Today's attendance for this class
      const classToday = todayAttendanceRecords.filter((r) => r.class_level === cl);
      const classTodayMarked = classToday.length;
      const classTodayPresent = classToday.filter((r) => r.status === 'PRESENT').length;
      const classTodayPercentage =
        classTodayMarked > 0 ? Math.round((classTodayPresent / classTodayMarked) * 100) : null;

      classOverviews.push({
        class_level: cl,
        student_count: totalStudentsInClass,
        active_students: activeStudentsInClass,
        teacher_in_charge: teacher
          ? {
              id: teacher.id,
              name: teacher.name,
              designation: teacher.designation,
            }
          : null,
        today_attendance_percentage: classTodayPercentage,
      });
    }

    return {
      total_students: allStudentsCount.total,
      total_active_students: activeStudentsCount.total,
      total_teachers: allTeachersCount.total,
      active_teachers: activeTeachersCount.total,
      today_attendance_percentage: todayAttendancePercentage,
      today_total_marked: todayTotalMarked,
      today_present_count: todayPresentCount,
      current_month_fee_collected: currentMonthFeeCollected,
      classes: classOverviews,
    };
  }
}
