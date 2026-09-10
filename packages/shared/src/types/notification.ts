export type NotificationChannel = 'FCM' | 'SMS';
export type NotificationDeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

export interface NotificationItem {
  id: string;
  mahal_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read_at: Date | string | null;
  created_at: Date | string;
}

export interface NotificationFilterDto {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unread_count: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BroadcastAnnouncementDto {
  announcement_id: string;
}

export interface BroadcastResult {
  success: boolean;
  announcement_id: string;
  recipients_count: number;
  push_sent_count: number;
  sms_sent_count: number;
  message: string;
}

export interface SendPushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: string;
}
