import type { FamilyMember } from './member';

export interface Family {
  id: string;
  mahal_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string | null;
  door_number: string | null;
  address: string | null;
  ward_id: string | null;
  pirivu_amount: string; // decimal stored as string
  head_member_id: string | null;
  is_nri_household: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  notes: string | null;
  created_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Ward {
  id: string;
  mahal_id: string;
  name: string;
  name_ml: string | null;
  ward_number: number | null;
  convener_member_id: string | null;
  created_at: Date;
}

export interface WardWithCounts extends Ward {
  family_count: number;
  member_count: number;
  convener?: {
    id: string;
    name: string;
    name_ml: string | null;
    phone: string | null;
  } | null;
}

export interface FamilyListItem extends Family {
  ward?: {
    id: string;
    name: string;
    name_ml: string | null;
    ward_number: number | null;
  } | null;
  head_member?: {
    id: string;
    name: string;
    name_ml: string | null;
    phone: string | null;
    gender: 'M' | 'F' | null;
    blood_group: string | null;
    occupation: string | null;
    is_nri: boolean;
  } | null;
  member_count: number;
}

export interface FamilyDetail extends Family {
  ward?: {
    id: string;
    name: string;
    name_ml: string | null;
    ward_number: number | null;
  } | null;
  head_member?: FamilyMember | null;
  members: FamilyMember[];
}