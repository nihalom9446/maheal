export type CertificateType = 'NIKAH' | 'NOC' | 'MEMBERSHIP';

export type CertificateStatus = 'ACTIVE' | 'REVOKED';

export interface NikahCertificateData {
  // Groom details
  groom_name: string;
  groom_name_ml?: string | null;
  groom_father: string;
  groom_father_ml?: string | null;
  groom_house: string;
  groom_house_ml?: string | null;
  groom_mahal: string;
  groom_mahal_ml?: string | null;
  groom_dob?: string | null;
  groom_phone?: string | null;

  // Bride details
  bride_name: string;
  bride_name_ml?: string | null;
  bride_father: string;
  bride_father_ml?: string | null;
  bride_house: string;
  bride_house_ml?: string | null;
  bride_mahal: string;
  bride_mahal_ml?: string | null;
  bride_dob?: string | null;
  bride_phone?: string | null;

  // Marriage / Nikah details
  mahr_amount?: string | number | null;
  mahr_description?: string | null;
  mahr_description_ml?: string | null;
  wali_name: string;
  wali_name_ml?: string | null;
  wali_relation: string;
  wali_relation_ml?: string | null;
  witness1_name: string;
  witness1_name_ml?: string | null;
  witness2_name: string;
  witness2_name_ml?: string | null;
  qazi_name: string;
  qazi_name_ml?: string | null;
  nikah_date: string; // YYYY-MM-DD
  nikah_time?: string | null;
  nikah_venue: string;
  nikah_venue_ml?: string | null;
  notes?: string | null;
}

export interface NocCertificateData {
  family_id: string;
  member_id?: string | null;
  target_mahal_name: string;
  target_mahal_name_ml?: string | null;
  destination_place: string;
  destination_place_ml?: string | null;
  reason: string;
  reason_ml?: string | null;
  issued_date: string; // YYYY-MM-DD
  valid_until?: string | null; // YYYY-MM-DD
  dues_cleared: boolean;
  notes?: string | null;
  // Denormalized details for offline/print rendering
  family_name?: string | null;
  family_number?: number | null;
  member_name?: string | null;
  member_name_ml?: string | null;
}

export interface MembershipCertificateData {
  family_id: string;
  member_id?: string | null;
  purpose: 'Scholarship' | 'Haj' | 'College Admission' | 'Government Scheme' | 'General' | 'Other' | string;
  purpose_ml?: string | null;
  custom_purpose_text?: string | null;
  custom_purpose_text_ml?: string | null;
  issued_date: string; // YYYY-MM-DD
  valid_until?: string | null; // YYYY-MM-DD
  notes?: string | null;
  // Denormalized details for offline/print rendering
  family_name?: string | null;
  family_number?: number | null;
  member_name?: string | null;
  member_name_ml?: string | null;
  house_name?: string | null;
  ward_name?: string | null;
}

export type CertificateDataPayload =
  | NikahCertificateData
  | NocCertificateData
  | MembershipCertificateData
  | Record<string, unknown>;

export interface CertificateItem {
  id: string;
  mahal_id: string;
  certificate_number: string;
  type: CertificateType;
  family_id?: string | null;
  member_id?: string | null;
  recipient_name: string;
  recipient_name_ml?: string | null;
  status: CertificateStatus;
  verification_token: string;
  issued_by_user_id: string;
  issued_by_name?: string | null;
  issued_at: string | Date;
  valid_until?: string | Date | null;
  revoked_at?: string | Date | null;
  revoked_reason?: string | null;
  data: CertificateDataPayload;
}

export interface CertificateDetail extends CertificateItem {
  mahal: {
    id: string;
    name: string;
    name_ml?: string | null;
    slug: string;
    registration_type?: string | null;
    waqf_number?: string | null;
    address?: string | null;
    district?: string | null;
    contact_phone?: string | null;
  };
  family?: {
    id: string;
    family_number: number;
    house_name: string;
    house_name_ml?: string | null;
    ward_name?: string | null;
  } | null;
  member?: {
    id: string;
    name: string;
    name_ml?: string | null;
    phone?: string | null;
  } | null;
  verification_url: string;
}

export interface PublicCertificateVerification {
  valid: boolean;
  certificate_number: string;
  type: CertificateType;
  status: CertificateStatus;
  issued_at: string | Date;
  valid_until?: string | Date | null;
  revoked_at?: string | Date | null;
  revoked_reason?: string | null;
  mahal: {
    name: string;
    name_ml?: string | null;
    district?: string | null;
    waqf_number?: string | null;
    registration_type?: string | null;
    address?: string | null;
  };
  recipient_name: string;
  recipient_name_ml?: string | null;
  summary: string;
  summary_ml?: string | null;
}
