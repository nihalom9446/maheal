import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { wards, families, family_members } from '../../database/schema';
import type { CreateWardDto, UpdateWardDto, WardWithCounts } from '@maheall/shared';

@Injectable()
export class WardService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  async create(mahalId: string, dto: CreateWardDto) {
    if (dto.ward_number) {
      const [existing] = await this.db
        .select()
        .from(wards)
        .where(
          and(
            eq(wards.mahal_id, mahalId),
            eq(wards.ward_number, dto.ward_number),
          ),
        )
        .limit(1);

      if (existing) {
        throw new ConflictException(`Ward number ${dto.ward_number} already exists in this Mahal.`);
      }
    }

    const [created] = await this.db
      .insert(wards)
      .values({
        mahal_id: mahalId,
        name: dto.name,
        name_ml: dto.name_ml ?? null,
        ward_number: dto.ward_number ?? null,
        convener_member_id: dto.convener_member_id ?? null,
      })
      .returning();

    return created;
  }

  async findAll(mahalId: string): Promise<WardWithCounts[]> {
    // 1. Fetch all wards for this mahal
    const wardRows = await this.db
      .select({
        id: wards.id,
        mahal_id: wards.mahal_id,
        name: wards.name,
        name_ml: wards.name_ml,
        ward_number: wards.ward_number,
        convener_member_id: wards.convener_member_id,
        created_at: wards.created_at,
        convener_name: family_members.name,
        convener_name_ml: family_members.name_ml,
        convener_phone: family_members.phone,
      })
      .from(wards)
      .leftJoin(family_members, eq(wards.convener_member_id, family_members.id))
      .where(eq(wards.mahal_id, mahalId))
      .orderBy(wards.ward_number, wards.name);

    if (wardRows.length === 0) {
      return [];
    }

    // 2. Fetch counts for families and members per ward
    const familyCounts = await this.db
      .select({
        ward_id: families.ward_id,
        count: sql<number>`cast(count(${families.id}) as integer)`,
      })
      .from(families)
      .where(eq(families.mahal_id, mahalId))
      .groupBy(families.ward_id);

    const familyCountMap = new Map<string, number>();
    for (const fc of familyCounts) {
      if (fc.ward_id) {
        familyCountMap.set(fc.ward_id, fc.count);
      }
    }

    const memberCounts = await this.db
      .select({
        ward_id: families.ward_id,
        count: sql<number>`cast(count(${family_members.id}) as integer)`,
      })
      .from(family_members)
      .innerJoin(families, eq(family_members.family_id, families.id))
      .where(and(eq(family_members.mahal_id, mahalId), eq(family_members.status, 'ACTIVE')))
      .groupBy(families.ward_id);

    const memberCountMap = new Map<string, number>();
    for (const mc of memberCounts) {
      if (mc.ward_id) {
        memberCountMap.set(mc.ward_id, mc.count);
      }
    }

    return wardRows.map((w) => ({
      id: w.id,
      mahal_id: w.mahal_id,
      name: w.name,
      name_ml: w.name_ml,
      ward_number: w.ward_number,
      convener_member_id: w.convener_member_id,
      created_at: w.created_at,
      family_count: familyCountMap.get(w.id) ?? 0,
      member_count: memberCountMap.get(w.id) ?? 0,
      convener: w.convener_member_id
        ? {
            id: w.convener_member_id,
            name: w.convener_name ?? '',
            name_ml: w.convener_name_ml ?? null,
            phone: w.convener_phone ?? null,
          }
        : null,
    }));
  }

  async findOne(mahalId: string, id: string) {
    const [ward] = await this.db
      .select()
      .from(wards)
      .where(and(eq(wards.id, id), eq(wards.mahal_id, mahalId)))
      .limit(1);

    if (!ward) {
      throw new NotFoundException('Ward not found');
    }
    return ward;
  }

  async update(mahalId: string, id: string, dto: UpdateWardDto) {
    await this.findOne(mahalId, id);

    if (dto.ward_number) {
      const [existing] = await this.db
        .select()
        .from(wards)
        .where(
          and(
            eq(wards.mahal_id, mahalId),
            eq(wards.ward_number, dto.ward_number),
          ),
        )
        .limit(1);

      if (existing && existing.id !== id) {
        throw new ConflictException(`Ward number ${dto.ward_number} already exists.`);
      }
    }

    const [updated] = await this.db
      .update(wards)
      .set({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.name_ml !== undefined ? { name_ml: dto.name_ml } : {}),
        ...(dto.ward_number !== undefined ? { ward_number: dto.ward_number } : {}),
        ...(dto.convener_member_id !== undefined ? { convener_member_id: dto.convener_member_id } : {}),
      })
      .where(and(eq(wards.id, id), eq(wards.mahal_id, mahalId)))
      .returning();

    return updated;
  }

  async remove(mahalId: string, id: string) {
    await this.findOne(mahalId, id);

    const [assignedFamily] = await this.db
      .select({ id: families.id })
      .from(families)
      .where(and(eq(families.mahal_id, mahalId), eq(families.ward_id, id)))
      .limit(1);

    if (assignedFamily) {
      throw new BadRequestException(
        'Cannot delete ward with assigned families. Please reassign or delete the families first.',
      );
    }

    await this.db
      .delete(wards)
      .where(and(eq(wards.id, id), eq(wards.mahal_id, mahalId)));

    return { success: true, message: 'Ward deleted successfully' };
  }
}
