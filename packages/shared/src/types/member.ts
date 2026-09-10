export interface FamilyMember {
  id: string;
  mahal_id: string;
  family_id: string;
  name: string;
  name_ml: string | null;
  gender: 'M' | 'F' | null;
  date_of_birth: string | null;
  relationship_to_head: string | null; // HEAD/SPOUSE/SON/DAUGHTER/FATHER/MOTHER/SIBLING/OTHER
  phone: string | null;
  blood_group: string | null;
  occupation: string | null;
  is_nri: boolean;
  nri_country: string | null;
  status: 'ACTIVE' | 'DECEASED' | 'TRANSFERRED' | 'INACTIVE';
  profile_image_key: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MemberListItem extends FamilyMember {
  family?: {
    id: string;
    family_number: number;
    house_name: string;
    house_name_ml: string | null;
    ward_id: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  } | null;
  ward?: {
    id: string;
    name: string;
    name_ml: string | null;
    ward_number: number | null;
  } | null;
}

export interface MemberDetail extends FamilyMember {
  family?: {
    id: string;
    family_number: number;
    house_name: string;
    house_name_ml: string | null;
    address: string | null;
    door_number: string | null;
    pirivu_amount: string;
    status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  } | null;
  ward?: {
    id: string;
    name: string;
    name_ml: string | null;
    ward_number: number | null;
  } | null;
}