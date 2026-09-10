import { z } from 'zod';

export const notificationFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  unread_only: z
    .preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean())
    .optional(),
});

export const broadcastAnnouncementSchema = z.object({
  announcement_id: z.string().uuid({ message: 'Valid announcement ID is required' }),
});

export const sendPushNotificationSchema = z.object({
  userId: z.string().uuid({ message: 'Valid user ID is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  body: z.string().min(1, { message: 'Body is required' }),
  data: z.record(z.string()).optional(),
  type: z.string().optional().default('GENERAL'),
});

export const sendSmsSchema = z.object({
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  message: z.string().min(1, { message: 'Message cannot be empty' }),
  templateId: z.string().optional(),
});
