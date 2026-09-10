import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, or, ilike, inArray, sql } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { family_members, families, wards } from '../../database/schema';
import type {
  CreateMemberDto,
  UpdateMemberDto,
  MemberFilterDto,
  DeleteMemberDto,
  MemberListItem,
  MemberDetail,
} from '@maheall/shared';

@Injectable()
export class MemberService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  async create(mahalId: string, dto: CreateMemberDto) {
    // 1. Verify family exists in this mahal
    const [family] = await this.db
      .select()
      .from(families)
      .where(and(eq(families.id, dto.family_id), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new BadRequestException('Family not found in current Mahal.');
    }

    return await this.db.transaction(async (tx) => {
      const [newMember] = await tx
        .insert(family_members)
        .values({
          mahal_id: mahalId,
          family_id: dto.family_id,
          name: dto.name,
          name_ml: dto.name_ml ?? null,
          gender: dto.gender ?? null,
          date_of_birth: dto.date_of_birth ?? null,
          relationship_to_head: dto.relationship_to_head ?? null,
          phone: dto.phone ?? null,
          blood_group: dto.blood_group ?? null,
          occupation: dto.occupation ?? null,
          is_nri: dto.is_nri ?? false,
          nri_country: dto.nri_country ?? null,
          notes: dto.notes ?? null,
          status: 'ACTIVE',
        })
        .returning();

      // If set as HEAD or family currently has no head member
      if (dto.relationship_to_head === 'HEAD' || !family.head_member_id) {
        await tx
          .update(families)
          .set({ head_member_id: newMember.id, updated_at: new Date() })
          .where(eq(families.id, dto.family_id));
      }

      return newMember;
    });
  }

  async findAll(mahalId: string, query: MemberFilterDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(family_members.mahal_id, mahalId)];

    if (query.family_id) {
      conditions.push(eq(family_members.family_id, query.family_id));
    }

    if (query.status) {
      conditions.push(eq(family_members.status, query.status));
    }

    if (query.blood_group) {
      conditions.push(eq(family_members.blood_group, query.blood_group));
    }

    if (query.phone) {
      conditions.push(ilike(family_members.phone, `%${query.phone.trim()}%`));
    }

    if (query.ward_id) {
      conditions.push(eq(families.ward_id, query.ward_id));
    }

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(family_members.name, s),
          ilike(family_members.name_ml, s),
          ilike(family_members.phone, s),
          ilike(family_members.occupation, s),
          ilike(families.house_name, s),
          ilike(families.house_name_ml, s),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${family_members.id}) as integer)`,
      })
      .from(family_members)
      .leftJoin(families, eq(family_members.family_id, families.id))
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: family_members.id,
        mahal_id: family_members.mahal_id,
        family_id: family_members.family_id,
        name: family_members.name,
        name_ml: family_members.name_ml,
        gender: family_members.gender,
        date_of_birth: family_members.date_of_birth,
        relationship_to_head: family_members.relationship_to_head,
        phone: family_members.phone,
        blood_group: family_members.blood_group,
        occupation: family_members.occupation,
        is_nri: family_members.is_nri,
        nri_country: family_members.nri_country,
        status: family_members.status,
        profile_image_key: family_members.profile_image_key,
        notes: family_members.notes,
        created_at: family_members.created_at,
        updated_at: family_members.updated_at,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        family_status: families.status,
        ward_id: families.ward_id,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        ward_number: wards.ward_number,
      })
      .from(family_members)
      .leftJoin(families, eq(family_members.family_id, families.id))
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(whereClause)
      .orderBy(family_members.name)
      .limit(limit)
      .offset(offset);

    const items: MemberListItem[] = rows.map((r) => ({
      id: r.id,
      mahal_id: r.mahal_id,
      family_id: r.family_id,
      name: r.name,
      name_ml: r.name_ml,
      gender: r.gender,
      date_of_birth: r.date_of_birth,
      relationship_to_head: r.relationship_to_head,
      phone: r.phone,
      blood_group: r.blood_group,
      occupation: r.occupation,
      is_nri: r.is_nri,
      nri_country: r.nri_country,
      status: r.status,
      profile_image_key: r.profile_image_key,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
      family: r.family_id
        ? {
            id: r.family_id,
            family_number: r.family_number ?? 0,
            house_name: r.house_name ?? '',
            house_name_ml: r.house_name_ml,
            ward_id: r.ward_id,
            status: r.family_status ?? 'ACTIVE',
          }
        : null,
      ward: r.ward_id
        ? {
            id: r.ward_id,
            name: r.ward_name ?? '',
            name_ml: r.ward_name_ml,
            ward_number: r.ward_number,
          }
        : null,
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

  async findOne(mahalId: string, id: string): Promise<MemberDetail> {
    const [row] = await this.db
      .select({
        id: family_members.id,
        mahal_id: family_members.mahal_id,
        family_id: family_members.family_id,
        name: family_members.name,
        name_ml: family_members.name_ml,
        gender: family_members.gender,
        date_of_birth: family_members.date_of_birth,
        relationship_to_head: family_members.relationship_to_head,
        phone: family_members.phone,
        blood_group: family_members.blood_group,
        occupation: family_members.occupation,
        is_nri: family_members.is_nri,
        nri_country: family_members.nri_country,
        status: family_members.status,
        profile_image_key: family_members.profile_image_key,
        notes: family_members.notes,
        created_at: family_members.created_at,
        updated_at: family_members.updated_at,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        door_number: families.door_number,
        address: families.address,
        pirivu_amount: families.pirivu_amount,
        family_status: families.status,
        ward_id: families.ward_id,
        ward_name: wards.name,
        ward_name_ml: wards.name_ml,
        ward_number: wards.ward_number,
      })
      .from(family_members)
      .leftJoin(families, eq(family_members.family_id, families.id))
      .leftJoin(wards, eq(families.ward_id, wards.id))
      .where(and(eq(family_members.id, id), eq(family_members.mahal_id, mahalId)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Member not found');
    }

    return {
      id: row.id,
      mahal_id: row.mahal_id,
      family_id: row.family_id,
      name: row.name,
      name_ml: row.name_ml,
      gender: row.gender,
      date_of_birth: row.date_of_birth,
      relationship_to_head: row.relationship_to_head,
      phone: row.phone,
      blood_group: row.blood_group,
      occupation: row.occupation,
      is_nri: row.is_nri,
      nri_country: row.nri_country,
      status: row.status,
      profile_image_key: row.profile_image_key,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      family: row.family_id
        ? {
            id: row.family_id,
            family_number: row.family_number ?? 0,
            house_name: row.house_name ?? '',
            house_name_ml: row.house_name_ml,
            door_number: row.door_number,
            address: row.address,
            pirivu_amount: row.pirivu_amount ?? '0',
            status: row.family_status ?? 'ACTIVE',
          }
        : null,
      ward: row.ward_id
        ? {
            id: row.ward_id,
            name: row.ward_name ?? '',
            name_ml: row.ward_name_ml,
            ward_number: row.ward_number,
          }
        : null,
    };
  }

  async update(mahalId: string, id: string, dto: UpdateMemberDto) {
    const member = await this.findOne(mahalId, id);

    return await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(family_members)
        .set({
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.name_ml !== undefined ? { name_ml: dto.name_ml } : {}),
          ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
          ...(dto.date_of_birth !== undefined ? { date_of_birth: dto.date_of_birth } : {}),
          ...(dto.relationship_to_head !== undefined ? { relationship_to_head: dto.relationship_to_head } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.blood_group !== undefined ? { blood_group: dto.blood_group } : {}),
          ...(dto.occupation !== undefined ? { occupation: dto.occupation } : {}),
          ...(dto.is_nri !== undefined ? { is_nri: dto.is_nri } : {}),
          ...(dto.nri_country !== undefined ? { nri_country: dto.nri_country } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.profile_image_key !== undefined ? { profile_image_key: dto.profile_image_key } : {}),
          updated_at: new Date(),
        })
        .where(and(eq(family_members.id, id), eq(family_members.mahal_id, mahalId)))
        .returning();

      if (dto.relationship_to_head === 'HEAD') {
        await tx
          .update(families)
          .set({ head_member_id: id, updated_at: new Date() })
          .where(eq(families.id, member.family_id));
      }

      return updated;
    });
  }

  async remove(mahalId: string, id: string, dto?: DeleteMemberDto) {
    const member = await this.findOne(mahalId, id);
    const targetStatus = dto?.status ?? 'INACTIVE';

    return await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(family_members)
        .set({
          status: targetStatus,
          updated_at: new Date(),
        })
        .where(and(eq(family_members.id, id), eq(family_members.mahal_id, mahalId)))
        .returning();

      // Check if this member was the family head
      const [fam] = await tx
        .select()
        .from(families)
        .where(and(eq(families.id, member.family_id), eq(families.head_member_id, id)))
        .limit(1);

      if (fam) {
        // Find another active member to potentially designate or set to null
        const [nextHead] = await tx
          .select()
          .from(family_members)
          .where(
            and(
              eq(family_members.family_id, member.family_id),
              eq(family_members.status, 'ACTIVE'),
            ),
          )
          .limit(1);

        await tx
          .update(families)
          .set({
            head_member_id: nextHead ? nextHead.id : null,
            updated_at: new Date(),
          })
          .where(eq(families.id, member.family_id));

        if (nextHead) {
          await tx
            .update(family_members)
            .set({ relationship_to_head: 'HEAD', updated_at: new Date() })
            .where(eq(family_members.id, nextHead.id));
        }
      }

      return {
        success: true,
        message: `Member marked as ${targetStatus.toLowerCase()}`,
        data: updated,
      };
    });
  }

  async setHead(mahalId: string, id: string) {
    const member = await this.findOne(mahalId, id);

    return await this.db.transaction(async (tx) => {
      // 1. Reset any existing member with relationship 'HEAD' in this family
      await tx
        .update(family_members)
        .set({ relationship_to_head: 'OTHER', updated_at: new Date() })
        .where(
          and(
            eq(family_members.family_id, member.family_id),
            eq(family_members.relationship_to_head, 'HEAD'),
          ),
        );

      // 2. Set this member relationship to HEAD
      const [updatedMember] = await tx
        .update(family_members)
        .set({ relationship_to_head: 'HEAD', updated_at: new Date() })
        .where(and(eq(family_members.id, id), eq(family_members.mahal_id, mahalId)))
        .returning();

      // 3. Update family head_member_id
      const [updatedFamily] = await tx
        .update(families)
        .set({ head_member_id: id, updated_at: new Date() })
        .where(eq(families.id, member.family_id))
        .returning();

      return {
        member: updatedMember,
        family: updatedFamily,
      };
    });
  }
}