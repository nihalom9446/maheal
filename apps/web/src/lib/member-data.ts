// Member portal data model and state persistence helpers for MAHEALL

export interface MemberProfile {
  id: string;
  phone: string;
  family_id: string;
  family_number: number;
  house_name: string;
  house_name_ml: string;
  door_number: string;
  ward_id: string;
  ward_number: number;
  ward_name: string;
  ward_name_ml: string;
  head_name: string;
  head_name_ml: string;
  monthly_pirivu: number;
  is_nri_household: boolean;
  dpdpa_consent: boolean;
  dpdpa_consent_date: string;
}

export interface FamilyMemberRecord {
  id: string;
  name: string;
  name_ml: string;
  relationship: 'HEAD' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'SIBLING' | 'OTHER';
  gender: 'M' | 'F';
  dob: string;
  age: number;
  blood_group: string;
  occupation: string;
  occupation_ml: string;
  is_nri: boolean;
  nri_country?: string;
  phone?: string;
  status: 'ACTIVE' | 'DECEASED' | 'TRANSFERRED' | 'INACTIVE';
}

export interface PirivuMonthRecord {
  monthIndex: number; // 0 = Jan, 11 = Dec
  monthName: string;
  monthNameMl: string;
  year: number;
  status: 'PAID' | 'UNPAID';
  amount: number;
  receiptNumber?: string;
  paidDate?: string;
  paymentMethod?: 'UPI' | 'CASH' | 'NETBANKING' | 'GATEWAY';
  utrReference?: string;
}

export interface MadrasaChildRecord {
  id: string;
  member_id: string;
  name: string;
  name_ml: string;
  class_level: number; // 1 - 10
  admission_number: string;
  fee_category: 'REGULAR' | 'ORPHAN_FREE' | 'STAFF_CONCESSION' | 'DESERVING_POOR';
  monthly_fee: number;
  usthad_name: string;
  usthad_name_ml: string;
  attendance_stats: {
    total_days: number;
    present_days: number;
    absent_days: number;
    leave_days: number;
    percentage: number;
  };
  daily_attendance: Array<{
    date: string;
    day_name: string;
    status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';
  }>;
  fee_history: Array<{
    month: string;
    amount: number;
    receipt_number: string;
    paid_date: string;
    status: 'PAID' | 'DUE';
  }>;
}

export interface MemberCertificateRecord {
  id: string;
  certificate_number: string;
  type: 'NIKAH' | 'NOC' | 'MEMBERSHIP';
  title: string;
  title_ml: string;
  recipient_name: string;
  recipient_name_ml: string;
  purpose: string;
  purpose_ml: string;
  issued_date: string;
  valid_until?: string;
  status: 'ACTIVE' | 'REVOKED';
  verification_token: string;
  download_url?: string;
}

export interface CertificateRequestPayload {
  type: 'NIKAH' | 'NOC' | 'MEMBERSHIP';
  member_name: string;
  purpose: string;
  details: string;
  phone: string;
}

export interface MemberAnnouncementRecord {
  id: string;
  title: string;
  title_ml: string;
  content: string;
  content_ml: string;
  category: 'GENERAL' | 'WARD' | 'JANAZAH' | 'MADRASA' | 'FINANCE' | 'EVENT';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  is_ward_targeted: boolean;
  ward_name?: string;
  created_at: string;
  attachment_name?: string;
}

// Default Initial Member Profile (Baitul Noor - Family 104)
export const DEFAULT_MEMBER_PROFILE: MemberProfile = {
  id: 'usr_mem_104',
  phone: '+919846012345',
  family_id: 'fam_104',
  family_number: 104,
  house_name: 'Baitul Noor',
  house_name_ml: 'Baitul Noor',
  door_number: '14/280-B',
  ward_id: 'ward_3',
  ward_number: 3,
  ward_name: 'Ward 3 - Valiya Parambu',
  ward_name_ml: 'Ward 3 - Valiya Parambu',
  head_name: 'Abdurahiman Musliyar',
  head_name_ml: 'Abdurahiman Musliyar',
  monthly_pirivu: 200,
  is_nri_household: true,
  dpdpa_consent: true,
  dpdpa_consent_date: '2026-01-10T10:00:00.000Z',
};

export const DEFAULT_FAMILY_MEMBERS: FamilyMemberRecord[] = [
  {
    id: 'mem_1',
    name: 'Abdurahiman Musliyar',
    name_ml: 'Abdurahiman Musliyar',
    relationship: 'HEAD',
    gender: 'M',
    dob: '1968-05-14',
    age: 58,
    blood_group: 'O+',
    occupation: 'Islamic Scholar & Merchant',
    occupation_ml: 'Islamic Scholar & Merchant',
    is_nri: false,
    phone: '+91 98460 12345',
    status: 'ACTIVE',
  },
  {
    id: 'mem_2',
    name: 'Fathima Zohra',
    name_ml: 'Fathima Zohra',
    relationship: 'SPOUSE',
    gender: 'F',
    dob: '1974-08-22',
    age: 52,
    blood_group: 'B+',
    occupation: 'Homemaker',
    occupation_ml: 'Homemaker',
    is_nri: false,
    phone: '+91 98460 12346',
    status: 'ACTIVE',
  },
  {
    id: 'mem_3',
    name: 'Mohammed Bilal',
    name_ml: 'Mohammed Bilal',
    relationship: 'SON',
    gender: 'M',
    dob: '1999-02-11',
    age: 27,
    blood_group: 'O+',
    occupation: 'Software Engineer',
    occupation_ml: 'Software Engineer',
    is_nri: true,
    nri_country: 'United Arab Emirates (Dubai)',
    phone: '+971 50 123 4567',
    status: 'ACTIVE',
  },
  {
    id: 'mem_4',
    name: 'Amina Tasneem',
    name_ml: 'Amina Tasneem',
    relationship: 'DAUGHTER',
    gender: 'F',
    dob: '2005-11-03',
    age: 21,
    blood_group: 'A+',
    occupation: 'B.Sc Computer Science Student',
    occupation_ml: 'B.Sc Computer Science Student',
    is_nri: false,
    phone: '+91 98460 55443',
    status: 'ACTIVE',
  },
  {
    id: 'mem_5',
    name: 'Ahmed Rayan',
    name_ml: 'Ahmed Rayan',
    relationship: 'SON',
    gender: 'M',
    dob: '2014-06-18',
    age: 12,
    blood_group: 'O+',
    occupation: 'Madrasa Std 7 & School Student',
    occupation_ml: 'Madrasa Std 7 & School Student',
    is_nri: false,
    status: 'ACTIVE',
  },
  {
    id: 'mem_6',
    name: 'Ayisha Mariyam',
    name_ml: 'Ayisha Mariyam',
    relationship: 'DAUGHTER',
    gender: 'F',
    dob: '2018-09-25',
    age: 8,
    blood_group: 'B+',
    occupation: 'Madrasa Std 3 & School Student',
    occupation_ml: 'Madrasa Std 3 & School Student',
    is_nri: false,
    status: 'ACTIVE',
  },
];

export const DEFAULT_PIRIVU_RECORDS: PirivuMonthRecord[] = [
  { monthIndex: 0, monthName: 'January', monthNameMl: 'January', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-0129', paidDate: '2026-01-05', paymentMethod: 'UPI', utrReference: 'UPI/20260105/9846012' },
  { monthIndex: 1, monthName: 'February', monthNameMl: 'February', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-0452', paidDate: '2026-02-04', paymentMethod: 'UPI', utrReference: 'UPI/20260204/8834921' },
  { monthIndex: 2, monthName: 'March', monthNameMl: 'March', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-0891', paidDate: '2026-03-08', paymentMethod: 'CASH', utrReference: 'OFFICE-CASH-DESK-2' },
  { monthIndex: 3, monthName: 'April', monthNameMl: 'April', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-1204', paidDate: '2026-04-06', paymentMethod: 'UPI', utrReference: 'UPI/20260406/3392810' },
  { monthIndex: 4, monthName: 'May', monthNameMl: 'May', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-1588', paidDate: '2026-05-10', paymentMethod: 'UPI', utrReference: 'UPI/20260510/7729103' },
  { monthIndex: 5, monthName: 'June', monthNameMl: 'June', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-1934', paidDate: '2026-06-03', paymentMethod: 'NETBANKING', utrReference: 'SBIN00489218902' },
  { monthIndex: 6, monthName: 'July', monthNameMl: 'July', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-2310', paidDate: '2026-07-07', paymentMethod: 'UPI', utrReference: 'UPI/20260707/4491028' },
  { monthIndex: 7, monthName: 'August', monthNameMl: 'August', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-2678', paidDate: '2026-08-05', paymentMethod: 'UPI', utrReference: 'UPI/20260805/1192837' },
  { monthIndex: 8, monthName: 'September', monthNameMl: 'September', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-3021', paidDate: '2026-09-02', paymentMethod: 'UPI', utrReference: 'UPI/20260902/5592819' },
  { monthIndex: 9, monthName: 'October', monthNameMl: 'October', year: 2026, status: 'PAID', amount: 200, receiptNumber: 'PRV-2026-3390', paidDate: '2026-10-04', paymentMethod: 'UPI', utrReference: 'UPI/20261004/8839102' },
  { monthIndex: 10, monthName: 'November', monthNameMl: 'November', year: 2026, status: 'UNPAID', amount: 200 },
  { monthIndex: 11, monthName: 'December', monthNameMl: 'December', year: 2026, status: 'UNPAID', amount: 200 },
];

export const DEFAULT_MADRASA_CHILDREN: MadrasaChildRecord[] = [
  {
    id: 'std_child_1',
    member_id: 'mem_5',
    name: 'Ahmed Rayan',
    name_ml: 'Ahmed Rayan',
    class_level: 7,
    admission_number: 'MDR-2021-078',
    fee_category: 'REGULAR',
    monthly_fee: 250,
    usthad_name: 'Usman Faizy',
    usthad_name_ml: 'Usman Faizy',
    attendance_stats: {
      total_days: 25,
      present_days: 24,
      absent_days: 1,
      leave_days: 0,
      percentage: 96,
    },
    daily_attendance: [
      { date: '2026-09-01', day_name: 'Tue', status: 'PRESENT' },
      { date: '2026-09-02', day_name: 'Wed', status: 'PRESENT' },
      { date: '2026-09-03', day_name: 'Thu', status: 'PRESENT' },
      { date: '2026-09-04', day_name: 'Fri', status: 'HOLIDAY' },
      { date: '2026-09-05', day_name: 'Sat', status: 'PRESENT' },
      { date: '2026-09-06', day_name: 'Sun', status: 'PRESENT' },
      { date: '2026-09-07', day_name: 'Mon', status: 'ABSENT' },
      { date: '2026-09-08', day_name: 'Tue', status: 'PRESENT' },
    ],
    fee_history: [
      { month: 'September 2026', amount: 250, receipt_number: 'MDR-RCP-2026-09-078', paid_date: '2026-09-03', status: 'PAID' },
      { month: 'August 2026', amount: 250, receipt_number: 'MDR-RCP-2026-08-078', paid_date: '2026-08-04', status: 'PAID' },
      { month: 'July 2026', amount: 250, receipt_number: 'MDR-RCP-2026-07-078', paid_date: '2026-07-05', status: 'PAID' },
      { month: 'June 2026', amount: 250, receipt_number: 'MDR-RCP-2026-06-078', paid_date: '2026-06-06', status: 'PAID' },
    ],
  },
  {
    id: 'std_child_2',
    member_id: 'mem_6',
    name: 'Ayisha Mariyam',
    name_ml: 'Ayisha Mariyam',
    class_level: 3,
    admission_number: 'MDR-2023-142',
    fee_category: 'REGULAR',
    monthly_fee: 200,
    usthad_name: 'Abdullah Saqafi',
    usthad_name_ml: 'Abdullah Saqafi',
    attendance_stats: {
      total_days: 25,
      present_days: 23,
      absent_days: 1,
      leave_days: 1,
      percentage: 92,
    },
    daily_attendance: [
      { date: '2026-09-01', day_name: 'Tue', status: 'PRESENT' },
      { date: '2026-09-02', day_name: 'Wed', status: 'PRESENT' },
      { date: '2026-09-03', day_name: 'Thu', status: 'LEAVE' },
      { date: '2026-09-04', day_name: 'Fri', status: 'HOLIDAY' },
      { date: '2026-09-05', day_name: 'Sat', status: 'PRESENT' },
      { date: '2026-09-06', day_name: 'Sun', status: 'PRESENT' },
      { date: '2026-09-07', day_name: 'Mon', status: 'ABSENT' },
      { date: '2026-09-08', day_name: 'Tue', status: 'PRESENT' },
    ],
    fee_history: [
      { month: 'September 2026', amount: 200, receipt_number: 'MDR-RCP-2026-09-142', paid_date: '2026-09-03', status: 'PAID' },
      { month: 'August 2026', amount: 200, receipt_number: 'MDR-RCP-2026-08-142', paid_date: '2026-08-04', status: 'PAID' },
      { month: 'July 2026', amount: 200, receipt_number: 'MDR-RCP-2026-07-142', paid_date: '2026-07-05', status: 'PAID' },
      { month: 'June 2026', amount: 200, receipt_number: 'MDR-RCP-2026-06-142', paid_date: '2026-06-06', status: 'PAID' },
    ],
  },
];

export const DEFAULT_CERTIFICATES: MemberCertificateRecord[] = [
  {
    id: 'crt_1',
    certificate_number: 'CRT-NKH-2024-0089',
    type: 'NIKAH',
    title: 'Nikah Marriage Certificate',
    title_ml: 'Nikah Marriage Certificate',
    recipient_name: 'Mohammed Bilal & Fathima Hiba',
    recipient_name_ml: 'Mohammed Bilal & Fathima Hiba',
    purpose: 'Official Marriage Record & Embassy Visa Attestation',
    purpose_ml: 'Official Marriage Record & Embassy Visa Attestation',
    issued_date: '2024-01-12',
    status: 'ACTIVE',
    verification_token: 'vtok_nkh_88492019',
  },
  {
    id: 'crt_2',
    certificate_number: 'CRT-MEM-2025-0142',
    type: 'MEMBERSHIP',
    title: 'Mahal Membership & Residence Certificate',
    title_ml: 'Mahal Membership & Residence Certificate',
    recipient_name: 'Amina Tasneem',
    recipient_name_ml: 'Amina Tasneem',
    purpose: 'Higher Education Minority Scholarship Scheme',
    purpose_ml: 'Higher Education Minority Scholarship Scheme',
    issued_date: '2025-08-15',
    valid_until: '2026-08-14',
    status: 'ACTIVE',
    verification_token: 'vtok_mem_39102847',
  },
  {
    id: 'crt_3',
    certificate_number: 'CRT-NOC-2026-0031',
    type: 'NOC',
    title: 'Mahal Transfer & Clearance NOC',
    title_ml: 'Mahal Transfer & Clearance NOC',
    recipient_name: 'Abdurahiman Musliyar (Family 104)',
    recipient_name_ml: 'Abdurahiman Musliyar (Family 104)',
    purpose: 'Property Registration Verification & Dues Clearance',
    purpose_ml: 'Property Registration Verification & Dues Clearance',
    issued_date: '2026-02-20',
    valid_until: '2026-08-20',
    status: 'ACTIVE',
    verification_token: 'vtok_noc_77192034',
  },
];

export const DEFAULT_ANNOUNCEMENTS: MemberAnnouncementRecord[] = [
  {
    id: 'ann_1',
    title: 'Emergency: Ward 3 Water Pipeline Maintenance & Tanker Facility',
    title_ml: 'Emergency: Ward 3 Water Pipeline Maintenance & Tanker Facility',
    content: 'KWA pipeline repair work in Ward 3 Parambu lane tomorrow from 8:00 AM to 4:00 PM. Water supply tanker arranged near Parambu Masjid junction.',
    content_ml: 'KWA pipeline repair work in Ward 3 Parambu lane tomorrow from 8:00 AM to 4:00 PM. Water supply tanker arranged near Parambu Masjid junction.',
    category: 'WARD',
    priority: 'HIGH',
    is_ward_targeted: true,
    ward_name: 'Ward 3 - Valiya Parambu',
    created_at: '2026-09-08T09:30:00Z',
  },
  {
    id: 'ann_2',
    title: 'Janazah Notice: K. Mohammed Haji (78), Baitul Hamd',
    title_ml: 'Janazah Notice: K. Mohammed Haji (78), Baitul Hamd',
    content: 'Janazah prayer will be held today after Asr prayer (04:45 PM) at Noorul Islam Juma Masjid. May Allah grant Maghfirah and elevate him in Jannat-ul-Firdaus.',
    content_ml: 'Janazah prayer will be held today after Asr prayer (04:45 PM) at Noorul Islam Juma Masjid. May Allah grant Maghfirah and elevate him in Jannat-ul-Firdaus.',
    category: 'JANAZAH',
    priority: 'URGENT',
    is_ward_targeted: false,
    created_at: '2026-09-08T07:15:00Z',
  },
  {
    id: 'ann_3',
    title: 'Madrasa Half-Yearly Examination & Parent-Teacher Meet (PTM)',
    title_ml: 'Madrasa Half-Yearly Examination & Parent-Teacher Meet (PTM)',
    content: 'Half-yearly exams for Std 1 to 10 will commence from October 5th. All parents are requested to attend the preparatory PTM this Sunday at 10:30 AM.',
    content_ml: 'Half-yearly exams for Std 1 to 10 will commence from October 5th. All parents are requested to attend the preparatory PTM this Sunday at 10:30 AM.',
    category: 'MADRASA',
    priority: 'NORMAL',
    is_ward_targeted: false,
    created_at: '2026-09-06T14:00:00Z',
    attachment_name: 'Madrasa_Exam_TimeTable_2026.pdf',
  },
  {
    id: 'ann_4',
    title: 'Digital Pirivu Auto-Receipt System Activated for Mahal Residents',
    title_ml: 'Digital Pirivu Auto-Receipt System Activated for Mahal Residents',
    content: 'Residents can now view, download, and verify instant PDF & WhatsApp receipts for all monthly pirivu and madrasa fee contributions through this portal.',
    content_ml: 'Residents can now view, download, and verify instant PDF & WhatsApp receipts for all monthly pirivu and madrasa fee contributions through this portal.',
    category: 'FINANCE',
    priority: 'NORMAL',
    is_ward_targeted: false,
    created_at: '2026-09-01T10:00:00Z',
  },
];
