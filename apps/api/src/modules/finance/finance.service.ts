import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, or, ilike, inArray, gte, lte, sql, desc, count } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  pirivu_collections,
  income_records,
  expense_records,
  families,
  family_members,
  wards,
  users,
} from '../../database/schema';
import { PIRIVU_MONTHS } from '@maheall/shared';
import type {
  RecordPirivuDto,
  CreateIncomeDto,
  UpdateIncomeDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  PirivuFilterDto,
  IncomeFilterDto,
  ExpenseFilterDto,
  ArrearsFilterDto,
  FinanceSummaryQueryDto,
  PirivuCollectionItem,
  FamilyPirivuStatus,
  FamilyPirivuMonthStatus,
  PirivuArrearsItem,
  IncomeListItem,
  ExpenseListItem,
  FinancialSummaryDto,
  PirivuReceiptResponse,
  FundSummary,
  RecentTransactionItem,
} from '@maheall/shared';

@Injectable()
export class FinanceService {
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
   * Helper to generate sequential receipt number in format REC-YYYYMM-XXXX
   */
  private async generateReceiptNumber(mahalId: string, date: Date = new Date()): Promise<string> {
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `REC-${yearMonth}-`;

    const latest = await this.db
      .select({ receipt_number: pirivu_collections.receipt_number })
      .from(pirivu_collections)
      .where(
        and(
          eq(pirivu_collections.mahal_id, mahalId),
          ilike(pirivu_collections.receipt_number, `${prefix}%`),
        ),
      )
      .orderBy(desc(pirivu_collections.receipt_number))
      .limit(1);

    let nextSeq = 1;
    if (latest.length > 0 && latest[0].receipt_number) {
      const match = latest[0].receipt_number.match(/REC-\d{6}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Record monthly Pirivu payment for one or multiple months
   */
  async recordPirivu(
    mahalId: string,
    dto: RecordPirivuDto,
    userId?: string,
  ): Promise<PirivuReceiptResponse> {
    return await this.db.transaction(async (tx) => {
      // 1. Validate family exists and is active
      const [family] = await tx
        .select({
          id: families.id,
          mahal_id: families.mahal_id,
          family_number: families.family_number,
          house_name: families.house_name,
          house_name_ml: families.house_name_ml,
          door_number: families.door_number,
          ward_id: families.ward_id,
          head_member_id: families.head_member_id,
          pirivu_amount: families.pirivu_amount,
          status: families.status,
          ward_name: wards.name,
          ward_name_ml: wards.name_ml,
          head_name: family_members.name,
          head_phone: family_members.phone,
        })
        .from(families)
        .leftJoin(wards, eq(families.ward_id, wards.id))
        .leftJoin(family_members, eq(families.head_member_id, family_members.id))
        .where(and(eq(families.id, dto.family_id), eq(families.mahal_id, mahalId)))
        .limit(1);

      if (!family) {
        throw new NotFoundException('Family not found in this Mahal');
      }

      // Check if user is provided, if not get the first admin or user for fallback
      let collectorUserId = userId;
      if (!collectorUserId) {
        const [firstUser] = await tx.select({ id: users.id }).from(users).limit(1);
        if (!firstUser) {
          throw new BadRequestException('No authenticated user available to record collection');
        }
        collectorUserId = firstUser.id;
      }

      // 2. Check for duplicate payments for any requested month
      const existingCollections = await tx
        .select({ payment_month: pirivu_collections.payment_month })
        .from(pirivu_collections)
        .where(
          and(
            eq(pirivu_collections.mahal_id, mahalId),
            eq(pirivu_collections.family_id, dto.family_id),
            inArray(pirivu_collections.payment_month, dto.payment_months),
          ),
        );

      if (existingCollections.length > 0) {
        const duplicateMonths = existingCollections.map((c) => c.payment_month).join(', ');
        throw new BadRequestException(
          `Payment has already been recorded for the following month(s): ${duplicateMonths}`,
        );
      }

      // 3. Generate receipt number
      const receiptNumber = await this.generateReceiptNumber(mahalId);
      const totalAmount = Number((dto.amount_per_month * dto.payment_months.length).toFixed(2));
      const collectionIds: string[] = [];

      const paymentMethod = dto.payment_method || 'CASH';

      // 4. Insert each month into pirivu_collections
      for (const month of dto.payment_months) {
        const [col] = await tx
          .insert(pirivu_collections)
          .values({
            mahal_id: mahalId,
            family_id: dto.family_id,
            collected_by_user_id: collectorUserId,
            amount: dto.amount_per_month.toFixed(2),
            payment_month: month,
            payment_method: paymentMethod,
            utr_reference: dto.utr_reference ?? null,
            receipt_number: receiptNumber,
            notes: dto.notes ?? null,
          })
          .returning({ id: pirivu_collections.id });

        collectionIds.push(col.id);
      }

      // 5. Insert corresponding income record
      const todayStr = this.formatDate(new Date());
      const monthNames = dto.payment_months
        .map((m) => {
          const parts = m.split('-');
          const monthIdx = parseInt(parts[1], 10) - 1;
          return `${PIRIVU_MONTHS[monthIdx]} ${parts[0]}`;
        })
        .join(', ');

      const payerName = family.head_name || family.house_name;
      const [incomeRecord] = await tx
        .insert(income_records)
        .values({
          mahal_id: mahalId,
          category: 'PIRIVU',
          fund_type: 'GENERAL',
          amount: totalAmount.toFixed(2),
          payment_date: todayStr,
          description: `Pirivu collection: Family #${family.family_number} (${family.house_name}) for ${dto.payment_months.length} month(s) [${monthNames}]`,
          description_ml: `മാസാന്ത പിരിവ്: #${family.family_number} (${family.house_name_ml || family.house_name}) - ${dto.payment_months.length} മാസം`,
          payer_name: payerName,
          payment_method: paymentMethod,
          reference: receiptNumber,
          receipt_key: null,
          created_by_user_id: collectorUserId,
        })
        .returning({ id: income_records.id });

      // Fetch collector name if exists
      const [collector] = await tx
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, collectorUserId))
        .limit(1);

      return {
        receipt_number: receiptNumber,
        family_id: family.id,
        family_number: family.family_number,
        house_name: family.house_name,
        house_name_ml: family.house_name_ml,
        door_number: family.door_number,
        head_name: family.head_name,
        head_phone: family.head_phone,
        ward_name: family.ward_name,
        ward_name_ml: family.ward_name_ml,
        payment_months: dto.payment_months,
        amount_per_month: dto.amount_per_month,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        utr_reference: dto.utr_reference ?? null,
        notes: dto.notes ?? null,
        collected_at: new Date().toISOString(),
        collection_ids: collectionIds,
        income_record_id: incomeRecord.id,
        collected_by_name: collector?.name ?? null,
      };
    });
  }

  /**
   * Paginated list of Pirivu collections
   */
  async listPirivu(mahalId: string, filters: PirivuFilterDto) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(pirivu_collections.mahal_id, mahalId)];

    if (filters.family_id) {
      conditions.push(eq(pirivu_collections.family_id, filters.family_id));
    }

    if (filters.ward_id) {
      conditions.push(eq(families.ward_id, filters.ward_id));
    }

    if (filters.start_month) {
      conditions.push(gte(pirivu_collections.payment_month, filters.start_month));
    }

    if (filters.end_month) {
      conditions.push(lte(pirivu_collections.payment_month, filters.end_month));
    }

    if (filters.payment_method) {
      conditions.push(eq(pirivu_collections.payment_method, filters.payment_method));
    }

    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      const searchNum = parseInt(filters.search.trim(), 10);
      const searchConditions = [
        ilike(pirivu_collections.receipt_number, term),
        ilike(families.house_name, term),
        ilike(families.house_name_ml, term),
        ilike(family_members.name, term),
        ilike(family_members.phone, term),
        ilike(pirivu_collections.utr_reference, term),
      ];

      if (!isNaN(searchNum)) {
        searchConditions.push(eq(families.family_number, searchNum));
      }

      conditions.push(or(...searchConditions)!);
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${pirivu_collections.id}) as integer)`,
      })
      .from(pirivu_collections)
      .leftJoin(families, eq(pirivu_collections.family_id, families.id))
      .leftJoin(family_members, eq(families.head_member_id, family_members.id))
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: pirivu_collections.id,
        mahal_id: pirivu_collections.mahal_id,
        family_id: pirivu_collections.family_id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        ward_id: families.ward_id,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        head_name: family_members.name,
        head_phone: family_members.phone,
        collected_by_user_id: pirivu_collections.collected_by_user_id,
        collected_by_name: users.name,
        amount: pirivu_collections.amount,
        payment_month: pirivu_collections.payment_month,
        payment_method: pirivu_collections.payment_method,
        utr_reference: pirivu_collections.utr_reference,
        gateway_payment_id: pirivu_collections.gateway_payment_id,
        receipt_number: pirivu_collections.receipt_number,
        notes: pirivu_collections.notes,
        created_at: pirivu_collections.created_at,
      })
      .from(pirivu_collections)
      .leftJoin(families, eq(pirivu_collections.family_id, families.id))
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .leftJoin(family_members, eq(families.head_member_id, family_members.id))
      .leftJoin(users, eq(pirivu_collections.collected_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(pirivu_collections.created_at))
      .limit(limit)
      .offset(offset);

    const items: PirivuCollectionItem[] = rows.map((r) => ({
      id: r.id,
      mahal_id: r.mahal_id,
      family_id: r.family_id,
      family_number: r.family_number ?? 0,
      house_name: r.house_name ?? 'Unknown',
      house_name_ml: r.house_name_ml,
      door_number: r.door_number,
      ward_id: r.ward_id,
      ward_name: r.ward_name,
      ward_name_ml: r.ward_name_ml,
      head_name: r.head_name,
      head_phone: r.head_phone,
      collected_by_user_id: r.collected_by_user_id,
      collected_by_name: r.collected_by_name,
      amount: r.amount,
      payment_month: r.payment_month,
      payment_method: r.payment_method,
      utr_reference: r.utr_reference,
      gateway_payment_id: r.gateway_payment_id,
      receipt_number: r.receipt_number,
      notes: r.notes,
      created_at: r.created_at,
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get 12-month pirivu payment status for a specific family for a given year
   */
  async getFamilyPirivuStatus(
    mahalId: string,
    familyId: string,
    targetYear?: number,
  ): Promise<FamilyPirivuStatus> {
    const year = targetYear || new Date().getFullYear();

    const [family] = await this.db
      .select({
        id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        ward_id: families.ward_id,
        pirivu_amount: families.pirivu_amount,
        ward_name: wards.name,
        head_name: family_members.name,
        head_phone: family_members.phone,
      })
      .from(families)
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .leftJoin(family_members, eq(families.head_member_id, family_members.id))
      .where(and(eq(families.id, familyId), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new NotFoundException('Family not found in this Mahal');
    }

    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-01`;

    const collections = await this.db
      .select({
        id: pirivu_collections.id,
        payment_month: pirivu_collections.payment_month,
        amount: pirivu_collections.amount,
        receipt_number: pirivu_collections.receipt_number,
        payment_method: pirivu_collections.payment_method,
        created_at: pirivu_collections.created_at,
      })
      .from(pirivu_collections)
      .where(
        and(
          eq(pirivu_collections.mahal_id, mahalId),
          eq(pirivu_collections.family_id, familyId),
          gte(pirivu_collections.payment_month, startOfYear),
          lte(pirivu_collections.payment_month, endOfYear),
        ),
      );

    const collectionMap = new Map<string, typeof collections[0]>();
    for (const col of collections) {
      collectionMap.set(col.payment_month, col);
    }

    let totalPaid = 0;
    let unpaidCount = 0;
    const monthlyStatus: FamilyPirivuMonthStatus[] = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0-11

    for (let m = 0; m < 12; m++) {
      const monthStr = `${year}-${String(m + 1).padStart(2, '0')}-01`;
      const col = collectionMap.get(monthStr);

      if (col) {
        totalPaid += Number(col.amount);
        monthlyStatus.push({
          month: monthStr,
          month_name: PIRIVU_MONTHS[m],
          status: 'PAID',
          amount_paid: col.amount,
          receipt_number: col.receipt_number,
          paid_date: col.created_at,
          payment_method: col.payment_method,
        });
      } else {
        // Only count as unpaid if the month is in the past or current month of this year
        if (year < currentYear || (year === currentYear && m <= currentMonthIdx)) {
          unpaidCount++;
        }
        monthlyStatus.push({
          month: monthStr,
          month_name: PIRIVU_MONTHS[m],
          status: 'UNPAID',
          amount_paid: null,
          receipt_number: null,
          paid_date: null,
          payment_method: null,
        });
      }
    }

    const monthlyAmount = Number(family.pirivu_amount) || 0;
    const totalDueYear = monthlyAmount * 12;

    return {
      family_id: family.id,
      family_number: family.family_number,
      house_name: family.house_name,
      house_name_ml: family.house_name_ml,
      door_number: family.door_number,
      ward_id: family.ward_id,
      ward_name: family.ward_name,
      head_name: family.head_name,
      head_phone: family.head_phone,
      pirivu_amount: family.pirivu_amount,
      year,
      monthly_status: monthlyStatus,
      total_paid_year: totalPaid,
      total_due_year: totalDueYear,
      unpaid_months_count: unpaidCount,
    };
  }

  /**
   * Get Pirivu Arrears list for all active families in the Mahal
   */
  async getPirivuArrears(mahalId: string, filters: ArrearsFilterDto) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const minMonths = Math.max(1, Number(filters.min_months) || 1);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0 to 11

    // Build the list of past months to check (last 12 months up to current month)
    const expectedMonths: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIdx - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      expectedMonths.push(mStr);
    }

    // 1. Fetch active families
    const familyConditions = [
      eq(families.mahal_id, mahalId),
      eq(families.status, 'ACTIVE'),
    ];

    if (filters.ward_id) {
      familyConditions.push(eq(families.ward_id, filters.ward_id));
    }

    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      const searchNum = parseInt(filters.search.trim(), 10);
      const sConds = [
        ilike(families.house_name, term),
        ilike(families.house_name_ml, term),
        ilike(family_members.name, term),
        ilike(family_members.phone, term),
      ];
      if (!isNaN(searchNum)) {
        sConds.push(eq(families.family_number, searchNum));
      }
      familyConditions.push(or(...sConds)!);
    }

    const allFamilies = await this.db
      .select({
        id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        ward_id: families.ward_id,
        pirivu_amount: families.pirivu_amount,
        created_at: families.created_at,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        head_name: family_members.name,
        head_phone: family_members.phone,
      })
      .from(families)
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .leftJoin(family_members, eq(families.head_member_id, family_members.id))
      .where(and(...familyConditions))
      .orderBy(families.family_number);

    if (allFamilies.length === 0) {
      return {
        items: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const familyIds = allFamilies.map((f) => f.id);

    // 2. Fetch all collections for these families in the expected range
    const oldestMonth = expectedMonths[0];
    const collections = await this.db
      .select({
        family_id: pirivu_collections.family_id,
        payment_month: pirivu_collections.payment_month,
        created_at: pirivu_collections.created_at,
      })
      .from(pirivu_collections)
      .where(
        and(
          eq(pirivu_collections.mahal_id, mahalId),
          inArray(pirivu_collections.family_id, familyIds),
          gte(pirivu_collections.payment_month, oldestMonth),
        ),
      )
      .orderBy(desc(pirivu_collections.payment_month));

    // Map paid months per family
    const familyPaidMap = new Map<string, Set<string>>();
    const familyLastPaidMap = new Map<string, { month: string; date: Date }>();

    for (const c of collections) {
      if (!familyPaidMap.has(c.family_id)) {
        familyPaidMap.set(c.family_id, new Set());
      }
      familyPaidMap.get(c.family_id)!.add(c.payment_month);

      if (!familyLastPaidMap.has(c.family_id)) {
        familyLastPaidMap.set(c.family_id, { month: c.payment_month, date: c.created_at });
      }
    }

    // 3. Compute arrears for each family
    const arrearsItems: PirivuArrearsItem[] = [];

    for (const f of allFamilies) {
      const paidSet = familyPaidMap.get(f.id) || new Set<string>();
      const monthlyRate = Number(f.pirivu_amount) || 0;

      // Identify unpaid months
      const unpaidMonths: string[] = [];
      for (const m of expectedMonths) {
        if (!paidSet.has(m)) {
          unpaidMonths.push(m);
        }
      }

      if (unpaidMonths.length >= minMonths) {
        const lastPaid = familyLastPaidMap.get(f.id);
        arrearsItems.push({
          family_id: f.id,
          family_number: f.family_number,
          house_name: f.house_name,
          house_name_ml: f.house_name_ml,
          door_number: f.door_number,
          ward_id: f.ward_id,
          ward_name: f.ward_name,
          ward_name_ml: f.ward_name_ml,
          head_name: f.head_name,
          head_phone: f.head_phone,
          monthly_pirivu_amount: monthlyRate,
          unpaid_months: unpaidMonths,
          unpaid_months_count: unpaidMonths.length,
          total_arrears: Number((unpaidMonths.length * monthlyRate).toFixed(2)),
          last_payment_month: lastPaid?.month ?? null,
          last_payment_date: lastPaid?.date ?? null,
        });
      }
    }

    // Sort by unpaid months count desc, then family number asc
    arrearsItems.sort((a, b) => {
      if (b.unpaid_months_count !== a.unpaid_months_count) {
        return b.unpaid_months_count - a.unpaid_months_count;
      }
      return a.family_number - b.family_number;
    });

    const total = arrearsItems.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = arrearsItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Create manual income record
   */
  async createIncome(mahalId: string, dto: CreateIncomeDto, userId?: string) {
    let creatorId = userId;
    if (!creatorId) {
      const [firstUser] = await this.db.select({ id: users.id }).from(users).limit(1);
      creatorId = firstUser?.id;
    }

    if (!creatorId) {
      throw new BadRequestException('No authenticated user found');
    }

    const [created] = await this.db
      .insert(income_records)
      .values({
        mahal_id: mahalId,
        category: dto.category,
        fund_type: dto.fund_type ?? 'GENERAL',
        amount: dto.amount.toFixed(2),
        payment_date: dto.payment_date,
        description: dto.description ?? null,
        description_ml: dto.description_ml ?? null,
        payer_name: dto.payer_name ?? null,
        payment_method: dto.payment_method ?? 'CASH',
        reference: dto.reference ?? null,
        receipt_key: null,
        created_by_user_id: creatorId,
      })
      .returning();

    return created;
  }

  /**
   * List income records with filters and pagination
   */
  async listIncome(mahalId: string, filters: IncomeFilterDto) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(income_records.mahal_id, mahalId)];

    if (filters.category) {
      conditions.push(eq(income_records.category, filters.category));
    }

    if (filters.fund_type) {
      conditions.push(eq(income_records.fund_type, filters.fund_type));
    }

    if (filters.start_date) {
      conditions.push(gte(income_records.payment_date, filters.start_date));
    }

    if (filters.end_date) {
      conditions.push(lte(income_records.payment_date, filters.end_date));
    }

    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(income_records.description, term),
          ilike(income_records.description_ml, term),
          ilike(income_records.payer_name, term),
          ilike(income_records.reference, term),
          ilike(income_records.category, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${income_records.id}) as integer)`,
      })
      .from(income_records)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: income_records.id,
        mahal_id: income_records.mahal_id,
        category: income_records.category,
        fund_type: income_records.fund_type,
        amount: income_records.amount,
        payment_date: income_records.payment_date,
        description: income_records.description,
        description_ml: income_records.description_ml,
        payer_name: income_records.payer_name,
        payment_method: income_records.payment_method,
        reference: income_records.reference,
        receipt_key: income_records.receipt_key,
        created_by_user_id: income_records.created_by_user_id,
        created_by_name: users.name,
        created_at: income_records.created_at,
      })
      .from(income_records)
      .leftJoin(users, eq(income_records.created_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(income_records.payment_date), desc(income_records.created_at))
      .limit(limit)
      .offset(offset);

    const items: IncomeListItem[] = rows.map((r) => ({
      id: r.id,
      mahal_id: r.mahal_id,
      category: r.category,
      fund_type: r.fund_type,
      amount: r.amount,
      payment_date: r.payment_date,
      description: r.description,
      description_ml: r.description_ml,
      payer_name: r.payer_name,
      payment_method: r.payment_method,
      reference: r.reference,
      receipt_key: r.receipt_key,
      created_by_user_id: r.created_by_user_id,
      created_by_name: r.created_by_name,
      created_at: r.created_at,
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Update income record
   */
  async updateIncome(mahalId: string, id: string, dto: UpdateIncomeDto) {
    const [existing] = await this.db
      .select()
      .from(income_records)
      .where(and(eq(income_records.id, id), eq(income_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Income record not found');
    }

    const [updated] = await this.db
      .update(income_records)
      .set({
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.fund_type !== undefined ? { fund_type: dto.fund_type } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount.toFixed(2) } : {}),
        ...(dto.payment_date !== undefined ? { payment_date: dto.payment_date } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.description_ml !== undefined ? { description_ml: dto.description_ml } : {}),
        ...(dto.payer_name !== undefined ? { payer_name: dto.payer_name } : {}),
        ...(dto.payment_method !== undefined ? { payment_method: dto.payment_method } : {}),
        ...(dto.reference !== undefined ? { reference: dto.reference } : {}),
      })
      .where(and(eq(income_records.id, id), eq(income_records.mahal_id, mahalId)))
      .returning();

    return updated;
  }

  /**
   * Delete income record
   */
  async deleteIncome(mahalId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(income_records)
      .where(and(eq(income_records.id, id), eq(income_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Income record not found');
    }

    await this.db
      .delete(income_records)
      .where(and(eq(income_records.id, id), eq(income_records.mahal_id, mahalId)));

    return { success: true, message: 'Income record deleted successfully' };
  }

  /**
   * Create expense record
   */
  async createExpense(mahalId: string, dto: CreateExpenseDto, userId?: string) {
    let creatorId = userId;
    if (!creatorId) {
      const [firstUser] = await this.db.select({ id: users.id }).from(users).limit(1);
      creatorId = firstUser?.id;
    }

    if (!creatorId) {
      throw new BadRequestException('No authenticated user found');
    }

    const [created] = await this.db
      .insert(expense_records)
      .values({
        mahal_id: mahalId,
        category: dto.category,
        fund_type: dto.fund_type ?? 'GENERAL',
        amount: dto.amount.toFixed(2),
        expense_date: dto.expense_date,
        description: dto.description ?? null,
        description_ml: dto.description_ml ?? null,
        payee_name: dto.payee_name ?? null,
        payment_method: dto.payment_method ?? 'CASH',
        reference: dto.reference ?? dto.voucher_no ?? null,
        voucher_key: dto.voucher_no ?? null,
        created_by_user_id: creatorId,
      })
      .returning();

    return created;
  }

  /**
   * List expense records with filters and pagination
   */
  async listExpense(mahalId: string, filters: ExpenseFilterDto) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(expense_records.mahal_id, mahalId)];

    if (filters.category) {
      conditions.push(eq(expense_records.category, filters.category));
    }

    if (filters.fund_type) {
      conditions.push(eq(expense_records.fund_type, filters.fund_type));
    }

    if (filters.start_date) {
      conditions.push(gte(expense_records.expense_date, filters.start_date));
    }

    if (filters.end_date) {
      conditions.push(lte(expense_records.expense_date, filters.end_date));
    }

    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(expense_records.description, term),
          ilike(expense_records.description_ml, term),
          ilike(expense_records.payee_name, term),
          ilike(expense_records.reference, term),
          ilike(expense_records.voucher_key, term),
          ilike(expense_records.category, term),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${expense_records.id}) as integer)`,
      })
      .from(expense_records)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: expense_records.id,
        mahal_id: expense_records.mahal_id,
        category: expense_records.category,
        fund_type: expense_records.fund_type,
        amount: expense_records.amount,
        expense_date: expense_records.expense_date,
        description: expense_records.description,
        description_ml: expense_records.description_ml,
        payee_name: expense_records.payee_name,
        payment_method: expense_records.payment_method,
        reference: expense_records.reference,
        voucher_key: expense_records.voucher_key,
        created_by_user_id: expense_records.created_by_user_id,
        created_by_name: users.name,
        created_at: expense_records.created_at,
      })
      .from(expense_records)
      .leftJoin(users, eq(expense_records.created_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(expense_records.expense_date), desc(expense_records.created_at))
      .limit(limit)
      .offset(offset);

    const items: ExpenseListItem[] = rows.map((r) => ({
      id: r.id,
      mahal_id: r.mahal_id,
      category: r.category,
      fund_type: r.fund_type,
      amount: r.amount,
      expense_date: r.expense_date,
      description: r.description,
      description_ml: r.description_ml,
      payee_name: r.payee_name,
      payment_method: r.payment_method,
      reference: r.reference,
      voucher_key: r.voucher_key,
      voucher_no: r.voucher_key || r.reference,
      created_by_user_id: r.created_by_user_id,
      created_by_name: r.created_by_name,
      created_at: r.created_at,
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Update expense record
   */
  async updateExpense(mahalId: string, id: string, dto: UpdateExpenseDto) {
    const [existing] = await this.db
      .select()
      .from(expense_records)
      .where(and(eq(expense_records.id, id), eq(expense_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Expense record not found');
    }

    const [updated] = await this.db
      .update(expense_records)
      .set({
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.fund_type !== undefined ? { fund_type: dto.fund_type } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount.toFixed(2) } : {}),
        ...(dto.expense_date !== undefined ? { expense_date: dto.expense_date } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.description_ml !== undefined ? { description_ml: dto.description_ml } : {}),
        ...(dto.payee_name !== undefined ? { payee_name: dto.payee_name } : {}),
        ...(dto.payment_method !== undefined ? { payment_method: dto.payment_method } : {}),
        ...(dto.reference !== undefined ? { reference: dto.reference } : {}),
        ...(dto.voucher_no !== undefined ? { voucher_key: dto.voucher_no } : {}),
      })
      .where(and(eq(expense_records.id, id), eq(expense_records.mahal_id, mahalId)))
      .returning();

    return updated;
  }

  /**
   * Delete expense record
   */
  async deleteExpense(mahalId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(expense_records)
      .where(and(eq(expense_records.id, id), eq(expense_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Expense record not found');
    }

    await this.db
      .delete(expense_records)
      .where(and(eq(expense_records.id, id), eq(expense_records.mahal_id, mahalId)));

    return { success: true, message: 'Expense record deleted successfully' };
  }

  /**
   * Get Financial summary & KPI statistics
   */
  async getSummary(mahalId: string, query: FinanceSummaryQueryDto): Promise<FinancialSummaryDto> {
    const now = new Date();
    const periodType = query.period || 'month';
    const year = query.year || now.getFullYear();
    const month = query.month || (periodType === 'month' ? now.getMonth() + 1 : undefined);

    let startDate: string;
    let endDate: string;
    let prevStartDate: string;
    let prevEndDate: string;

    if (periodType === 'month' && month !== undefined) {
      const monthStr = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      startDate = `${year}-${monthStr}-01`;
      endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

      // Previous month
      const prevDate = new Date(year, month - 2, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      const prevMonthStr = String(prevMonth).padStart(2, '0');
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      prevStartDate = `${prevYear}-${prevMonthStr}-01`;
      prevEndDate = `${prevYear}-${prevMonthStr}-${String(prevLastDay).padStart(2, '0')}`;
    } else if (periodType === 'year') {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
      prevStartDate = `${year - 1}-01-01`;
      prevEndDate = `${year - 1}-12-31`;
    } else {
      startDate = '2000-01-01';
      endDate = '2099-12-31';
      prevStartDate = '2000-01-01';
      prevEndDate = '2099-12-31';
    }

    // 1. Incomes in period grouped by fund_type
    const incomes = await this.db
      .select({
        fund_type: income_records.fund_type,
        total: sql<string>`coalesce(sum(${income_records.amount}), '0')`,
      })
      .from(income_records)
      .where(
        and(
          eq(income_records.mahal_id, mahalId),
          gte(income_records.payment_date, startDate),
          lte(income_records.payment_date, endDate),
        ),
      )
      .groupBy(income_records.fund_type);

    // 2. Expenses in period grouped by fund_type
    const expenses = await this.db
      .select({
        fund_type: expense_records.fund_type,
        total: sql<string>`coalesce(sum(${expense_records.amount}), '0')`,
      })
      .from(expense_records)
      .where(
        and(
          eq(expense_records.mahal_id, mahalId),
          gte(expense_records.expense_date, startDate),
          lte(expense_records.expense_date, endDate),
        ),
      )
      .groupBy(expense_records.fund_type);

    const incomeByFund: Record<string, number> = { GENERAL: 0, ZAKAT: 0, MADRASA: 0 };
    let totalIncome = 0;
    for (const inc of incomes) {
      const amt = parseFloat(inc.total) || 0;
      incomeByFund[inc.fund_type] = amt;
      totalIncome += amt;
    }

    const expenseByFund: Record<string, number> = { GENERAL: 0, ZAKAT: 0, MADRASA: 0 };
    let totalExpense = 0;
    for (const exp of expenses) {
      const amt = parseFloat(exp.total) || 0;
      expenseByFund[exp.fund_type] = amt;
      totalExpense += amt;
    }

    const funds: { GENERAL: FundSummary; ZAKAT: FundSummary; MADRASA: FundSummary } = {
      GENERAL: {
        fund_type: 'GENERAL',
        income: incomeByFund.GENERAL || 0,
        expense: expenseByFund.GENERAL || 0,
        net: (incomeByFund.GENERAL || 0) - (expenseByFund.GENERAL || 0),
      },
      ZAKAT: {
        fund_type: 'ZAKAT',
        income: incomeByFund.ZAKAT || 0,
        expense: expenseByFund.ZAKAT || 0,
        net: (incomeByFund.ZAKAT || 0) - (expenseByFund.ZAKAT || 0),
      },
      MADRASA: {
        fund_type: 'MADRASA',
        income: incomeByFund.MADRASA || 0,
        expense: expenseByFund.MADRASA || 0,
        net: (incomeByFund.MADRASA || 0) - (expenseByFund.MADRASA || 0),
      },
    };

    // 3. Previous period totals for comparison
    const [prevIncomeResult] = await this.db
      .select({
        total: sql<string>`coalesce(sum(${income_records.amount}), '0')`,
      })
      .from(income_records)
      .where(
        and(
          eq(income_records.mahal_id, mahalId),
          gte(income_records.payment_date, prevStartDate),
          lte(income_records.payment_date, prevEndDate),
        ),
      );

    const [prevExpenseResult] = await this.db
      .select({
        total: sql<string>`coalesce(sum(${expense_records.amount}), '0')`,
      })
      .from(expense_records)
      .where(
        and(
          eq(expense_records.mahal_id, mahalId),
          gte(expense_records.expense_date, prevStartDate),
          lte(expense_records.expense_date, prevEndDate),
        ),
      );

    const prevIncome = parseFloat(prevIncomeResult?.total || '0') || 0;
    const prevExpense = parseFloat(prevExpenseResult?.total || '0') || 0;

    const incomeChangePercentage =
      prevIncome > 0 ? Number((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1)) : 0;
    const expenseChangePercentage =
      prevExpense > 0 ? Number((((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1)) : 0;

    // 4. Pirivu collection stats for current target month/year
    const activeFamilies = await this.db
      .select({
        id: families.id,
        pirivu_amount: families.pirivu_amount,
      })
      .from(families)
      .where(and(eq(families.mahal_id, mahalId), eq(families.status, 'ACTIVE')));

    const totalFamiliesCount = activeFamilies.length;
    const totalExpectedPirivu = activeFamilies.reduce((sum, f) => sum + (parseFloat(f.pirivu_amount) || 0), 0);

    const pirivuTargetMonth =
      periodType === 'month' && month !== undefined
        ? `${year}-${String(month).padStart(2, '0')}-01`
        : `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const pirivuCollectionsForMonth = await this.db
      .select({
        family_id: pirivu_collections.family_id,
        amount: pirivu_collections.amount,
      })
      .from(pirivu_collections)
      .where(
        and(
          eq(pirivu_collections.mahal_id, mahalId),
          eq(pirivu_collections.payment_month, pirivuTargetMonth),
        ),
      );

    const totalPirivuCollected = pirivuCollectionsForMonth.reduce(
      (sum, c) => sum + (parseFloat(c.amount) || 0),
      0,
    );
    const payingFamiliesSet = new Set(pirivuCollectionsForMonth.map((c) => c.family_id));
    const payingFamiliesCount = payingFamiliesSet.size;

    const collectionPercentage =
      totalExpectedPirivu > 0
        ? Number(((totalPirivuCollected / totalExpectedPirivu) * 100).toFixed(1))
        : 0;

    // 5. Recent transactions (latest 5 incomes + latest 5 expenses)
    const recentIncomes = await this.db
      .select({
        id: income_records.id,
        category: income_records.category,
        fund_type: income_records.fund_type,
        amount: income_records.amount,
        payment_date: income_records.payment_date,
        description: income_records.description,
        payer_name: income_records.payer_name,
        payment_method: income_records.payment_method,
        reference: income_records.reference,
        created_at: income_records.created_at,
      })
      .from(income_records)
      .where(eq(income_records.mahal_id, mahalId))
      .orderBy(desc(income_records.payment_date), desc(income_records.created_at))
      .limit(6);

    const recentExpenses = await this.db
      .select({
        id: expense_records.id,
        category: expense_records.category,
        fund_type: expense_records.fund_type,
        amount: expense_records.amount,
        expense_date: expense_records.expense_date,
        description: expense_records.description,
        payee_name: expense_records.payee_name,
        payment_method: expense_records.payment_method,
        reference: expense_records.reference,
        created_at: expense_records.created_at,
      })
      .from(expense_records)
      .where(eq(expense_records.mahal_id, mahalId))
      .orderBy(desc(expense_records.expense_date), desc(expense_records.created_at))
      .limit(6);

    const recentTransactions: RecentTransactionItem[] = [
      ...recentIncomes.map((inc) => ({
        id: inc.id,
        type: (inc.category === 'PIRIVU' ? 'PIRIVU' : 'INCOME') as 'INCOME' | 'PIRIVU',
        category: inc.category,
        fund_type: inc.fund_type,
        amount: parseFloat(inc.amount) || 0,
        date: inc.payment_date,
        description: inc.description,
        party_name: inc.payer_name,
        payment_method: inc.payment_method,
        reference: inc.reference,
      })),
      ...recentExpenses.map((exp) => ({
        id: exp.id,
        type: 'EXPENSE' as const,
        category: exp.category,
        fund_type: exp.fund_type,
        amount: parseFloat(exp.amount) || 0,
        date: exp.expense_date,
        description: exp.description,
        party_name: exp.payee_name,
        payment_method: exp.payment_method,
        reference: exp.reference,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      period: {
        year,
        month,
        start_date: startDate,
        end_date: endDate,
        period_type: periodType,
      },
      total_income: Number(totalIncome.toFixed(2)),
      total_expense: Number(totalExpense.toFixed(2)),
      net_balance: Number((totalIncome - totalExpense).toFixed(2)),
      funds,
      comparison: {
        prev_month_income: Number(prevIncome.toFixed(2)),
        prev_month_expense: Number(prevExpense.toFixed(2)),
        income_change_percentage: incomeChangePercentage,
        expense_change_percentage: expenseChangePercentage,
      },
      pirivu: {
        total_expected: Number(totalExpectedPirivu.toFixed(2)),
        total_collected: Number(totalPirivuCollected.toFixed(2)),
        collection_percentage: collectionPercentage,
        paying_families_count: payingFamiliesCount,
        total_families_count: totalFamiliesCount,
      },
      recent_transactions: recentTransactions,
    };
  }
}