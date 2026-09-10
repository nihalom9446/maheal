export interface Mahal {
  id: string;
  name: string;
  name_ml: string | null;
  slug: string;
  faction: string;
  registration_type: string | null;
  waqf_number: string | null;
  address: string | null;
  district: string | null;
  masjid_lat: number | null;
  masjid_lng: number | null;
  contact_phone: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
}