import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, or, ilike, inArray, sql } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { families, family_members, wards } from '../../database/schema';
import type {
  CreateFamilyDto,
  UpdateFamilyDto,
  FamilyFilterDto,
  CheckDuplicateFamilyDto,
  FamilyListItem,
  FamilyDetail,
} from '@maheall/shared';

@Injectable()
export class FamilyService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  async create(mahalId: string, userId: string | undefined, dto: CreateFamilyDto) {
    return await this.db.transaction(async (tx) => {
      // Auto-assign sequential family_number per mahal_id
      const [maxResult] = await tx
        .select({
          maxNum: sql<number>`coalesce(max(${families.family_number}), 0)`,
        })
        .from(families)
        .where(eq(families.mahal_id, mahalId));

      const nextFamilyNumber = Number(maxResult?.maxNum ?? 0) + 1;

      const [newFamily] = await tx
        .insert(families)
        .values({
          mahal_id: mahalId,
          family_number: nextFamilyNumber,
          house_name: dto.house_name,
          house_name_ml: dto.house_name_ml ?? null,
          door_number: dto.door_number ?? null,
          address: dto.address ?? null,
          ward_id: dto.ward_id ?? null,
          pirivu_amount: dto.pirivu_amount?.toString() ?? '0',
          is_nri_household: dto.is_nri_household ?? false,
          notes: dto.notes ?? null,
          created_by_user_id: userId ?? null,
          status: 'ACTIVE',
        })
        .returning();

      let headMember = null;
      if (dto.head_member) {
        const [hm] = await tx
          .insert(family_members)
          .values({
            mahal_id: mahalId,
            family_id: newFamily.id,
            name: dto.head_member.name,
            name_ml: dto.head_member.name_ml ?? null,
            gender: dto.head_member.gender ?? 'M',
            date_of_birth: dto.head_member.date_of_birth ?? null,
            relationship_to_head: 'HEAD',
            phone: dto.head_member.phone ?? null,
            blood_group: dto.head_member.blood_group ?? null,
            occupation: dto.head_member.occupation ?? null,
            is_nri: dto.head_member.is_nri ?? false,
            nri_country: dto.head_member.nri_country ?? null,
            status: 'ACTIVE',
          })
          .returning();

        headMember = hm;

        await tx
          .update(families)
          .set({ head_member_id: hm.id })
          .where(eq(families.id, newFamily.id));

        newFamily.head_member_id = hm.id;
      }

      return {
        ...newFamily,
        head_member: headMember,
      };
    });
  }

  async findAll(mahalId: string, query: FamilyFilterDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(families.mahal_id, mahalId)];

    if (query.ward_id) {
      conditions.push(eq(families.ward_id, query.ward_id));
    }

    if (query.status) {
      conditions.push(eq(families.status, query.status));
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerm = `%${query.search.trim()}%`;
      const searchConditions = [
        ilike(families.house_name, searchTerm),
        ilike(families.house_name_ml, searchTerm),
        ilike(families.door_number, searchTerm),
        ilike(families.address, searchTerm),
      ];

      const familyNum = parseInt(query.search.trim(), 10);
      if (!isNaN(familyNum)) {
        searchConditions.push(eq(families.family_number, familyNum));
      }

      const memberSubquery = this.db
        .select({ family_id: family_members.family_id })
        .from(family_members)
        .where(
          and(
            eq(family_members.mahal_id, mahalId),
            or(
              ilike(family_members.name, searchTerm),
              ilike(family_members.name_ml, searchTerm),
              ilike(family_members.phone, searchTerm),
            ),
          ),
        );

      conditions.push(or(...searchConditions, inArray(families.id, memberSubquery))!);
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${families.id}) as integer)`,
      })
      .from(families)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: families.id,
        mahal_id: families.mahal_id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        address: families.address,
        ward_id: families.ward_id,
        pirivu_amount: families.pirivu_amount,
        head_member_id: families.head_member_id,
        is_nri_household: families.is_nri_household,
        status: families.status,
        notes: families.notes,
        created_by_user_id: families.created_by_user_id,
        created_at: families.created_at,
        updated_at: families.updated_at,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        ward_number: wards.ward_number,
        head_name: family_members.name,
        head_name_ml: family_members.name_ml,
        head_phone: family_members.phone,
        head_gender: family_members.gender,
        head_blood_group: family_members.blood_group,
        head_occupation: family_members.occupation,
        head_is_nri: family_members.is_nri,
      })
      .from(families)
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .leftJoin(family_members, eq(families.head_member_id, family_members.id))
      .where(whereClause)
      .orderBy(families.family_number)
      .limit(limit)
      .offset(offset);

    const familyIds = rows.map((r) => r.id);
    const memberCountMap = new Map<string, number>();

    if (familyIds.length > 0) {
      const memberCounts = await this.db
        .select({
          family_id: family_members.family_id,
          count: sql<number>`cast(count(${family_members.id}) as integer)`,
        })
        .from(family_members)
        .where(
          and(
            inArray(family_members.family_id, familyIds),
            eq(family_members.status, 'ACTIVE'),
          ),
        )
        .groupBy(family_members.family_id);

      for (const mc of memberCounts) {
        memberCountMap.set(mc.family_id, Number(mc.count));
      }
    }

    const items: FamilyListItem[] = rows.map((row) => ({
      id: row.id,
      mahal_id: row.mahal_id,
      family_number: row.family_number,
      house_name: row.house_name,
      house_name_ml: row.house_name_ml,
      door_number: row.door_number,
      address: row.address,
      ward_id: row.ward_id,
      pirivu_amount: row.pirivu_amount,
      head_member_id: row.head_member_id,
      is_nri_household: row.is_nri_household,
      status: row.status,
      notes: row.notes,
      created_by_user_id: row.created_by_user_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ward: row.ward_id
        ? {
            id: row.ward_id,
            name: row.ward_name ?? '',
            name_ml: row.ward_name_ml,
            ward_number: row.ward_number,
          }
        : null,
      head_member: row.head_member_id
        ? {
            id: row.head_member_id,
            name: row.head_name ?? '',
            name_ml: row.head_name_ml,
            phone: row.head_phone,
            gender: row.head_gender,
            blood_group: row.head_blood_group,
            occupation: row.head_occupation,
            is_nri: row.head_is_nri ?? false,
          }
        : null,
      member_count: memberCountMap.get(row.id) ?? 0,
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

  async findOne(mahalId: string, id: string): Promise<FamilyDetail> {
    const [family] = await this.db
      .select({
        id: families.id,
        mahal_id: families.mahal_id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        address: families.address,
        ward_id: families.ward_id,
        pirivu_amount: families.pirivu_amount,
        head_member_id: families.head_member_id,
        is_nri_household: families.is_nri_household,
        status: families.status,
        notes: families.notes,
        created_by_user_id: families.created_by_user_id,
        created_at: families.created_at,
        updated_at: families.updated_at,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        ward_number: wards.ward_number,
      })
      .from(families)
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(and(eq(families.id, id), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const members = await this.db
      .select()
      .from(family_members)
      .where(and(eq(family_members.family_id, id), eq(family_members.mahal_id, mahalId)))
      .orderBy(
        sql`CASE WHEN ${family_members.id} = ${family.head_member_id ?? '00000000-0000-0000-0000-000000000000'} THEN 0 WHEN ${family_members.relationship_to_head} = 'HEAD' THEN 1 ELSE 2 END`,
        family_members.created_at,
      );

    const headMember = family.head_member_id
      ? members.find((m) => m.id === family.head_member_id) ?? null
      : members.find((m) => m.relationship_to_head === 'HEAD') ?? null;

    return {
      id: family.id,
      mahal_id: family.mahal_id,
      family_number: family.family_number,
      house_name: family.house_name,
      house_name_ml: family.house_name_ml,
      door_number: family.door_number,
      address: family.address,
      ward_id: family.ward_id,
      pirivu_amount: family.pirivu_amount,
      head_member_id: family.head_member_id,
      is_nri_household: family.is_nri_household,
      status: family.status,
      notes: family.notes,
      created_by_user_id: family.created_by_user_id,
      created_at: family.created_at,
      updated_at: family.updated_at,
      ward: family.ward_id
        ? {
            id: family.ward_id,
            name: family.ward_name ?? '',
            name_ml: family.ward_name_ml,
            ward_number: family.ward_number,
          }
        : null,
      head_member: headMember,
      members,
    };
  }

  async update(mahalId: string, id: string, dto: UpdateFamilyDto) {
    await this.findOne(mahalId, id);

    const [updated] = await this.db
      .update(families)
      .set({
        ...(dto.house_name !== undefined ? { house_name: dto.house_name } : {}),
        ...(dto.house_name_ml !== undefined ? { house_name_ml: dto.house_name_ml } : {}),
        ...(dto.door_number !== undefined ? { door_number: dto.door_number } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.ward_id !== undefined ? { ward_id: dto.ward_id } : {}),
        ...(dto.pirivu_amount !== undefined ? { pirivu_amount: dto.pirivu_amount.toString() } : {}),
        ...(dto.is_nri_household !== undefined ? { is_nri_household: dto.is_nri_household } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.head_member_id !== undefined ? { head_member_id: dto.head_member_id } : {}),
        updated_at: new Date(),
      })
      .where(and(eq(families.id, id), eq(families.mahal_id, mahalId)))
      .returning();

    return updated;
  }

  async remove(mahalId: string, id: string) {
    await this.findOne(mahalId, id);

    await this.db
      .update(families)
      .set({
        status: 'INACTIVE',
        updated_at: new Date(),
      })
      .where(and(eq(families.id, id), eq(families.mahal_id, mahalId)));

    await this.db
      .update(family_members)
      .set({
        status: 'INACTIVE',
        updated_at: new Date(),
      })
      .where(
        and(
          eq(family_members.family_id, id),
          eq(family_members.mahal_id, mahalId),
          eq(family_members.status, 'ACTIVE'),
        ),
      );

    return { success: true, message: 'Family and its members marked as inactive.' };
  }

  async checkDuplicate(mahalId: string, dto: CheckDuplicateFamilyDto) {
    const searchName = dto.house_name.trim();
    const searchPattern = `%${searchName}%`;

    const matches = await this.db
      .select({
        id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        ward_id: families.ward_id,
        status: families.status,
        ward_name: wards.name,
      })
      .from(families)
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(
        and(
          eq(families.mahal_id, mahalId),
          or(
            ilike(families.house_name, searchPattern),
            dto.house_name_ml ? ilike(families.house_name_ml, `%${dto.house_name_ml.trim()}%`) : undefined,
          ),
        ),
      )
      .limit(10);

    return {
      duplicates: matches.map((m) => ({
        id: m.id,
        family_number: m.family_number,
        house_name: m.house_name,
        house_name_ml: m.house_name_ml,
        door_number: m.door_number,
        ward_name: m.ward_name,
        status: m.status,
      })),
      hasDuplicate: matches.length > 0,
    };
  }
}