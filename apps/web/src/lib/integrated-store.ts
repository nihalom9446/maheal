import type {
  FamilyListItem,
  FamilyDetail,
  FamilyMember,
  WardWithCounts,
  CreateFamilyDto,
  UpdateFamilyDto,
  CreateMemberDto,
  UpdateMemberDto,
  DeathRecordItem,
  CreateDeathRecordDto,
  UpdateDeathRecordDto,
  DeathRecordFilterDto,
  AnnouncementListItem,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
  EventListItem,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
  CertificateItem,
  CertificateDetail,
  IssueNikahCertificateDto,
  IssueNocCertificateDto,
  IssueMembershipCertificateDto,
  CertificateFilterDto,
  IncomeListItem,
  ExpenseListItem,
  CreateIncomeDto,
  CreateExpenseDto,
  IncomeFilterDto,
  ExpenseFilterDto,
  FinancialSummaryDto,
  MadrasaStudentItem,
  MadrasaStudentDetail,
  EnrollStudentDto,
  UpdateStudentDto,
  StudentFilterDto,
} from '@maheall/shared';

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STORAGE_KEY = 'maheall_integrated_db_v3';
const VERIFIED_CERTS_KEY = 'maheall_global_verified_certificates';

const now = new Date();

// Initial Wards
const INITIAL_WARDS: WardWithCounts[] = [
  { id: 'ward-1', mahal_id: 'default', ward_number: 1, name: 'Ward 1 - Central Town', name_ml: 'Ward 1 - Central Town', convener_member_id: null, created_at: now, family_count: 28, member_count: 124 },
  { id: 'ward-2', mahal_id: 'default', ward_number: 2, name: 'Ward 2 - South Gate', name_ml: 'Ward 2 - South Gate', convener_member_id: null, created_at: now, family_count: 35, member_count: 168 },
  { id: 'ward-3', mahal_id: 'default', ward_number: 3, name: 'Ward 3 - Valiya Parambu', name_ml: 'Ward 3 - Valiya Parambu', convener_member_id: null, created_at: now, family_count: 42, member_count: 195 },
  { id: 'ward-4', mahal_id: 'default', ward_number: 4, name: 'Ward 4 - North Hills', name_ml: 'Ward 4 - North Hills', convener_member_id: null, created_at: now, family_count: 19, member_count: 82 },
];

// Helper to create members
function makeMember(id: string, famId: string, name: string, gender: 'M' | 'F', dob: string, rel: string, phone: string | null, blood: string | null, occ: string | null, nri: boolean, nriCountry: string | null = null): FamilyMember {
  return {
    id,
    mahal_id: 'default',
    family_id: famId,
    name,
    name_ml: name,
    gender,
    date_of_birth: dob,
    relationship_to_head: rel,
    phone,
    blood_group: blood,
    occupation: occ,
    is_nri: nri,
    nri_country: nriCountry,
    status: 'ACTIVE',
    profile_image_key: null,
    notes: null,
    created_at: now,
    updated_at: now,
  };
}

const mem104 = [
  makeMember('mem_1', 'fam_104', 'Abdurahiman Musliyar', 'M', '1968-05-14', 'HEAD', '+91 98460 12345', 'O+', 'Islamic Scholar & Merchant', false),
  makeMember('mem_2', 'fam_104', 'Fathima Zohra', 'F', '1974-08-22', 'SPOUSE', '+91 98460 12346', 'B+', 'Homemaker', false),
  makeMember('mem_3', 'fam_104', 'Mohammed Bilal', 'M', '1999-02-11', 'SON', '+971 50 123 4567', 'O+', 'Software Engineer', true, 'UAE (Dubai)'),
  makeMember('mem_4', 'fam_104', 'Amina Tasneem', 'F', '2005-11-03', 'DAUGHTER', '+91 98460 55443', 'A+', 'B.Sc Student', false),
  makeMember('mem_5', 'fam_104', 'Ahmed Rayan', 'M', '2014-06-18', 'SON', null, 'O+', 'Madrasa Std 7', false),
  makeMember('mem_6', 'fam_104', 'Ayisha Mariyam', 'F', '2018-09-25', 'DAUGHTER', null, 'B+', 'Madrasa Std 3', false),
];

const mem105 = [
  makeMember('mem_105_1', 'fam_105', 'P. V. Usman', 'M', '1962-04-10', 'HEAD', '+91 98471 22334', 'B+', 'Merchant', false),
  makeMember('mem_105_2', 'fam_105', 'Mariyam', 'F', '1968-07-15', 'SPOUSE', null, 'A+', 'Homemaker', false),
  makeMember('mem_105_3', 'fam_105', 'Adil Usman', 'M', '2002-09-08', 'SON', '+91 98471 99887', 'B+', 'Accountant', false),
];

const mem106 = [
  makeMember('mem_106_1', 'fam_106', 'K. Mohammed Haji', 'M', '1948-03-12', 'HEAD', '+91 98462 33445', 'A+', 'Retired Teacher', false),
  makeMember('mem_106_2', 'fam_106', 'Zainaba', 'F', '1954-11-19', 'SPOUSE', null, 'O+', 'Homemaker', false),
  makeMember('mem_106_3', 'fam_106', 'Subair', 'M', '1981-06-20', 'SON', '+91 98462 77889', 'A+', 'Merchant', false),
];

const mem107 = [
  makeMember('mem_107_1', 'fam_107', 'M. K. Koya', 'M', '1976-02-18', 'HEAD', '+91 98473 44556', 'O+', 'Driver', false),
  makeMember('mem_107_2', 'fam_107', 'Khadeeja', 'F', '1982-05-11', 'SPOUSE', null, 'B+', 'Homemaker', false),
];

// Initial Families
const INITIAL_FAMILIES: FamilyDetail[] = [
  {
    id: 'fam_104',
    mahal_id: 'default',
    family_number: 104,
    house_name: 'Baitul Noor',
    house_name_ml: 'Baitul Noor',
    door_number: '14/280-B',
    address: 'Near Town Juma Masjid, Valiya Parambu',
    ward_id: 'ward-3',
    pirivu_amount: '200.00',
    head_member_id: 'mem_1',
    is_nri_household: true,
    status: 'ACTIVE',
    notes: 'Long-standing active Mahal family. Member portal linked account.',
    created_by_user_id: 'admin_1',
    created_at: now,
    updated_at: now,
    ward: { id: 'ward-3', name: 'Ward 3 - Valiya Parambu', name_ml: 'Ward 3 - Valiya Parambu', ward_number: 3 },
    head_member: mem104[0],
    members: mem104,
  },
  {
    id: 'fam_105',
    mahal_id: 'default',
    family_number: 105,
    house_name: 'Rahmath Manzil',
    house_name_ml: 'Rahmath Manzil',
    door_number: '12/104-A',
    address: 'Main Bazaar Road, Ward 1',
    ward_id: 'ward-1',
    pirivu_amount: '150.00',
    head_member_id: 'mem_105_1',
    is_nri_household: false,
    status: 'ACTIVE',
    notes: 'Established trading family.',
    created_by_user_id: 'admin_1',
    created_at: now,
    updated_at: now,
    ward: { id: 'ward-1', name: 'Ward 1 - Central Town', name_ml: 'Ward 1 - Central Town', ward_number: 1 },
    head_member: mem105[0],
    members: mem105,
  },
  {
    id: 'fam_106',
    mahal_id: 'default',
    family_number: 106,
    house_name: 'Kuttiyadi House',
    house_name_ml: 'Kuttiyadi House',
    door_number: '08/45-C',
    address: 'South Mosque Road, Ward 2',
    ward_id: 'ward-2',
    pirivu_amount: '250.00',
    head_member_id: 'mem_106_1',
    is_nri_household: true,
    status: 'ACTIVE',
    notes: 'Elderly household head.',
    created_by_user_id: 'admin_1',
    created_at: now,
    updated_at: now,
    ward: { id: 'ward-2', name: 'Ward 2 - South Gate', name_ml: 'Ward 2 - South Gate', ward_number: 2 },
    head_member: mem106[0],
    members: mem106,
  },
  {
    id: 'fam_107',
    mahal_id: 'default',
    family_number: 107,
    house_name: 'Darussalam',
    house_name_ml: 'Darussalam',
    door_number: '19/88',
    address: 'Hilltop Lane, Ward 4',
    ward_id: 'ward-4',
    pirivu_amount: '100.00',
    head_member_id: 'mem_107_1',
    is_nri_household: false,
    status: 'ACTIVE',
    notes: 'Welfare subsidy eligible household.',
    created_by_user_id: 'admin_1',
    created_at: now,
    updated_at: now,
    ward: { id: 'ward-4', name: 'Ward 4 - North Hills', name_ml: 'Ward 4 - North Hills', ward_number: 4 },
    head_member: mem107[0],
    members: mem107,
  },
];

// Initial Death Records
const INITIAL_DEATHS: DeathRecordItem[] = [
  {
    id: 'death-1',
    mahal_id: 'default',
    name: 'K. Mohammed Haji (78)',
    name_ml: 'K. Mohammed Haji (78)',
    photo_key: null,
    date_of_death: new Date().toISOString().split('T')[0],
    burial_location: 'Noorul Islam Masjid Cemetery (Kabaristan)',
    family_id: 'fam_106',
    house_name: 'Kuttiyadi House',
    notes: 'Janazah prayer today after Asr prayer at the main Juma Masjid. Children: Subair, Fathima.',
    is_details_public: true,
    announcement_id: 'ann-janazah-1',
    created_by_user_id: 'system',
    created_at: new Date().toISOString(),
  },
  {
    id: 'death-2',
    mahal_id: 'default',
    name: 'Amina Umma (82)',
    name_ml: 'Amina Umma (82)',
    photo_key: null,
    date_of_death: '2026-08-28',
    burial_location: 'Noorul Islam Masjid Cemetery (Kabaristan)',
    family_id: 'fam_105',
    house_name: 'Rahmath Manzil',
    notes: 'Burial took place at 10:00 AM at the Masjid Cemetery. May Allah grant Maghfirah.',
    is_details_public: true,
    announcement_id: null,
    created_by_user_id: 'system',
    created_at: '2026-08-28T09:00:00.000Z',
  },
];

// Initial Announcements
const INITIAL_ANNOUNCEMENTS: AnnouncementListItem[] = [
  {
    id: 'ann-1',
    mahal_id: 'default',
    title: 'Grand Milad Conference 2026 & Cultural Fest',
    title_ml: 'Grand Milad Conference 2026 & Cultural Fest',
    content: 'All Mahal members and families are cordially invited to the Milad Conference on 15th September. Spiritual talks, awards ceremony, and community dinner will be held.',
    content_ml: 'All Mahal members and families are cordially invited to the Milad Conference on 15th September.',
    category: 'EVENT',
    priority: 'HIGH',
    audience: 'ALL',
    target_ward_ids: null,
    publish_at: new Date('2026-09-01'),
    status: 'PUBLISHED',
    attachment_key: null,
    death_record_id: null,
    created_at: new Date('2026-09-01'),
    updated_at: new Date('2026-09-01'),
  },
  {
    id: 'ann-janazah-1',
    mahal_id: 'default',
    title: 'Janazah Notification: K. Mohammed Haji (78)',
    title_ml: 'Janazah Notification: K. Mohammed Haji (78)',
    content: 'Janazah prayer for K. Mohammed Haji (78, Kuttiyadi House, Ward 2) will take place today after Asr prayer at the Noorul Islam Juma Masjid. Burial at the Masjid Cemetery.',
    content_ml: 'Janazah prayer for K. Mohammed Haji will take place today after Asr prayer.',
    category: 'JANAZAH',
    priority: 'HIGH',
    audience: 'ALL',
    target_ward_ids: null,
    publish_at: new Date(),
    status: 'PUBLISHED',
    attachment_key: null,
    death_record_id: 'death-1',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'ann-3',
    mahal_id: 'default',
    title: 'Monthly Pirivu Dues Collection Notice',
    title_ml: 'Monthly Pirivu Dues Collection Notice',
    content: 'Ward representatives are conducting the monthly Pirivu collection. Members can also pay securely online via UPI or Bank Transfer through the Member Portal.',
    content_ml: 'Ward representatives are conducting the monthly Pirivu collection.',
    category: 'FINANCE',
    priority: 'NORMAL',
    audience: 'ALL',
    target_ward_ids: null,
    publish_at: new Date('2026-09-02'),
    status: 'PUBLISHED',
    attachment_key: null,
    death_record_id: null,
    created_at: new Date('2026-09-02'),
    updated_at: new Date('2026-09-02'),
  },
  {
    id: 'ann-4',
    mahal_id: 'default',
    title: 'Madrasa Half-Yearly Examinations Schedule',
    title_ml: 'Madrasa Half-Yearly Examinations Schedule',
    content: 'Half-yearly examinations for Standards 1 through 10 will commence on October 5th. Parents are requested to ensure regular attendance and fee clearance.',
    content_ml: 'Half-yearly examinations for Standards 1 through 10 will commence on October 5th.',
    category: 'MADRASA',
    priority: 'NORMAL',
    audience: 'ALL',
    target_ward_ids: null,
    publish_at: new Date('2026-09-04'),
    status: 'PUBLISHED',
    attachment_key: null,
    death_record_id: null,
    created_at: new Date('2026-09-04'),
    updated_at: new Date('2026-09-04'),
  },
];

// Initial Events
const INITIAL_EVENTS: EventListItem[] = [
  {
    id: 'event-1',
    mahal_id: 'default',
    title: 'Grand Milad Conference & Cultural Fest 2026',
    title_ml: 'Grand Milad Conference & Cultural Fest 2026',
    description: 'Annual Mawlid commemoration featuring spiritual talks, recitation of Burdah, and awards ceremony for top Madrasa rank holders.',
    starts_at: '2026-09-15T09:00:00.000Z',
    ends_at: '2026-09-15T21:00:00.000Z',
    location: 'Noorul Islam Masjid Convention Centre',
    image_key: null,
    status: 'ACTIVE',
    created_by_user_id: 'admin_1',
    created_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'event-2',
    mahal_id: 'default',
    title: 'Free Mega Health & Ophthalmology Medical Camp',
    title_ml: 'Free Mega Health & Ophthalmology Medical Camp',
    description: 'Comprehensive general health, diabetes, cardiac ECG checkup and free eye cataract screenings in association with Calicut Medical College doctors.',
    starts_at: '2026-09-20T08:30:00.000Z',
    ends_at: '2026-09-20T14:00:00.000Z',
    location: 'Mahal Welfare Relief Complex, Ward 2',
    image_key: null,
    status: 'ACTIVE',
    created_by_user_id: 'admin_1',
    created_at: new Date('2026-09-02').toISOString(),
  },
  {
    id: 'event-3',
    mahal_id: 'default',
    title: 'Mahal Annual General Body Meeting',
    title_ml: 'Mahal Annual General Body Meeting',
    description: 'Presentation of annual financial audit statements, election of ward executive representatives, and review of community development masterplan.',
    starts_at: '2026-09-27T14:00:00.000Z',
    ends_at: '2026-09-27T17:30:00.000Z',
    location: 'Masjid Basement Hall',
    image_key: null,
    status: 'ACTIVE',
    created_by_user_id: 'admin_1',
    created_at: new Date('2026-09-03').toISOString(),
  },
];

// Initial Certificates
const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert_1',
    mahal_id: 'default',
    certificate_number: 'NOC-2026-0042',
    type: 'NOC',
    family_id: 'fam_104',
    member_id: 'mem_3',
    recipient_name: 'Mohammed Bilal',
    recipient_name_ml: 'Mohammed Bilal',
    status: 'ACTIVE',
    verification_token: 'vtok_bilal_noc_2026',
    issued_by_user_id: 'admin_1',
    issued_by_name: 'Mahal General Secretary',
    issued_at: '2026-01-15T10:00:00.000Z',
    valid_until: '2026-07-15T10:00:00.000Z',
    revoked_at: null,
    revoked_reason: null,
    data: {
      family_id: 'fam_104',
      member_id: 'mem_3',
      target_mahal_name: 'Dubai Islamic Affairs & Awqaf',
      destination_place: 'Dubai, UAE',
      reason: 'Overseas Employment & Residence Transfer',
      issued_date: '2026-01-15',
      valid_until: '2026-07-15',
      dues_cleared: true,
      family_name: 'Baitul Noor',
      family_number: 104,
      member_name: 'Mohammed Bilal',
    },
  },
  {
    id: 'cert_2',
    mahal_id: 'default',
    certificate_number: 'MEM-2026-0019',
    type: 'MEMBERSHIP',
    family_id: 'fam_104',
    member_id: 'mem_4',
    recipient_name: 'Amina Tasneem',
    recipient_name_ml: 'Amina Tasneem',
    status: 'ACTIVE',
    verification_token: 'vtok_amina_mem_2026',
    issued_by_user_id: 'admin_1',
    issued_by_name: 'Mahal General Secretary',
    issued_at: '2026-02-10T11:00:00.000Z',
    valid_until: '2027-02-10T11:00:00.000Z',
    revoked_at: null,
    revoked_reason: null,
    data: {
      family_id: 'fam_104',
      member_id: 'mem_4',
      purpose: 'Scholarship',
      custom_purpose_text: 'Higher Education State Scholarship Application',
      issued_date: '2026-02-10',
      valid_until: '2027-02-10',
      family_name: 'Baitul Noor',
      family_number: 104,
      member_name: 'Amina Tasneem',
      house_name: 'Baitul Noor',
      ward_name: 'Ward 3 - Valiya Parambu',
    },
  },
];

// Initial Finance Incomes
const INITIAL_INCOMES: IncomeListItem[] = [
  {
    id: 'inc-1',
    mahal_id: 'default',
    fund_type: 'GENERAL',
    category: 'PIRIVU',
    amount: '12400',
    payment_date: '2026-09-05',
    payment_method: 'CASH',
    reference: 'PRV-2026-0901',
    receipt_key: null,
    payer_name: 'Ward 3 Monthly Collection (Valiya Parambu)',
    description: 'Monthly Pirivu collection from Ward 3 households',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'inc-2',
    mahal_id: 'default',
    fund_type: 'GENERAL',
    category: 'DONATION',
    amount: '5000',
    payment_date: '2026-09-06',
    payment_method: 'UPI',
    reference: 'DON-2026-3841',
    receipt_key: null,
    payer_name: 'Dr. K. P. Zubair',
    description: 'Masjid Maintenance & Lighting Fund Donation',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-06T14:30:00.000Z',
  },
  {
    id: 'inc-3',
    mahal_id: 'default',
    fund_type: 'MADRASA',
    category: 'MADRASA_FEES',
    amount: '7500',
    payment_date: '2026-09-07',
    payment_method: 'CASH',
    reference: 'MDR-2026-0422',
    receipt_key: null,
    payer_name: 'Madrasa Office Collection (Std 1-10)',
    description: 'Monthly Madrasa student fee receipts deposit',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-07T10:00:00.000Z',
  },
  {
    id: 'inc-4',
    mahal_id: 'default',
    fund_type: 'ZAKAT',
    category: 'OTHER',
    amount: '25000',
    payment_date: '2026-09-08',
    payment_method: 'BANK_TRANSFER',
    reference: 'ZKT-2026-0012',
    receipt_key: null,
    payer_name: 'Al-Madina Trading Co.',
    description: 'Annual Zakat Contribution for Deserving Families',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-08T09:15:00.000Z',
  },
];

// Initial Finance Expenses
const INITIAL_EXPENSES: ExpenseListItem[] = [
  {
    id: 'exp-1',
    mahal_id: 'default',
    fund_type: 'GENERAL',
    category: 'UTILITIES',
    amount: '3850',
    expense_date: '2026-09-02',
    payment_method: 'NETBANKING',
    voucher_no: 'VCH-2026-0811',
    voucher_key: null,
    reference: 'VCH-2026-0811',
    payee_name: 'KSEB Electricity Board',
    description: 'Juma Masjid & Madrasa complex electricity bill for August',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'exp-2',
    mahal_id: 'default',
    fund_type: 'GENERAL',
    category: 'SALARY_IMAM',
    amount: '18000',
    expense_date: '2026-09-03',
    payment_method: 'BANK_TRANSFER',
    voucher_no: 'VCH-2026-0812',
    voucher_key: null,
    reference: 'VCH-2026-0812',
    payee_name: 'Khatib & Imam Abdulla Musliyar',
    description: 'Imam & Khateeb Monthly Honorarium for August',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-03T10:30:00.000Z',
  },
  {
    id: 'exp-3',
    mahal_id: 'default',
    fund_type: 'MADRASA',
    category: 'SALARY_MADRASA_TEACHER',
    amount: '14000',
    expense_date: '2026-09-04',
    payment_method: 'BANK_TRANSFER',
    voucher_no: 'VCH-2026-0813',
    voucher_key: null,
    reference: 'VCH-2026-0813',
    payee_name: 'Madrasa Usthad Staff (3 teachers)',
    description: 'Madrasa teaching staff monthly remuneration',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-04T12:00:00.000Z',
  },
  {
    id: 'exp-4',
    mahal_id: 'default',
    fund_type: 'ZAKAT',
    category: 'WELFARE',
    amount: '12000',
    expense_date: '2026-09-06',
    payment_method: 'CASH',
    voucher_no: 'VCH-2026-0814',
    voucher_key: null,
    reference: 'VCH-2026-0814',
    payee_name: 'Medical Aid Recipients (4 families)',
    description: 'Emergency hospital dialysis and cardiac medication aid',
    description_ml: null,
    created_by_user_id: 'admin_1',
    created_at: '2026-09-06T16:00:00.000Z',
  },
];

// Initial Madrasa Students
const INITIAL_STUDENTS: MadrasaStudentItem[] = [
  {
    id: 'std-1',
    mahal_id: 'default',
    member_id: 'mem_5',
    student_name: 'Ahmed Rayan',
    student_name_ml: 'Ahmed Rayan',
    family_id: 'fam_104',
    family_number: '104',
    house_name: 'Baitul Noor',
    parent_name: 'Abdurahiman Musliyar',
    parent_phone: '+91 98460 12345',
    board_admission_number: 'B-2026-1045',
    class_level: 7,
    enrollment_date: '2025-06-01',
    fee_category: 'FULL',
    monthly_fee: 250,
    parent_consent_confirmed: true,
    status: 'ACTIVE',
    created_at: '2025-06-01T08:00:00.000Z',
    updated_at: '2025-06-01T08:00:00.000Z',
  },
  {
    id: 'std-2',
    mahal_id: 'default',
    member_id: 'mem_6',
    student_name: 'Ayisha Mariyam',
    student_name_ml: 'Ayisha Mariyam',
    family_id: 'fam_104',
    family_number: '104',
    house_name: 'Baitul Noor',
    parent_name: 'Abdurahiman Musliyar',
    parent_phone: '+91 98460 12345',
    board_admission_number: 'B-2026-1088',
    class_level: 3,
    enrollment_date: '2025-06-01',
    fee_category: 'FULL',
    monthly_fee: 200,
    parent_consent_confirmed: true,
    status: 'ACTIVE',
    created_at: '2025-06-01T08:00:00.000Z',
    updated_at: '2025-06-01T08:00:00.000Z',
  },
];

interface IntegratedDatabase {
  wards: WardWithCounts[];
  families: FamilyDetail[];
  deaths: DeathRecordItem[];
  announcements: AnnouncementListItem[];
  events: EventListItem[];
  certificates: CertificateItem[];
  incomes: IncomeListItem[];
  expenses: ExpenseListItem[];
  students: MadrasaStudentItem[];
}

class IntegratedStore {
  private db: IntegratedDatabase;

  constructor() {
    this.db = this.loadFromStorage();
    this.syncVerifiedCertificates();
  }

  private loadFromStorage(): IntegratedDatabase {
    if (typeof window === 'undefined') {
      return {
        wards: INITIAL_WARDS,
        families: INITIAL_FAMILIES,
        deaths: INITIAL_DEATHS,
        announcements: INITIAL_ANNOUNCEMENTS,
        events: INITIAL_EVENTS,
        certificates: INITIAL_CERTIFICATES,
        incomes: INITIAL_INCOMES,
        expenses: INITIAL_EXPENSES,
        students: INITIAL_STUDENTS,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          wards: parsed.wards || INITIAL_WARDS,
          families: parsed.families || INITIAL_FAMILIES,
          deaths: parsed.deaths || INITIAL_DEATHS,
          announcements: parsed.announcements || INITIAL_ANNOUNCEMENTS,
          events: parsed.events || INITIAL_EVENTS,
          certificates: parsed.certificates || INITIAL_CERTIFICATES,
          incomes: parsed.incomes || INITIAL_INCOMES,
          expenses: parsed.expenses || INITIAL_EXPENSES,
          students: parsed.students || INITIAL_STUDENTS,
        };
      }
    } catch {
      // Fallback
    }

    const initial: IntegratedDatabase = {
      wards: INITIAL_WARDS,
      families: INITIAL_FAMILIES,
      deaths: INITIAL_DEATHS,
      announcements: INITIAL_ANNOUNCEMENTS,
      events: INITIAL_EVENTS,
      certificates: INITIAL_CERTIFICATES,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      students: INITIAL_STUDENTS,
    };
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(db: IntegratedDatabase) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      window.dispatchEvent(new CustomEvent('maheall-db-changed', { detail: { timestamp: Date.now() } }));
    } catch {
      // Ignore
    }
  }

  private syncVerifiedCertificates() {
    if (typeof window === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem(VERIFIED_CERTS_KEY) || '{}');
      this.db.certificates.forEach((cert) => {
        if (!existing[cert.verification_token]) {
          existing[cert.verification_token] = {
            certificate_number: cert.certificate_number,
            type: cert.type,
            status: cert.status,
            recipient_name: cert.recipient_name,
            recipient_name_ml: cert.recipient_name_ml,
            issued_at: cert.issued_at,
            valid_until: cert.valid_until,
            summary: (cert.data as any).purpose || (cert.data as any).reason || `${cert.type} Certificate`,
            summary_ml: (cert.data as any).purpose_ml || (cert.data as any).reason_ml || `${cert.type} Certificate`,
            valid: cert.status === 'ACTIVE',
            mahal: {
              name: 'Noorul Islam Juma Masjid',
              name_ml: 'Noorul Islam Juma Masjid',
              waqf_number: 'KSWB/CLT/2018/489',
              district: 'Kozhikode',
            },
          };
        }
      });
      localStorage.setItem(VERIFIED_CERTS_KEY, JSON.stringify(existing));
    } catch {
      // Ignore
    }
  }

  // --- WARDS ---
  getWards(): WardWithCounts[] {
    return this.db.wards.map((w) => {
      const fams = this.db.families.filter((f) => f.ward_id === w.id);
      const membersCount = fams.reduce((acc, f) => acc + (f.members?.length || 0), 0);
      return {
        ...w,
        family_count: fams.length,
        member_count: membersCount,
      };
    });
  }

  // --- FAMILIES ---
  getFamilies(params?: { search?: string; ward_id?: string; status?: string; page?: number; limit?: number }): PaginatedResult<FamilyListItem> {
    let list = [...this.db.families];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.house_name.toLowerCase().includes(q) ||
          f.family_number.toString().includes(q) ||
          f.head_member?.name.toLowerCase().includes(q) ||
          f.head_member?.phone?.includes(q)
      );
    }
    if (params?.ward_id) {
      list = list.filter((f) => f.ward_id === params.ward_id);
    }
    if (params?.status) {
      list = list.filter((f) => f.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    const items: FamilyListItem[] = paginated.map((f) => ({
      ...f,
      head_member: f.head_member ? {
        id: f.head_member.id,
        name: f.head_member.name,
        name_ml: f.head_member.name_ml,
        phone: f.head_member.phone,
        blood_group: f.head_member.blood_group,
        gender: f.head_member.gender,
        occupation: f.head_member.occupation,
        is_nri: f.head_member.is_nri,
      } : null,
      member_count: f.members?.length || 0,
    }));

    return {
      items,
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  getFamily(id: string): FamilyDetail | null {
    const fam = this.db.families.find((f) => f.id === id);
    if (!fam) return null;
    return fam;
  }

  createFamily(dto: CreateFamilyDto): FamilyDetail {
    const nextFamilyNum = Math.max(...this.db.families.map((f) => f.family_number), 100) + 1;
    const newId = `fam_${nextFamilyNum}`;
    const ward = this.db.wards.find((w) => w.id === dto.ward_id);

    let headMember: FamilyMember | null = null;
    const members: FamilyMember[] = [];

    if (dto.head_member) {
      headMember = {
        id: `mem_${Date.now()}_1`,
        mahal_id: 'default',
        family_id: newId,
        name: dto.head_member.name,
        name_ml: dto.head_member.name_ml || null,
        gender: dto.head_member.gender || 'M',
        date_of_birth: dto.head_member.date_of_birth || '1980-01-01',
        relationship_to_head: 'HEAD',
        phone: dto.head_member.phone || null,
        blood_group: dto.head_member.blood_group || null,
        occupation: dto.head_member.occupation || null,
        is_nri: dto.head_member.is_nri || false,
        nri_country: null,
        status: 'ACTIVE',
        profile_image_key: null,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      members.push(headMember);
    }

    const newFamily: FamilyDetail = {
      id: newId,
      mahal_id: 'default',
      family_number: nextFamilyNum,
      house_name: dto.house_name,
      house_name_ml: dto.house_name_ml || null,
      door_number: dto.door_number || null,
      address: dto.address || null,
      ward_id: dto.ward_id || null,
      pirivu_amount: (dto.pirivu_amount || 100).toFixed(2),
      head_member_id: headMember ? headMember.id : null,
      is_nri_household: dto.is_nri_household || false,
      status: 'ACTIVE',
      notes: dto.notes || null,
      created_by_user_id: 'admin_1',
      created_at: new Date(),
      updated_at: new Date(),
      ward: ward ? { id: ward.id, name: ward.name, name_ml: ward.name_ml, ward_number: ward.ward_number } : null,
      head_member: headMember,
      members,
    };

    this.db.families.unshift(newFamily);
    this.saveToStorage(this.db);
    return newFamily;
  }

  updateFamily(id: string, dto: UpdateFamilyDto): FamilyDetail {
    const famIndex = this.db.families.findIndex((f) => f.id === id);
    if (famIndex === -1) throw new Error('Family not found');

    const cur = this.db.families[famIndex];
    const ward = dto.ward_id ? this.db.wards.find((w) => w.id === dto.ward_id) : cur.ward;

    const updated: FamilyDetail = {
      ...cur,
      ...dto,
      house_name: dto.house_name !== undefined ? dto.house_name : cur.house_name,
      pirivu_amount: dto.pirivu_amount !== undefined ? dto.pirivu_amount.toFixed(2) : cur.pirivu_amount,
      ward: ward ? { id: ward.id, name: ward.name, name_ml: ward.name_ml, ward_number: (ward as any).ward_number } : cur.ward,
      updated_at: new Date(),
    };

    this.db.families[famIndex] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  deleteFamily(id: string): boolean {
    this.db.families = this.db.families.filter((f) => f.id !== id);
    this.saveToStorage(this.db);
    return true;
  }

  // --- MEMBERS ---
  getMembers(params?: { search?: string; family_id?: string; status?: string; limit?: number; page?: number }): PaginatedResult<any> {
    let allMembers: Array<FamilyMember & { family: { id: string; family_number: number; house_name: string; ward_name?: string } }> = [];
    this.db.families.forEach((f) => {
      (f.members || []).forEach((m) => {
        allMembers.push({
          ...m,
          family: {
            id: f.id,
            family_number: f.family_number,
            house_name: f.house_name,
            ward_name: f.ward?.name,
          },
        });
      });
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      allMembers = allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.family.house_name.toLowerCase().includes(q)
      );
    }
    if (params?.family_id) {
      allMembers = allMembers.filter((m) => m.family_id === params.family_id);
    }
    if (params?.status) {
      allMembers = allMembers.filter((m) => m.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;

    return {
      items: allMembers.slice(start, start + limit),
      meta: {
        total: allMembers.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(allMembers.length / limit)),
      },
    };
  }

  createMember(dto: CreateMemberDto): FamilyMember {
    const famIndex = this.db.families.findIndex((f) => f.id === dto.family_id);
    if (famIndex === -1) throw new Error('Family not found');

    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      mahal_id: 'default',
      family_id: dto.family_id,
      name: dto.name,
      name_ml: dto.name_ml || null,
      gender: dto.gender || 'M',
      date_of_birth: dto.date_of_birth || null,
      relationship_to_head: dto.relationship_to_head || 'OTHER',
      phone: dto.phone || null,
      blood_group: dto.blood_group || null,
      occupation: dto.occupation || null,
      is_nri: dto.is_nri || false,
      nri_country: null,
      status: 'ACTIVE',
      profile_image_key: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const members = [...(this.db.families[famIndex].members || []), newMember];
    this.db.families[famIndex].members = members;

    if (dto.relationship_to_head === 'HEAD') {
      this.db.families[famIndex].head_member = newMember;
      this.db.families[famIndex].head_member_id = newMember.id;
    }

    this.saveToStorage(this.db);
    return newMember;
  }

  updateMember(id: string, dto: UpdateMemberDto): FamilyMember {
    for (let f of this.db.families) {
      const mIdx = (f.members || []).findIndex((m) => m.id === id);
      if (mIdx !== -1) {
        const updated = {
          ...f.members![mIdx],
          ...dto,
          gender: dto.gender !== undefined ? dto.gender : f.members![mIdx].gender,
          relationship_to_head: dto.relationship_to_head !== undefined ? dto.relationship_to_head : f.members![mIdx].relationship_to_head,
          updated_at: new Date(),
        };
        f.members![mIdx] = updated;
        if (f.head_member?.id === id) {
          f.head_member = updated;
        }
        this.saveToStorage(this.db);
        return updated;
      }
    }
    throw new Error('Member not found');
  }

  deleteMember(id: string): boolean {
    for (let f of this.db.families) {
      if (f.members?.some((m) => m.id === id)) {
        f.members = f.members.filter((m) => m.id !== id);
        if (f.head_member?.id === id) {
          f.head_member = f.members[0] || null;
          f.head_member_id = f.members[0]?.id || null;
        }
        this.saveToStorage(this.db);
        return true;
      }
    }
    return false;
  }

  // --- DEATH RECORDS (JANAZAH) ---
  getDeaths(params?: DeathRecordFilterDto): PaginatedResult<DeathRecordItem> {
    let list = [...this.db.deaths];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.house_name?.toLowerCase().includes(q));
    }
    if (params?.is_details_public !== undefined) {
      list = list.filter((d) => d.is_details_public === params.is_details_public);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  createDeath(dto: CreateDeathRecordDto): DeathRecordItem {
    const id = `death-${Date.now()}`;
    const matchedFamily = dto.family_id ? this.db.families.find((f) => f.id === dto.family_id) : null;
    const houseName = matchedFamily ? matchedFamily.house_name : null;

    let announcementId: string | null = null;

    // INTEGRATION 1: Cross-post to Announcements as a Janazah notification
    if (dto.create_announcement) {
      announcementId = `ann-janazah-${Date.now()}`;
      const newAnn: AnnouncementListItem = {
        id: announcementId,
        mahal_id: 'default',
        title: `Janazah Notification: ${dto.name}`,
        title_ml: `Janazah Notification: ${dto.name_ml || dto.name}`,
        content: `Janazah prayer for ${dto.name} (${houseName ? houseName + ', ' : ''}${dto.burial_location || 'Masjid Qabarstan'}) will take place on ${dto.date_of_death}. ${dto.notes || 'May Allah grant Maghfirah.'}`,
        content_ml: `Janazah prayer for ${dto.name_ml || dto.name}.`,
        category: 'JANAZAH',
        priority: 'HIGH',
        audience: 'ALL',
        target_ward_ids: null,
        publish_at: new Date(),
        status: 'PUBLISHED',
        attachment_key: null,
        death_record_id: id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.db.announcements.unshift(newAnn);
    }

    // INTEGRATION 2: Update member status to DECEASED in family records
    if (matchedFamily && matchedFamily.members) {
      const member = matchedFamily.members.find(
        (m) => m.name.toLowerCase().includes(dto.name.toLowerCase()) || dto.name.toLowerCase().includes(m.name.toLowerCase())
      );
      if (member) {
        member.status = 'DECEASED';
        if (matchedFamily.head_member?.id === member.id) {
          const nextHead = matchedFamily.members.find((m) => m.id !== member.id && m.status === 'ACTIVE');
          matchedFamily.head_member = nextHead || null;
          matchedFamily.head_member_id = nextHead?.id || null;
        }
      }
    }

    const newRecord: DeathRecordItem = {
      id,
      mahal_id: 'default',
      name: dto.name,
      name_ml: dto.name_ml || null,
      photo_key: dto.photo_key || null,
      date_of_death: dto.date_of_death,
      burial_location: dto.burial_location || null,
      family_id: dto.family_id || null,
      house_name: houseName,
      notes: dto.notes || null,
      is_details_public: dto.is_details_public ?? true,
      announcement_id: announcementId,
      created_by_user_id: 'admin_1',
      created_at: new Date().toISOString(),
    };

    this.db.deaths.unshift(newRecord);
    this.saveToStorage(this.db);
    return newRecord;
  }

  updateDeath(id: string, dto: UpdateDeathRecordDto): DeathRecordItem {
    const idx = this.db.deaths.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Death record not found');
    const updated = { ...this.db.deaths[idx], ...dto };
    this.db.deaths[idx] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  toggleDeathVisibility(id: string, is_details_public: boolean): DeathRecordItem {
    return this.updateDeath(id, { is_details_public });
  }

  deleteDeath(id: string): boolean {
    this.db.deaths = this.db.deaths.filter((d) => d.id !== id);
    this.saveToStorage(this.db);
    return true;
  }

  // --- ANNOUNCEMENTS ---
  getAnnouncements(params?: AnnouncementFilterDto): PaginatedResult<AnnouncementListItem> {
    let list = [...this.db.announcements];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q));
    }
    if (params?.category) {
      list = list.filter((a) => a.category === params.category);
    }
    if (params?.status) {
      list = list.filter((a) => a.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  createAnnouncement(dto: CreateAnnouncementDto): AnnouncementListItem {
    const newAnn: AnnouncementListItem = {
      id: `ann-${Date.now()}`,
      mahal_id: 'default',
      title: dto.title,
      title_ml: dto.title_ml || null,
      content: dto.content || null,
      content_ml: dto.content_ml || null,
      category: dto.category || 'GENERAL',
      priority: dto.priority || 'NORMAL',
      audience: dto.audience || 'ALL',
      target_ward_ids: dto.target_ward_ids || null,
      publish_at: dto.publish_at ? new Date(dto.publish_at) : new Date(),
      status: dto.status || 'PUBLISHED',
      attachment_key: dto.attachment_key || null,
      death_record_id: dto.death_record_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.db.announcements.unshift(newAnn);
    this.saveToStorage(this.db);
    return newAnn;
  }

  updateAnnouncement(id: string, dto: UpdateAnnouncementDto): AnnouncementListItem {
    const idx = this.db.announcements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Announcement not found');
    const updated: AnnouncementListItem = {
      ...this.db.announcements[idx],
      ...dto,
      publish_at: dto.publish_at ? new Date(dto.publish_at) : this.db.announcements[idx].publish_at,
      updated_at: new Date(),
    };
    this.db.announcements[idx] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  deleteAnnouncement(id: string): boolean {
    this.db.announcements = this.db.announcements.filter((a) => a.id !== id);
    this.saveToStorage(this.db);
    return true;
  }

  // --- EVENTS ---
  getEvents(params?: EventFilterDto): PaginatedResult<EventListItem> {
    let list = [...this.db.events];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    if (params?.status) {
      list = list.filter((e) => e.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  createEvent(dto: CreateEventDto): EventListItem {
    const newEvent: EventListItem = {
      id: `event-${Date.now()}`,
      mahal_id: 'default',
      title: dto.title,
      title_ml: dto.title_ml || null,
      description: dto.description || null,
      starts_at: dto.starts_at || new Date().toISOString(),
      ends_at: dto.ends_at || null,
      location: dto.location || null,
      image_key: dto.image_key || null,
      status: dto.status || 'ACTIVE',
      created_by_user_id: 'admin_1',
      created_at: new Date().toISOString(),
    };

    this.db.events.unshift(newEvent);
    this.saveToStorage(this.db);
    return newEvent;
  }

  updateEvent(id: string, dto: UpdateEventDto): EventListItem {
    const idx = this.db.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    const updated = { ...this.db.events[idx], ...dto };
    this.db.events[idx] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  deleteEvent(id: string): boolean {
    this.db.events = this.db.events.filter((e) => e.id !== id);
    this.saveToStorage(this.db);
    return true;
  }

  // --- CERTIFICATES ---
  getCertificates(params?: CertificateFilterDto): PaginatedResult<CertificateItem> {
    let list = [...this.db.certificates];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => c.certificate_number.toLowerCase().includes(q) || c.recipient_name.toLowerCase().includes(q));
    }
    if (params?.certificate_type && (params.certificate_type as any) !== 'ALL') {
      list = list.filter((c) => c.type === params.certificate_type);
    }
    if (params?.status && (params.status as any) !== 'ALL') {
      list = list.filter((c) => c.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  getCertificateDetail(id: string): CertificateDetail | null {
    const cert = this.db.certificates.find((c) => c.id === id);
    if (!cert) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return {
      ...cert,
      mahal: {
        id: 'default',
        slug: 'noorul-islam-juma-masjid',
        name: 'Noorul Islam Juma Masjid',
        name_ml: 'Noorul Islam Juma Masjid',
        waqf_number: 'KSWB/CLT/2018/489',
        address: 'Valiya Parambu, Post Box 14, Calicut',
        contact_phone: '+91 98460 00111',
      },
      verification_url: `${origin}/verify/${cert.verification_token}`,
    };
  }

  issueNoc(dto: IssueNocCertificateDto): CertificateDetail {
    const fam = this.db.families.find((f) => f.id === dto.family_id);
    let memberName = fam?.house_name || 'Family';
    if (dto.member_id && fam?.members) {
      const m = fam.members.find((mem) => mem.id === dto.member_id);
      if (m) memberName = m.name;
    }

    const certNum = `NOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const vToken = `vtok_${Math.random().toString(36).substring(2, 11)}`;

    const newCert: CertificateItem = {
      id: `cert_${Date.now()}`,
      mahal_id: 'default',
      certificate_number: certNum,
      type: 'NOC',
      family_id: dto.family_id,
      member_id: dto.member_id || null,
      recipient_name: memberName,
      recipient_name_ml: memberName,
      status: 'ACTIVE',
      verification_token: vToken,
      issued_by_user_id: 'admin_1',
      issued_by_name: 'Mahal General Secretary',
      issued_at: dto.issued_date || new Date().toISOString(),
      valid_until: dto.valid_until || null,
      revoked_at: null,
      revoked_reason: null,
      data: {
        ...dto,
        family_name: fam?.house_name,
        family_number: fam?.family_number,
        member_name: memberName,
      },
    };

    this.db.certificates.unshift(newCert);
    this.saveToStorage(this.db);
    this.syncVerifiedCertificates();

    return this.getCertificateDetail(newCert.id)!;
  }

  issueMembership(dto: IssueMembershipCertificateDto): CertificateDetail {
    const fam = this.db.families.find((f) => f.id === dto.family_id);
    let memberName = fam?.head_member?.name || fam?.house_name || 'Member';
    if (dto.member_id && fam?.members) {
      const m = fam.members.find((mem) => mem.id === dto.member_id);
      if (m) memberName = m.name;
    }

    const certNum = `MEM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const vToken = `vtok_${Math.random().toString(36).substring(2, 11)}`;

    const newCert: CertificateItem = {
      id: `cert_${Date.now()}`,
      mahal_id: 'default',
      certificate_number: certNum,
      type: 'MEMBERSHIP',
      family_id: dto.family_id,
      member_id: dto.member_id || null,
      recipient_name: memberName,
      recipient_name_ml: memberName,
      status: 'ACTIVE',
      verification_token: vToken,
      issued_by_user_id: 'admin_1',
      issued_by_name: 'Mahal General Secretary',
      issued_at: dto.issued_date || new Date().toISOString(),
      valid_until: dto.valid_until || null,
      revoked_at: null,
      revoked_reason: null,
      data: {
        ...dto,
        family_name: fam?.house_name,
        family_number: fam?.family_number,
        member_name: memberName,
        house_name: fam?.house_name,
        ward_name: fam?.ward?.name,
      },
    };

    this.db.certificates.unshift(newCert);
    this.saveToStorage(this.db);
    this.syncVerifiedCertificates();

    return this.getCertificateDetail(newCert.id)!;
  }

  issueNikah(dto: IssueNikahCertificateDto): CertificateDetail {
    const certNum = `NIK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const vToken = `vtok_${Math.random().toString(36).substring(2, 11)}`;

    const newCert: CertificateItem = {
      id: `cert_${Date.now()}`,
      mahal_id: 'default',
      certificate_number: certNum,
      type: 'NIKAH',
      family_id: null,
      member_id: null,
      recipient_name: `${dto.groom_name} & ${dto.bride_name}`,
      recipient_name_ml: `${dto.groom_name_ml || dto.groom_name} & ${dto.bride_name_ml || dto.bride_name}`,
      status: 'ACTIVE',
      verification_token: vToken,
      issued_by_user_id: 'admin_1',
      issued_by_name: 'Chief Qazi & Mahal Secretary',
      issued_at: dto.nikah_date || new Date().toISOString(),
      valid_until: null,
      revoked_at: null,
      revoked_reason: null,
      data: { ...dto },
    };

    this.db.certificates.unshift(newCert);
    this.saveToStorage(this.db);
    this.syncVerifiedCertificates();

    return this.getCertificateDetail(newCert.id)!;
  }

  revokeCertificate(id: string, reason: string): boolean {
    const cert = this.db.certificates.find((c) => c.id === id);
    if (!cert) return false;
    cert.status = 'REVOKED';
    cert.revoked_at = new Date().toISOString();
    cert.revoked_reason = reason;
    this.saveToStorage(this.db);

    // Update global registry
    try {
      const existing = JSON.parse(localStorage.getItem(VERIFIED_CERTS_KEY) || '{}');
      if (existing[cert.verification_token]) {
        existing[cert.verification_token].valid = false;
        existing[cert.verification_token].status = 'REVOKED';
        existing[cert.verification_token].revoked_reason = reason;
        localStorage.setItem(VERIFIED_CERTS_KEY, JSON.stringify(existing));
      }
    } catch {
      // Ignore
    }

    return true;
  }

  // --- FINANCE (INCOME, EXPENSE & SUMMARY) ---
  getIncome(params?: IncomeFilterDto): PaginatedResult<IncomeListItem> {
    let list = [...this.db.incomes];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((i) => i.payer_name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.reference?.toLowerCase().includes(q));
    }
    if (params?.fund_type) {
      list = list.filter((i) => i.fund_type === params.fund_type);
    }
    if (params?.category) {
      list = list.filter((i) => i.category === params.category);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  createIncome(dto: CreateIncomeDto): IncomeListItem {
    const newIncome: IncomeListItem = {
      id: `inc-${Date.now()}`,
      mahal_id: 'default',
      fund_type: dto.fund_type || 'GENERAL',
      category: dto.category,
      amount: dto.amount.toString(),
      payment_date: dto.payment_date || new Date().toISOString().split('T')[0],
      payment_method: dto.payment_method || 'CASH',
      reference: dto.reference || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receipt_key: null,
      payer_name: dto.payer_name || 'Anonymous Well-wisher',
      description: dto.description || null,
      description_ml: dto.description_ml || null,
      created_by_user_id: 'admin_1',
      created_at: new Date().toISOString(),
    };

    this.db.incomes.unshift(newIncome);
    this.saveToStorage(this.db);
    return newIncome;
  }

  getExpense(params?: ExpenseFilterDto): PaginatedResult<ExpenseListItem> {
    let list = [...this.db.expenses];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((e) => e.payee_name?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.voucher_no?.toLowerCase().includes(q));
    }
    if (params?.fund_type) {
      list = list.filter((e) => e.fund_type === params.fund_type);
    }
    if (params?.category) {
      list = list.filter((e) => e.category === params.category);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  createExpense(dto: CreateExpenseDto): ExpenseListItem {
    const voucher = dto.voucher_no || `VCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newExpense: ExpenseListItem = {
      id: `exp-${Date.now()}`,
      mahal_id: 'default',
      fund_type: dto.fund_type || 'GENERAL',
      category: dto.category,
      amount: dto.amount.toString(),
      expense_date: dto.expense_date || new Date().toISOString().split('T')[0],
      payment_method: dto.payment_method || 'CASH',
      voucher_no: voucher,
      voucher_key: null,
      reference: voucher,
      payee_name: dto.payee_name || 'Vendor / Recipient',
      description: dto.description || null,
      description_ml: dto.description_ml || null,
      created_by_user_id: 'admin_1',
      created_at: new Date().toISOString(),
    };

    this.db.expenses.unshift(newExpense);
    this.saveToStorage(this.db);
    return newExpense;
  }

  getFinancialSummary(): FinancialSummaryDto {
    const totalIncome = this.db.incomes.reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
    const totalExpense = this.db.expenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

    const calcFund = (fundType: any) => {
      const inc = this.db.incomes.filter((i) => i.fund_type === fundType).reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
      const exp = this.db.expenses.filter((e) => e.fund_type === fundType).reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
      return { fund_type: fundType, income: inc, expense: exp, net: inc - exp };
    };

    return {
      period: {
        year: 2026,
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        period_type: 'month',
      },
      total_income: totalIncome,
      total_expense: totalExpense,
      net_balance: totalIncome - totalExpense,
      funds: {
        GENERAL: calcFund('GENERAL'),
        ZAKAT: calcFund('ZAKAT'),
        MADRASA: calcFund('MADRASA'),
      },
      comparison: {
        prev_month_income: 45000,
        prev_month_expense: 38000,
        income_change_percentage: 10.8,
        expense_change_percentage: -4.2,
      },
      pirivu: {
        total_expected: 22500,
        total_collected: 18400,
        collection_percentage: 81.8,
        paying_families_count: 92,
        total_families_count: 124,
      },
      recent_transactions: [
        ...this.db.incomes.slice(0, 4).map((i) => ({
          id: i.id,
          type: 'INCOME' as const,
          category: i.category,
          fund_type: i.fund_type,
          amount: parseFloat(i.amount || '0'),
          date: i.payment_date,
          description: i.description,
          party_name: i.payer_name,
          payment_method: i.payment_method,
          reference: i.reference,
        })),
        ...this.db.expenses.slice(0, 4).map((e) => ({
          id: e.id,
          type: 'EXPENSE' as const,
          category: e.category,
          fund_type: e.fund_type,
          amount: parseFloat(e.amount || '0'),
          date: e.expense_date,
          description: e.description,
          party_name: e.payee_name,
          payment_method: e.payment_method,
          reference: e.voucher_no,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }

  // --- MADRASA STUDENTS ---
  getStudents(params?: StudentFilterDto): PaginatedResult<MadrasaStudentItem> {
    let list = [...this.db.students];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.student_name.toLowerCase().includes(q) ||
          s.house_name.toLowerCase().includes(q) ||
          s.board_admission_number?.toLowerCase().includes(q)
      );
    }
    if (params?.class_level) {
      list = list.filter((s) => s.class_level === Number(params.class_level));
    }
    if (params?.status) {
      list = list.filter((s) => s.status === params.status);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const start = (page - 1) * limit;

    return {
      items: list.slice(start, start + limit),
      meta: {
        total: list.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
      },
    };
  }

  getStudentDetail(id: string): MadrasaStudentDetail | null {
    const std = this.db.students.find((s) => s.id === id);
    if (!std) return null;
    return {
      ...std,
      attendance_stats: {
        total_days: 60,
        present_days: 55,
        absent_days: 5,
        leave_days: 0,
        percentage: 92,
      },
      fee_status: {
        total_paid: 1500,
        paid_months: ['2026-06', '2026-07', '2026-08', '2026-09'],
        recent_receipts: [],
      },
    };
  }

  enrollStudent(dto: EnrollStudentDto): MadrasaStudentItem {
    let memberName = 'Student';
    let familyNumber = '100';
    let houseName = 'Mahal House';
    let parentName = 'Parent';
    let parentPhone = '';

    for (const f of this.db.families) {
      const m = f.members?.find((mem) => mem.id === dto.member_id);
      if (m) {
        memberName = m.name;
        familyNumber = f.family_number.toString();
        houseName = f.house_name;
        parentName = f.head_member?.name || 'Parent';
        parentPhone = f.head_member?.phone || '';
        break;
      }
    }

    const newStudent: MadrasaStudentItem = {
      id: `std-${Date.now()}`,
      mahal_id: 'default',
      member_id: dto.member_id,
      student_name: memberName,
      student_name_ml: memberName,
      family_id: `fam_${familyNumber}`,
      family_number: familyNumber,
      house_name: houseName,
      parent_name: parentName,
      parent_phone: parentPhone,
      board_admission_number: dto.board_admission_number || `B-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      class_level: dto.class_level,
      enrollment_date: dto.enrollment_date || new Date().toISOString().split('T')[0],
      fee_category: dto.fee_category || 'FULL',
      monthly_fee: dto.monthly_fee || 250,
      parent_consent_confirmed: true,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.db.students.unshift(newStudent);
    this.saveToStorage(this.db);
    return newStudent;
  }

  updateStudent(id: string, dto: UpdateStudentDto): MadrasaStudentItem {
    const idx = this.db.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Student not found');
    const updated = { ...this.db.students[idx], ...dto };
    this.db.students[idx] = updated;
    this.saveToStorage(this.db);
    return updated;
  }

  deleteStudent(id: string): boolean {
    const idx = this.db.students.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.db.students[idx].status = 'INACTIVE';
    this.saveToStorage(this.db);
    return true;
  }
}

export const integratedStore = new IntegratedStore();
