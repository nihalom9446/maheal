import { z } from 'zod';

export const updatePrayerScheduleSchema = z.object({
  madhab: z.enum(['SHAFI', 'HANAFI']).default('SHAFI'),
  fajr_angle: z.coerce.number().min(10).max(25).default(18.0),
  isha_angle: z.coerce.number().min(10).max(25).default(18.0),
  fajr_iqamah_offset_minutes: z.coerce.number().int().min(0).max(60).default(20),
  dhuhr_iqamah_offset_minutes: z.coerce.number().int().min(0).max(60).default(10),
  asr_iqamah_offset_minutes: z.coerce.number().int().min(0).max(60).default(10),
  maghrib_iqamah_offset_minutes: z.coerce.number().int().min(0).max(30).default(5),
  isha_iqamah_offset_minutes: z.coerce.number().int().min(0).max(60).default(15),
  jumuah_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm format')
    .optional()
    .nullable(),
  jumuah_second_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm format')
    .optional()
    .nullable(),
  jumuah_iqamah_offset_minutes: z.coerce.number().int().min(0).max(30).default(5),
  masjid_lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  masjid_lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  seasonal_overrides: z.record(z.unknown()).optional().nullable(),
});

export const prayerMonthQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).default(() => new Date().getFullYear()),
  month: z.coerce.number().int().min(1).max(12).default(() => new Date().getMonth() + 1),
});

export const todayPrayerQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
});

export type UpdatePrayerScheduleDto = z.input<typeof updatePrayerScheduleSchema>;
export type PrayerMonthQueryDto = z.input<typeof prayerMonthQuerySchema>;
export type TodayPrayerQueryDto = z.input<typeof todayPrayerQuerySchema>;