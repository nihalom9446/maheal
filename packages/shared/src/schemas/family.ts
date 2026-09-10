import { z } from 'zod';

const malayalamOrEmpty = z.string().optional().nullable();

export const headMemberInputSchema = z.object({
  name: z.string().min(1, 'Head name is required').transform(s => s.trim()),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  gender: z.enum(['M', 'F']).default('M').optional().nullable(),
  date_of_birth: z.string().optional().nullable(), // YYYY-MM-DD
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
});

export const createFamilySchema = z.object({
  house_name: z.string().min(1, 'House name is required').transform(s => s.trim()),
  house_name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  door_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  ward_id: z.string().uuid('Invalid ward ID').optional().nullable(),
  pirivu_amount: z
    .number()
    .min(0, 'Pirivu amount cannot be negative')
    .max(100000)
    .default(0),
  is_nri_household: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  head_member: headMemberInputSchema.optional().nullable(),
});

export const updateFamilySchema = z.object({
  house_name: z.string().min(1, 'House name is required').transform(s => s.trim()).optional(),
  house_name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  door_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  ward_id: z.string().uuid().optional().nullable(),
  pirivu_amount: z
    .number()
    .min(0, 'Pirivu amount cannot be negative')
    .max(100000)
    .optional(),
  is_nri_household: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED']).optional(),
  head_member_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const checkDuplicateFamilySchema = z.object({
  house_name: z.string().min(1, 'House name is required').transform(s => s.trim()),
  house_name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
});

export const familyFilterSchema = z.object({
  ward_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createWardSchema = z.object({
  name: z.string().min(1, 'Ward name is required').transform(s => s.trim()),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null),
  ward_number: z.coerce.number().int().positive().optional().nullable(),
  convener_member_id: z.string().uuid().optional().nullable(),
});

export const updateWardSchema = z.object({
  name: z.string().min(1).transform(s => s.trim()).optional(),
  name_ml: malayalamOrEmpty.transform(s => s?.normalize('NFC') ?? null).optional(),
  ward_number: z.coerce.number().int().positive().optional().nullable(),
  convener_member_id: z.string().uuid().optional().nullable(),
});

export type HeadMemberInputDto = z.input<typeof headMemberInputSchema>;
export type CreateFamilyDto = z.input<typeof createFamilySchema>;
export type UpdateFamilyDto = z.input<typeof updateFamilySchema>;
export type CheckDuplicateFamilyDto = z.input<typeof checkDuplicateFamilySchema>;
export type FamilyFilterDto = z.input<typeof familyFilterSchema>;
export type CreateWardDto = z.input<typeof createWardSchema>;
export type UpdateWardDto = z.input<typeof updateWardSchema>;