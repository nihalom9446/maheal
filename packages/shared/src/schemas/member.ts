import { z } from 'zod';

const malayalamOrEmpty = z.string().optional().nullable();

export const createMemberSchema = z.object({
  family_id: z.string().uuid('Valid family ID is required'),
  name: z.string().min(1, 'Name is required').transform(s => s.trim()),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  gender: z.enum(['M', 'F']).optional().nullable(),
  date_of_birth: z.string().optional().nullable(), // YYYY-MM-DD
  relationship_to_head: z
    .enum(['HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'SIBLING', 'OTHER'])
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)')
    .or(z.string().regex(/^[6-9]\d{9}$/, 'Must be 10 digits mobile number').transform(s => `+91${s}`))
    .optional()
    .nullable(),
  blood_group: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .nullable(),
  occupation: z.string().optional().nullable(),
  is_nri: z.boolean().default(false),
  nri_country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').transform(s => s.trim()).optional(),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  gender: z.enum(['M', 'F']).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  relationship_to_head: z
    .enum(['HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'SIBLING', 'OTHER'])
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)')
    .or(z.string().regex(/^[6-9]\d{9}$/, 'Must be 10 digits mobile number').transform(s => `+91${s}`))
    .optional()
    .nullable(),
  blood_group: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .nullable(),
  occupation: z.string().optional().nullable(),
  is_nri: z.boolean().optional(),
  nri_country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'DECEASED', 'TRANSFERRED', 'INACTIVE']).optional(),
  profile_image_key: z.string().optional().nullable(),
});

export const memberFilterSchema = z.object({
  search: z.string().optional(),
  phone: z.string().optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  ward_id: z.string().uuid().optional(),
  family_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'DECEASED', 'TRANSFERRED', 'INACTIVE']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const deleteMemberSchema = z.object({
  status: z.enum(['DECEASED', 'TRANSFERRED', 'INACTIVE']).default('INACTIVE'),
});

export type CreateMemberDto = z.input<typeof createMemberSchema>;
export type UpdateMemberDto = z.input<typeof updateMemberSchema>;
export type MemberFilterDto = z.input<typeof memberFilterSchema>;
export type DeleteMemberDto = z.input<typeof deleteMemberSchema>;