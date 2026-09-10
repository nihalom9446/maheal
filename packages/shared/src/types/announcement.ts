export interface Announcement {
  id: string;
  mahal_id: string;
  title: string;
  title_ml: string | null;
  content: string | null;
  content_ml: string | null;
  category: string;
  priority: string;
  attachment_key: string | null;
  audience: string;
  target_ward_ids: string[] | null;
  death_record_id: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publish_at: Date | string | null;
  published_by_user_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AnnouncementListItem {
  id: string;
  mahal_id: string;
  title: string;
  title_ml?: string | null;
  content?: string | null;
  content_ml?: string | null;
  category: string;
  priority: string;
  attachment_key?: string | null;
  attachment_keys?: string[] | null;
  audience?: string;
  target_ward_ids?: string[] | null;
  death_record_id?: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publish_at?: Date | string | null;
  published_at?: Date | string | null;
  published_by_user_id?: string | null;
  author_user_id?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  publisher_name?: string | null;
}

export type DeathRecordListItem = DeathRecordItem;

export interface AnnouncementDetail extends AnnouncementListItem {
  death_record?: DeathRecord | null;
}

export interface DeathRecord {
  id: string;
  mahal_id: string;
  name: string;           // PUBLIC
  name_ml: string | null; // PUBLIC
  photo_key: string | null; // PUBLIC (served via signed URL)
  date_of_death: string | null;    // PRIVATE unless is_details_public
  burial_location: string | null;  // PRIVATE unless is_details_public
  family_id: string | null;        // PRIVATE unless is_details_public
  notes: string | null;            // PRIVATE unless is_details_public
  is_details_public: boolean;      // admin toggle
  announcement_id: string | null;
  created_by_user_id: string;
  created_at: Date | string;
}

export interface DeathRecordItem {
  id: string;
  mahal_id: string;
  name: string;
  name_ml?: string | null;
  photo_key?: string | null;
  date_of_death?: string | null;
  burial_location?: string | null;
  family_id?: string | null;
  member_id?: string | null;
  family_name?: string | null;
  family_number?: number | string | null;
  family_house_name?: string | null;
  family_house_name_ml?: string | null;
  house_name?: string | null;
  ward_id?: string | null;
  ward_name?: string | null;
  age?: number | string | null;
  prayer_time?: string | null;
  prayer_location?: string | null;
  status?: string | null;
  notes?: string | null;
  is_details_public: boolean;
  announcement_id?: string | null;
  created_by_user_id?: string | null;
  created_at: Date | string;
}

export interface EventListItem {
  id: string;
  mahal_id: string;
  title: string;
  title_ml: string | null;
  description: string | null;
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  location: string | null;
  image_key: string | null;
  status: string;
  created_by_user_id: string;
  created_at: Date | string;
}

export type EventDetail = EventListItem;