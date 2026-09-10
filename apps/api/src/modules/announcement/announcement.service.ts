import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc, sql, ilike, or, count, gte, lte } from 'drizzle-orm';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  announcements,
  death_records,
  events,
  families,
  users,
} from '../../database/schema';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
  CreateDeathRecordDto,
  UpdateDeathRecordDto,
  DeathRecordFilterDto,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
  AnnouncementListItem,
  AnnouncementDetail,
  DeathRecordItem,
  EventListItem,
} from '@maheall/shared';

@Injectable()
export class AnnouncementService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  // ---------------------------------------------------------------------------
  // ANNOUNCEMENTS
  // ---------------------------------------------------------------------------

  async createAnnouncement(
    mahalId: string,
    dto: CreateAnnouncementDto,
    userId: string,
  ): Promise<AnnouncementListItem> {
    const isPublished = dto.status === 'PUBLISHED';
    const publishAt = isPublished && !dto.publish_at
      ? new Date()
      : (dto.publish_at ? new Date(dto.publish_at) : null);

    const [created] = await this.db
      .insert(announcements)
      .values({
        mahal_id: mahalId,
        title: dto.title,
        title_ml: dto.title_ml,
        content: dto.content,
        content_ml: dto.content_ml,
        category: dto.category ?? 'GENERAL',
        priority: dto.priority ?? 'NORMAL',
        audience: dto.audience ?? 'ALL',
        target_ward_ids: dto.target_ward_ids ?? null,
        attachment_key: dto.attachment_key ?? null,
        death_record_id: dto.death_record_id ?? null,
        status: dto.status ?? 'DRAFT',
        publish_at: publishAt,
        published_by_user_id: isPublished ? userId : null,
      })
      .returning();

    return created as unknown as AnnouncementListItem;
  }

  async listAnnouncements(
    mahalId: string,
    filters: AnnouncementFilterDto,
  ): Promise<{ items: AnnouncementListItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(announcements.mahal_id, mahalId)];

    if (filters.category) {
      conditions.push(eq(announcements.category, filters.category));
    }
    if (filters.status) {
      conditions.push(eq(announcements.status, filters.status));
    }
    if (filters.audience) {
      conditions.push(eq(announcements.audience, filters.audience));
    }
    if (filters.priority) {
      conditions.push(eq(announcements.priority, filters.priority));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(announcements.title, searchPattern),
          ilike(announcements.title_ml, searchPattern),
          ilike(announcements.content, searchPattern),
          ilike(announcements.content_ml, searchPattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(announcements)
      .where(whereClause);

    const rows = await this.db
      .select({
        id: announcements.id,
        mahal_id: announcements.mahal_id,
        title: announcements.title,
        title_ml: announcements.title_ml,
        content: announcements.content,
        content_ml: announcements.content_ml,
        category: announcements.category,
        priority: announcements.priority,
        attachment_key: announcements.attachment_key,
        audience: announcements.audience,
        target_ward_ids: announcements.target_ward_ids,
        death_record_id: announcements.death_record_id,
        status: announcements.status,
        publish_at: announcements.publish_at,
        published_by_user_id: announcements.published_by_user_id,
        created_at: announcements.created_at,
        updated_at: announcements.updated_at,
        publisher_name: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.published_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(announcements.created_at))
      .limit(limit)
      .offset(offset);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows as unknown as AnnouncementListItem[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getAnnouncement(mahalId: string, id: string): Promise<AnnouncementDetail> {
    const [row] = await this.db
      .select({
        id: announcements.id,
        mahal_id: announcements.mahal_id,
        title: announcements.title,
        title_ml: announcements.title_ml,
        content: announcements.content,
        content_ml: announcements.content_ml,
        category: announcements.category,
        priority: announcements.priority,
        attachment_key: announcements.attachment_key,
        audience: announcements.audience,
        target_ward_ids: announcements.target_ward_ids,
        death_record_id: announcements.death_record_id,
        status: announcements.status,
        publish_at: announcements.publish_at,
        published_by_user_id: announcements.published_by_user_id,
        created_at: announcements.created_at,
        updated_at: announcements.updated_at,
        publisher_name: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.published_by_user_id, users.id))
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Announcement not found');
    }

    let deathRecord = null;
    if (row.death_record_id) {
      const [dr] = await this.db
        .select()
        .from(death_records)
        .where(eq(death_records.id, row.death_record_id))
        .limit(1);
      deathRecord = dr || null;
    }

    return {
      ...(row as unknown as AnnouncementListItem),
      death_record: deathRecord,
    };
  }

  async updateAnnouncement(
    mahalId: string,
    id: string,
    dto: UpdateAnnouncementDto,
    userId?: string,
  ): Promise<AnnouncementListItem> {
    const [existing] = await this.db
      .select()
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    const isPublishingNow = dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const publishAt = isPublishingNow && !dto.publish_at
      ? new Date()
      : (dto.publish_at ? new Date(dto.publish_at) : undefined);

    const [updated] = await this.db
      .update(announcements)
      .set({
        title: dto.title !== undefined ? dto.title : undefined,
        title_ml: dto.title_ml !== undefined ? dto.title_ml : undefined,
        content: dto.content !== undefined ? dto.content : undefined,
        content_ml: dto.content_ml !== undefined ? dto.content_ml : undefined,
        category: dto.category !== undefined ? dto.category : undefined,
        priority: dto.priority !== undefined ? dto.priority : undefined,
        audience: dto.audience !== undefined ? dto.audience : undefined,
        target_ward_ids: dto.target_ward_ids !== undefined ? dto.target_ward_ids : undefined,
        attachment_key: dto.attachment_key !== undefined ? dto.attachment_key : undefined,
        death_record_id: dto.death_record_id !== undefined ? dto.death_record_id : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
        publish_at: publishAt !== undefined ? publishAt : undefined,
        published_by_user_id: isPublishingNow && userId ? userId : undefined,
        updated_at: new Date(),
      })
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .returning();

    return updated as unknown as AnnouncementListItem;
  }

  async publishAnnouncement(
    mahalId: string,
    id: string,
    userId: string,
  ): Promise<AnnouncementListItem> {
    const [existing] = await this.db
      .select()
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    const [updated] = await this.db
      .update(announcements)
      .set({
        status: 'PUBLISHED',
        publish_at: new Date(),
        published_by_user_id: userId,
        updated_at: new Date(),
      })
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .returning();

    return updated as unknown as AnnouncementListItem;
  }

  async deleteAnnouncement(
    mahalId: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const [existing] = await this.db
      .select()
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Announcement not found');
    }

    await this.db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mahal_id, mahalId)));

    return { success: true, message: 'Announcement deleted successfully' };
  }

  // ---------------------------------------------------------------------------
  // DEATH RECORDS (JANAZAH)
  // ---------------------------------------------------------------------------

  async createDeathRecord(
    mahalId: string,
    dto: CreateDeathRecordDto,
    userId: string,
  ): Promise<DeathRecordItem> {
    const [createdDeath] = await this.db
      .insert(death_records)
      .values({
        mahal_id: mahalId,
        name: dto.name,
        name_ml: dto.name_ml ?? null,
        photo_key: dto.photo_key ?? null,
        date_of_death: dto.date_of_death ?? null,
        burial_location: dto.burial_location ?? null,
        family_id: dto.family_id ?? null,
        notes: dto.notes ?? null,
        is_details_public: dto.is_details_public ?? false,
        created_by_user_id: userId,
      })
      .returning();

    if (dto.create_announcement) {
      const janazahTitle = `${dto.name} - ഇന്നാ ലില്ലാഹി വ ഇന്നാ ഇലൈഹി റാജിഊൻ`;
      const janazahTitleMl = dto.name_ml
        ? `${dto.name_ml} - ഇന്നാ ലില്ലാഹി വ ഇന്നാ ഇലൈഹി റാജിഊൻ`
        : janazahTitle;

      const content = `മരണവാർത്ത: ${dto.name_ml || dto.name}${
        dto.burial_location ? ` | ഖബറടക്കം: ${dto.burial_location}` : ''
      }${dto.date_of_death ? ` | തീയതി: ${dto.date_of_death}` : ''}${
        dto.notes ? `\n\nവിശദാംശങ്ങൾ: ${dto.notes}` : ''
      }`;

      const [janazahAnnouncement] = await this.db
        .insert(announcements)
        .values({
          mahal_id: mahalId,
          title: janazahTitle,
          title_ml: janazahTitleMl,
          content,
          content_ml: content,
          category: 'JANAZAH',
          priority: 'URGENT',
          audience: 'ALL',
          status: 'PUBLISHED',
          publish_at: new Date(),
          published_by_user_id: userId,
          death_record_id: createdDeath.id,
        })
        .returning();

      await this.db
        .update(death_records)
        .set({ announcement_id: janazahAnnouncement.id })
        .where(eq(death_records.id, createdDeath.id));

      createdDeath.announcement_id = janazahAnnouncement.id;
    }

    return createdDeath as unknown as DeathRecordItem;
  }

  async listDeathRecords(
    mahalId: string,
    filters: DeathRecordFilterDto,
    isPrivileged = true,
  ): Promise<{ items: DeathRecordItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(death_records.mahal_id, mahalId)];

    if (filters.is_details_public !== undefined) {
      conditions.push(eq(death_records.is_details_public, filters.is_details_public));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(death_records.name, searchPattern),
          ilike(death_records.name_ml, searchPattern),
          ilike(death_records.burial_location, searchPattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(death_records)
      .where(whereClause);

    const rows = await this.db
      .select({
        id: death_records.id,
        mahal_id: death_records.mahal_id,
        name: death_records.name,
        name_ml: death_records.name_ml,
        photo_key: death_records.photo_key,
        date_of_death: death_records.date_of_death,
        burial_location: death_records.burial_location,
        family_id: death_records.family_id,
        notes: death_records.notes,
        is_details_public: death_records.is_details_public,
        announcement_id: death_records.announcement_id,
        created_by_user_id: death_records.created_by_user_id,
        created_at: death_records.created_at,
        house_name: families.house_name,
      })
      .from(death_records)
      .leftJoin(families, eq(death_records.family_id, families.id))
      .where(whereClause)
      .orderBy(desc(death_records.created_at))
      .limit(limit)
      .offset(offset);

    const items = rows.map((r) => {
      // If viewer is unprivileged and details are not public, mask private data
      if (!isPrivileged && !r.is_details_public) {
        return {
          ...r,
          date_of_death: null,
          burial_location: null,
          family_id: null,
          house_name: null,
          notes: null,
        };
      }
      return r;
    });

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as unknown as DeathRecordItem[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getDeathRecord(mahalId: string, id: string): Promise<DeathRecordItem> {
    const [row] = await this.db
      .select({
        id: death_records.id,
        mahal_id: death_records.mahal_id,
        name: death_records.name,
        name_ml: death_records.name_ml,
        photo_key: death_records.photo_key,
        date_of_death: death_records.date_of_death,
        burial_location: death_records.burial_location,
        family_id: death_records.family_id,
        notes: death_records.notes,
        is_details_public: death_records.is_details_public,
        announcement_id: death_records.announcement_id,
        created_by_user_id: death_records.created_by_user_id,
        created_at: death_records.created_at,
        house_name: families.house_name,
      })
      .from(death_records)
      .leftJoin(families, eq(death_records.family_id, families.id))
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Death record not found');
    }

    return row as unknown as DeathRecordItem;
  }

  async updateDeathRecord(
    mahalId: string,
    id: string,
    dto: UpdateDeathRecordDto,
  ): Promise<DeathRecordItem> {
    const [existing] = await this.db
      .select()
      .from(death_records)
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Death record not found');
    }

    const [updated] = await this.db
      .update(death_records)
      .set({
        name: dto.name !== undefined ? dto.name : undefined,
        name_ml: dto.name_ml !== undefined ? dto.name_ml : undefined,
        photo_key: dto.photo_key !== undefined ? dto.photo_key : undefined,
        date_of_death: dto.date_of_death !== undefined ? dto.date_of_death : undefined,
        burial_location: dto.burial_location !== undefined ? dto.burial_location : undefined,
        family_id: dto.family_id !== undefined ? dto.family_id : undefined,
        notes: dto.notes !== undefined ? dto.notes : undefined,
        is_details_public: dto.is_details_public !== undefined ? dto.is_details_public : undefined,
      })
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .returning();

    return updated as unknown as DeathRecordItem;
  }

  async toggleDeathDetailsPublic(
    mahalId: string,
    id: string,
    isPublic: boolean,
  ): Promise<DeathRecordItem> {
    const [existing] = await this.db
      .select()
      .from(death_records)
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Death record not found');
    }

    const [updated] = await this.db
      .update(death_records)
      .set({ is_details_public: isPublic })
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .returning();

    return updated as unknown as DeathRecordItem;
  }

  async deleteDeathRecord(
    mahalId: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const [existing] = await this.db
      .select()
      .from(death_records)
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Death record not found');
    }

    // Unlink any announcement
    if (existing.announcement_id) {
      await this.db
        .update(announcements)
        .set({ death_record_id: null })
        .where(eq(announcements.id, existing.announcement_id));
    }

    await this.db
      .delete(death_records)
      .where(and(eq(death_records.id, id), eq(death_records.mahal_id, mahalId)));

    return { success: true, message: 'Death record deleted successfully' };
  }

  // ---------------------------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------------------------

  async createEvent(
    mahalId: string,
    dto: CreateEventDto,
    userId: string,
  ): Promise<EventListItem> {
    const [created] = await this.db
      .insert(events)
      .values({
        mahal_id: mahalId,
        title: dto.title,
        title_ml: dto.title_ml ?? null,
        description: dto.description ?? null,
        starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
        ends_at: dto.ends_at ? new Date(dto.ends_at) : null,
        location: dto.location ?? null,
        image_key: dto.image_key ?? null,
        status: dto.status ?? 'ACTIVE',
        created_by_user_id: userId,
      })
      .returning();

    return created as unknown as EventListItem;
  }

  async listEvents(
    mahalId: string,
    filters: EventFilterDto,
  ): Promise<{ items: EventListItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(events.mahal_id, mahalId)];

    if (filters.status) {
      conditions.push(eq(events.status, filters.status));
    }
    if (filters.start_date) {
      conditions.push(gte(events.starts_at, new Date(filters.start_date)));
    }
    if (filters.end_date) {
      conditions.push(lte(events.ends_at, new Date(filters.end_date)));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(events.title, searchPattern),
          ilike(events.title_ml, searchPattern),
          ilike(events.location, searchPattern),
          ilike(events.description, searchPattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(events)
      .where(whereClause);

    const rows = await this.db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.starts_at))
      .limit(limit)
      .offset(offset);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows as unknown as EventListItem[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getEvent(mahalId: string, id: string): Promise<EventListItem> {
    const [row] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.mahal_id, mahalId)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Event not found');
    }

    return row as unknown as EventListItem;
  }

  async updateEvent(
    mahalId: string,
    id: string,
    dto: UpdateEventDto,
  ): Promise<EventListItem> {
    const [existing] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const [updated] = await this.db
      .update(events)
      .set({
        title: dto.title !== undefined ? dto.title : undefined,
        title_ml: dto.title_ml !== undefined ? dto.title_ml : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
        starts_at: dto.starts_at !== undefined ? (dto.starts_at ? new Date(dto.starts_at) : null) : undefined,
        ends_at: dto.ends_at !== undefined ? (dto.ends_at ? new Date(dto.ends_at) : null) : undefined,
        location: dto.location !== undefined ? dto.location : undefined,
        image_key: dto.image_key !== undefined ? dto.image_key : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      })
      .where(and(eq(events.id, id), eq(events.mahal_id, mahalId)))
      .returning();

    return updated as unknown as EventListItem;
  }

  async deleteEvent(
    mahalId: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const [existing] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.mahal_id, mahalId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    await this.db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.mahal_id, mahalId)));

    return { success: true, message: 'Event deleted successfully' };
  }
}