import { z } from 'zod';

const malayalamOrEmpty = z.string().optional().nullable();

export const issueNikahCertificateSchema = z.object({
  // Groom details
  groom_name: z.string().min(1, 'Groom name is required').transform((s) => s.trim()),
  groom_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  groom_father: z.string().min(1, "Groom's father name is required").transform((s) => s.trim()),
  groom_father_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  groom_house: z.string().min(1, "Groom's house name is required").transform((s) => s.trim()),
  groom_house_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  groom_mahal: z.string().min(1, "Groom's mahal is required").transform((s) => s.trim()),
  groom_mahal_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  groom_dob: z.string().optional().nullable(),
  groom_phone: z.string().optional().nullable(),

  // Bride details
  bride_name: z.string().min(1, 'Bride name is required').transform((s) => s.trim()),
  bride_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  bride_father: z.string().min(1, "Bride's father name is required").transform((s) => s.trim()),
  bride_father_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  bride_house: z.string().min(1, "Bride's house name is required").transform((s) => s.trim()),
  bride_house_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  bride_mahal: z.string().min(1, "Bride's mahal is required").transform((s) => s.trim()),
  bride_mahal_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  bride_dob: z.string().optional().nullable(),
  bride_phone: z.string().optional().nullable(),

  // Marriage / Nikah details
  mahr_amount: z.union([z.string(), z.number()]).optional().nullable(),
  mahr_description: z.string().optional().nullable(),
  mahr_description_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  wali_name: z.string().min(1, 'Wali (Guardian) name is required').transform((s) => s.trim()),
  wali_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  wali_relation: z.string().min(1, 'Wali relationship is required').transform((s) => s.trim()),
  wali_relation_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  witness1_name: z.string().min(1, 'First witness name is required').transform((s) => s.trim()),
  witness1_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  witness2_name: z.string().min(1, 'Second witness name is required').transform((s) => s.trim()),
  witness2_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  qazi_name: z.string().min(1, 'Qazi / Nikah Officiator name is required').transform((s) => s.trim()),
  qazi_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  nikah_date: z.string().min(1, 'Nikah date (YYYY-MM-DD) is required'),
  nikah_time: z.string().optional().nullable(),
  nikah_venue: z.string().min(1, 'Nikah venue is required').transform((s) => s.trim()),
  nikah_venue_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),

  // Associated family/member
  family_id: z.string().uuid().optional().nullable(),
  member_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const issueNocCertificateSchema = z.object({
  family_id: z.string().uuid('Valid family ID is required'),
  member_id: z.string().uuid().optional().nullable(),
  target_mahal_name: z.string().min(1, 'Target mahal name is required').transform((s) => s.trim()),
  target_mahal_name_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  destination_place: z.string().min(1, 'Destination place / city is required').transform((s) => s.trim()),
  destination_place_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  reason: z.string().min(1, 'Reason for NOC is required').transform((s) => s.trim()),
  reason_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  issued_date: z.string().min(1, 'Issue date is required'),
  valid_until: z.string().optional().nullable(),
  dues_cleared: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export const issueMembershipCertificateSchema = z.object({
  family_id: z.string().uuid('Valid family ID is required'),
  member_id: z.string().uuid().optional().nullable(),
  purpose: z.string().min(1, 'Purpose is required').transform((s) => s.trim()),
  purpose_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  custom_purpose_text: z.string().optional().nullable(),
  custom_purpose_text_ml: malayalamOrEmpty.transform((s) => s?.normalize('NFC') ?? null),
  issued_date: z.string().min(1, 'Issue date is required'),
  valid_until: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const certificateFilterSchema = z.object({
  certificate_type: z.enum(['NIKAH', 'NOC', 'MEMBERSHIP']).optional(),
  status: z.enum(['ACTIVE', 'REVOKED']).optional(),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const revokeCertificateSchema = z.object({
  reason: z.string().min(1, 'Revocation reason is required').transform((s) => s.trim()),
});

export type IssueNikahCertificateDto = z.infer<typeof issueNikahCertificateSchema>;
export type IssueNocCertificateDto = z.infer<typeof issueNocCertificateSchema>;
export type IssueMembershipCertificateDto = z.infer<typeof issueMembershipCertificateSchema>;
export type CertificateFilterDto = z.infer<typeof certificateFilterSchema>;
export type RevokeCertificateDto = z.infer<typeof revokeCertificateSchema>;
