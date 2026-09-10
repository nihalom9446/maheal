import { z } from 'zod';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_AUDIENCES } from '../constants';

const malayalamOrEmpty = z.string().optional().nullable();

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').transform(s => s.trim()),
  title_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  content: z.string().optional().nullable(),
  content_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).default('GENERAL'),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).default('NORMAL'),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES).default('ALL'),
  target_ward_ids: z.array(z.string().uuid()).optional().nullable(),
  attachment_key: z.string().optional().nullable(),
  death_record_id: z.string().uuid().optional().nullable(),
  publish_at: z.string().optional().nullable(), // ISO date string or null for immediate
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).transform(s => s.trim()).optional(),
  title_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  content: z.string().optional().nullable(),
  content_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).optional(),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES).optional(),
  target_ward_ids: z.array(z.string().uuid()).optional().nullable(),
  attachment_key: z.string().optional().nullable(),
  death_record_id: z.string().uuid().optional().nullable(),
  publish_at: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const announcementFilterSchema = z.object({
  category: z.enum(ANNOUNCEMENT_CATEGORIES).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES).optional(),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  ward_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createDeathRecordSchema = z.object({
  name: z.string().min(1, 'Name is required').transform(s => s.trim()),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  photo_key: z.string().optional().nullable(),
  date_of_death: z.string().optional().nullable(), // YYYY-MM-DD
  burial_location: z.string().optional().nullable(),
  family_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_details_public: z.boolean().default(false),
  create_announcement: z.boolean().default(true), // auto-create Janazah announcement
});

export const updateDeathRecordSchema = z.object({
  name: z.string().min(1).transform(s => s.trim()).optional(),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  photo_key: z.string().optional().nullable(),
  date_of_death: z.string().optional().nullable(),
  burial_location: z.string().optional().nullable(),
  family_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_details_public: z.boolean().optional(),
});

export const deathRecordFilterSchema = z.object({
  search: z.string().optional(),
  is_details_public: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional())
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').transform(s => s.trim()),
  title_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  description: z.string().optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  image_key: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).default('ACTIVE'),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).transform(s => s.trim()).optional(),
  title_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  description: z.string().optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  image_key: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).optional(),
});

export const eventFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAnnouncementDto = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementDto = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementFilterDto = z.infer<typeof announcementFilterSchema>;
export type CreateDeathRecordDto = z.infer<typeof createDeathRecordSchema>;
export type UpdateDeathRecordDto = z.infer<typeof updateDeathRecordSchema>;
export type DeathRecordFilterDto = z.infer<typeof deathRecordFilterSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type EventFilterDto = z.infer<typeof eventFilterSchema>;