import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, desc, isNull, inArray, count, sql } from 'drizzle-orm';
import axios from 'axios';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  notifications,
  notification_deliveries,
  announcements,
  user_mahal_roles,
  users,
  families,
  family_members,
} from '../../database/schema';
import {
  NotificationItem,
  NotificationFilterDto,
  NotificationListResponse,
  BroadcastResult,
  SendPushNotificationPayload,
} from '@maheall/shared';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send a push notification to a user with FCM integration & safe mock fallback.
   */
  async sendPushNotification(
    mahalId: string,
    userId: string,
    payload: SendPushNotificationPayload,
  ): Promise<NotificationItem> {
    // 1. Store notification in database
    const [notification] = await this.db
      .insert(notifications)
      .values({
        mahal_id: mahalId,
        user_id: userId,
        type: payload.type ?? 'GENERAL',
        title: payload.title,
        body: payload.body ?? null,
        data: payload.data ?? {},
        read_at: null,
      })
      .returning();

    // 2. Create pending delivery record
    const [delivery] = await this.db
      .insert(notification_deliveries)
      .values({
        notification_id: notification.id,
        channel: 'FCM',
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const fcmServerKey = this.configService.get<string>('FCM_SERVER_KEY');

    if (fcmServerKey) {
      try {
        // Real FCM Legacy / v1 send attempt
        const response = await axios.post(
          'https://fcm.googleapis.com/fcm/send',
          {
            to: `/topics/user_${userId}`,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              type: payload.type ?? 'GENERAL',
              notification_id: notification.id,
              ...payload.data,
            },
          },
          {
            headers: {
              Authorization: `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          },
        );

        const messageId = response.data?.message_id || `fcm-${Date.now()}`;
        await this.db
          .update(notification_deliveries)
          .set({
            status: 'DELIVERED',
            provider_message_id: String(messageId),
            delivered_at: new Date(),
          })
          .where(eq(notification_deliveries.id, delivery.id));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'FCM send failed';
        this.logger.warn(`FCM send error for user ${userId}: ${errorMsg}`);
        await this.db
          .update(notification_deliveries)
          .set({
            status: 'FAILED',
            error_message: errorMsg,
          })
          .where(eq(notification_deliveries.id, delivery.id));
      }
    } else {
      // Safe Mock Fallback
      this.logger.log(
        `[FCM MOCK] mahal=${mahalId} user=${userId} title="${payload.title}" body="${payload.body}"`,
      );
      await this.db
        .update(notification_deliveries)
        .set({
          status: 'DELIVERED',
          provider_message_id: `mock-fcm-${Date.now()}`,
          delivered_at: new Date(),
        })
        .where(eq(notification_deliveries.id, delivery.id));
    }

    return notification as unknown as NotificationItem;
  }

  /**
   * Send SMS via MSG91 with logger fallback in development.
   */
  async sendSms(
    mahalId: string,
    phone: string,
    message: string,
    templateId?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const senderId = this.configService.get<string>('MSG91_SENDER_ID') || 'MAHAL';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!authKey) {
      this.logger.warn(
        `[MSG91 MOCK] mahal=${mahalId} phone=${cleanPhone} sender=${senderId} message="${message}"`,
      );
      return { success: true, messageId: `mock-msg91-${Date.now()}` };
    }

    try {
      const payload: Record<string, unknown> = {
        sender: senderId,
        route: '4',
        country: '91',
        sms: [
          {
            message,
            to: [cleanPhone],
          },
        ],
      };

      if (templateId) {
        payload.template_id = templateId;
      }

      const response = await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        payload,
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const msgId = response.data?.message || `msg91-${Date.now()}`;
      return { success: true, messageId: String(msgId) };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'MSG91 send failed';
      this.logger.error(`Failed to send SMS to ${cleanPhone}: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Broadcast an announcement to its target audience.
   * Sends push notifications and triggers SMS for urgent categories (JANAZAH, EMERGENCY).
   */
  async broadcastAnnouncement(
    mahalId: string,
    announcementId: string,
  ): Promise<BroadcastResult> {
    const [announcement] = await this.db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.id, announcementId),
          eq(announcements.mahal_id, mahalId),
        ),
      )
      .limit(1);

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Determine target users based on audience
    const targetUserIds = new Set<string>();
    const targetPhones = new Map<string, string>(); // userId -> phone

    if (announcement.audience === 'ALL') {
      const roleUsers = await this.db
        .select({
          user_id: user_mahal_roles.user_id,
          phone: users.phone,
        })
        .from(user_mahal_roles)
        .innerJoin(users, eq(user_mahal_roles.user_id, users.id))
        .where(
          and(
            eq(user_mahal_roles.mahal_id, mahalId),
            eq(user_mahal_roles.is_active, true),
          ),
        );

      for (const r of roleUsers) {
        targetUserIds.add(r.user_id);
        if (r.phone) targetPhones.set(r.user_id, r.phone);
      }
    } else if (announcement.audience === 'COMMITTEE') {
      const committeeUsers = await this.db
        .select({
          user_id: user_mahal_roles.user_id,
          phone: users.phone,
        })
        .from(user_mahal_roles)
        .innerJoin(users, eq(user_mahal_roles.user_id, users.id))
        .where(
          and(
            eq(user_mahal_roles.mahal_id, mahalId),
            eq(user_mahal_roles.is_active, true),
            inArray(user_mahal_roles.role, ['MAHAL_ADMIN', 'TREASURER', 'COMMITTEE']),
          ),
        );

      for (const r of committeeUsers) {
        targetUserIds.add(r.user_id);
        if (r.phone) targetPhones.set(r.user_id, r.phone);
      }
    } else if (announcement.audience === 'MADRASA') {
      const madrasaUsers = await this.db
        .select({
          user_id: user_mahal_roles.user_id,
          phone: users.phone,
        })
        .from(user_mahal_roles)
        .innerJoin(users, eq(user_mahal_roles.user_id, users.id))
        .where(
          and(
            eq(user_mahal_roles.mahal_id, mahalId),
            eq(user_mahal_roles.is_active, true),
            inArray(user_mahal_roles.role, ['MADRASA_ADMIN', 'MADRASA_TEACHER']),
          ),
        );

      for (const r of madrasaUsers) {
        targetUserIds.add(r.user_id);
        if (r.phone) targetPhones.set(r.user_id, r.phone);
      }
    } else if (announcement.audience === 'WARD') {
      const wardIds = announcement.target_ward_ids || [];
      if (wardIds.length > 0) {
        const wardFamilyMembers = await this.db
          .select({
            member_phone: family_members.phone,
          })
          .from(families)
          .innerJoin(family_members, eq(families.id, family_members.family_id))
          .where(
            and(
              eq(families.mahal_id, mahalId),
              inArray(families.ward_id, wardIds),
            ),
          );

        const phones = wardFamilyMembers
          .map((m) => m.member_phone)
          .filter((p): p is string => !!p);

        if (phones.length > 0) {
          const matchedUsers = await this.db
            .select({
              id: users.id,
              phone: users.phone,
            })
            .from(users)
            .where(inArray(users.phone, phones));

          for (const u of matchedUsers) {
            targetUserIds.add(u.id);
            if (u.phone) targetPhones.set(u.id, u.phone);
          }
        }
      }
    }

    // If no specific users resolved, fallback to all mahal active users
    if (targetUserIds.size === 0) {
      const allUsers = await this.db
        .select({
          user_id: user_mahal_roles.user_id,
          phone: users.phone,
        })
        .from(user_mahal_roles)
        .innerJoin(users, eq(user_mahal_roles.user_id, users.id))
        .where(
          and(
            eq(user_mahal_roles.mahal_id, mahalId),
            eq(user_mahal_roles.is_active, true),
          ),
        );

      for (const r of allUsers) {
        targetUserIds.add(r.user_id);
        if (r.phone) targetPhones.set(r.user_id, r.phone);
      }
    }

    let pushCount = 0;
    let smsCount = 0;

    const isUrgent =
      announcement.category === 'JANAZAH' ||
      announcement.category === 'EMERGENCY' ||
      announcement.priority === 'URGENT';

    for (const userId of targetUserIds) {
      // Send push notification
      await this.sendPushNotification(mahalId, userId, {
        title: announcement.title,
        body: announcement.content ?? '',
        type: announcement.category,
        data: {
          announcement_id: announcement.id,
          priority: announcement.priority,
          category: announcement.category,
        },
      });
      pushCount++;

      // If urgent category, send SMS as well
      if (isUrgent) {
        const phone = targetPhones.get(userId);
        if (phone) {
          const smsText = `[${announcement.category}] ${announcement.title}: ${(announcement.content ?? '').slice(0, 120)}`;
          const smsRes = await this.sendSms(mahalId, phone, smsText);
          if (smsRes.success) smsCount++;
        }
      }
    }

    return {
      success: true,
      announcement_id: announcementId,
      recipients_count: targetUserIds.size,
      push_sent_count: pushCount,
      sms_sent_count: smsCount,
      message: `Broadcasted to ${targetUserIds.size} recipients (${pushCount} push, ${smsCount} SMS)`,
    };
  }

  /**
   * List paginated notifications for the authenticated user.
   */
  async listUserNotifications(
    mahalId: string,
    userId: string,
    query?: NotificationFilterDto,
  ): Promise<NotificationListResponse> {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(notifications.mahal_id, mahalId),
      eq(notifications.user_id, userId),
    ];

    if (query?.unread_only) {
      conditions.push(isNull(notifications.read_at));
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(whereClause);

    const [{ value: unreadTotal }] = await this.db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.mahal_id, mahalId),
          eq(notifications.user_id, userId),
          isNull(notifications.read_at),
        ),
      );

    const items = await this.db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as unknown as NotificationItem[],
      unread_count: Number(unreadTotal),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(
    mahalId: string,
    userId: string,
    notificationId: string,
  ): Promise<NotificationItem> {
    const [existing] = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.user_id, userId),
          eq(notifications.mahal_id, mahalId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    const [updated] = await this.db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(eq(notifications.id, notificationId))
      .returning();

    return updated as unknown as NotificationItem;
  }

  /**
   * Mark all unread notifications as read for a user.
   */
  async markAllAsRead(
    mahalId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string; count: number }> {
    const result = await this.db
      .update(notifications)
      .set({ read_at: new Date() })
      .where(
        and(
          eq(notifications.mahal_id, mahalId),
          eq(notifications.user_id, userId),
          isNull(notifications.read_at),
        ),
      )
      .returning();

    return {
      success: true,
      message: 'All notifications marked as read',
      count: result.length,
    };
  }
}