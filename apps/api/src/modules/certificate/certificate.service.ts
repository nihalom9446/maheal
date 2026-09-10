import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, or, ilike, desc, sql, gte, lte } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  certificates,
  mahals,
  families,
  family_members,
  wards,
  users,
} from '../../database/schema';
import type {
  IssueNikahCertificateDto,
  IssueNocCertificateDto,
  IssueMembershipCertificateDto,
  CertificateFilterDto,
  RevokeCertificateDto,
  CertificateItem,
  CertificateDetail,
  PublicCertificateVerification,
  CertificateType,
  NikahCertificateData,
  NocCertificateData,
  MembershipCertificateData,
} from '@maheall/shared';

@Injectable()
export class CertificateService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  /**
   * Helper to generate sequential certificate number per Mahal, Year and Type
   * Example: NIK-2026-0001, NOC-2026-0001, MEM-2026-0001
   */
  private async generateCertificateNumber(
    mahalId: string,
    type: CertificateType,
    year: number,
  ): Promise<string> {
    const prefixMap: Record<CertificateType, string> = {
      NIKAH: 'NIK',
      NOC: 'NOC',
      MEMBERSHIP: 'MEM',
    };
    const prefix = prefixMap[type] || 'CRT';
    const pattern = `${prefix}-${year}-%`;

    const [maxResult] = await this.db
      .select({
        count: sql<number>`cast(count(${certificates.id}) as integer)`,
      })
      .from(certificates)
      .where(
        and(
          eq(certificates.mahal_id, mahalId),
          eq(certificates.type, type),
          ilike(certificates.certificate_number, pattern),
        ),
      );

    const nextSeq = (Number(maxResult?.count ?? 0) + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${nextSeq}`;
  }

  /**
   * Helper to generate unique cryptographically secure verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // ===========================================================================
  // ISSUE NIKAH CERTIFICATE
  // ===========================================================================
  async issueNikahCertificate(
    mahalId: string,
    dto: IssueNikahCertificateDto,
    userId: string,
  ): Promise<CertificateDetail> {
    const year = dto.nikah_date ? new Date(dto.nikah_date).getFullYear() : new Date().getFullYear();
    const certificateNumber = await this.generateCertificateNumber(mahalId, 'NIKAH', year);
    const verificationToken = this.generateVerificationToken();

    const recipientName = `${dto.groom_name} & ${dto.bride_name}`;
    const recipientNameMl =
      dto.groom_name_ml && dto.bride_name_ml
        ? `${dto.groom_name_ml} & ${dto.bride_name_ml}`
        : null;

    const nikahData: NikahCertificateData = {
      groom_name: dto.groom_name,
      groom_name_ml: dto.groom_name_ml ?? null,
      groom_father: dto.groom_father,
      groom_father_ml: dto.groom_father_ml ?? null,
      groom_house: dto.groom_house,
      groom_house_ml: dto.groom_house_ml ?? null,
      groom_mahal: dto.groom_mahal,
      groom_mahal_ml: dto.groom_mahal_ml ?? null,
      groom_dob: dto.groom_dob ?? null,
      groom_phone: dto.groom_phone ?? null,

      bride_name: dto.bride_name,
      bride_name_ml: dto.bride_name_ml ?? null,
      bride_father: dto.bride_father,
      bride_father_ml: dto.bride_father_ml ?? null,
      bride_house: dto.bride_house,
      bride_house_ml: dto.bride_house_ml ?? null,
      bride_mahal: dto.bride_mahal,
      bride_mahal_ml: dto.bride_mahal_ml ?? null,
      bride_dob: dto.bride_dob ?? null,
      bride_phone: dto.bride_phone ?? null,

      mahr_amount: dto.mahr_amount ?? null,
      mahr_description: dto.mahr_description ?? null,
      mahr_description_ml: dto.mahr_description_ml ?? null,
      wali_name: dto.wali_name,
      wali_name_ml: dto.wali_name_ml ?? null,
      wali_relation: dto.wali_relation,
      wali_relation_ml: dto.wali_relation_ml ?? null,
      witness1_name: dto.witness1_name,
      witness1_name_ml: dto.witness1_name_ml ?? null,
      witness2_name: dto.witness2_name,
      witness2_name_ml: dto.witness2_name_ml ?? null,
      qazi_name: dto.qazi_name,
      qazi_name_ml: dto.qazi_name_ml ?? null,
      nikah_date: dto.nikah_date,
      nikah_time: dto.nikah_time ?? null,
      nikah_venue: dto.nikah_venue,
      nikah_venue_ml: dto.nikah_venue_ml ?? null,
      notes: dto.notes ?? null,
    };

    const [created] = await this.db
      .insert(certificates)
      .values({
        mahal_id: mahalId,
        family_id: dto.family_id ?? null,
        member_id: dto.member_id ?? null,
        certificate_number: certificateNumber,
        type: 'NIKAH',
        recipient_name: recipientName,
        recipient_name_ml: recipientNameMl,
        data: nikahData as unknown as Record<string, unknown>,
        content: `Nikah solemnized on ${dto.nikah_date} at ${dto.nikah_venue} between ${dto.groom_name} and ${dto.bride_name}`,
        verification_token: verificationToken,
        status: 'ACTIVE',
        issued_by_user_id: userId,
        issued_at: new Date(),
      })
      .returning();

    return this.getCertificate(mahalId, created.id);
  }

  // ===========================================================================
  // ISSUE NOC CERTIFICATE
  // ===========================================================================
  async issueNocCertificate(
    mahalId: string,
    dto: IssueNocCertificateDto,
    userId: string,
  ): Promise<CertificateDetail> {
    const year = dto.issued_date ? new Date(dto.issued_date).getFullYear() : new Date().getFullYear();
    const certificateNumber = await this.generateCertificateNumber(mahalId, 'NOC', year);
    const verificationToken = this.generateVerificationToken();

    // Fetch family and member details if provided
    const [family] = await this.db
      .select({
        id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
      })
      .from(families)
      .where(and(eq(families.id, dto.family_id), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    let member = null;
    if (dto.member_id) {
      const [m] = await this.db
        .select({
          id: family_members.id,
          name: family_members.name,
          name_ml: family_members.name_ml,
        })
        .from(family_members)
        .where(
          and(
            eq(family_members.id, dto.member_id),
            eq(family_members.family_id, dto.family_id),
            eq(family_members.mahal_id, mahalId),
          ),
        )
        .limit(1);
      member = m;
    }

    const recipientName = member?.name
      ? `${member.name} (${family.house_name} - #${family.family_number})`
      : `${family.house_name} Family (#${family.family_number})`;

    const recipientNameMl = member?.name_ml
      ? `${member.name_ml} (${family.house_name_ml || family.house_name} - #${family.family_number})`
      : `${family.house_name_ml || family.house_name} കുടുംബം (#${family.family_number})`;

    const nocData: NocCertificateData = {
      family_id: dto.family_id,
      member_id: dto.member_id ?? null,
      target_mahal_name: dto.target_mahal_name,
      target_mahal_name_ml: dto.target_mahal_name_ml ?? null,
      destination_place: dto.destination_place,
      destination_place_ml: dto.destination_place_ml ?? null,
      reason: dto.reason,
      reason_ml: dto.reason_ml ?? null,
      issued_date: dto.issued_date,
      valid_until: dto.valid_until ?? null,
      dues_cleared: dto.dues_cleared ?? true,
      notes: dto.notes ?? null,
      family_name: family.house_name,
      family_number: family.family_number,
      member_name: member?.name ?? null,
      member_name_ml: member?.name_ml ?? null,
    };

    const validUntilDate = dto.valid_until ? new Date(dto.valid_until) : null;

    const [created] = await this.db
      .insert(certificates)
      .values({
        mahal_id: mahalId,
        family_id: dto.family_id,
        member_id: dto.member_id ?? null,
        certificate_number: certificateNumber,
        type: 'NOC',
        recipient_name: recipientName,
        recipient_name_ml: recipientNameMl,
        data: nocData as unknown as Record<string, unknown>,
        content: `No Objection Certificate issued for transfer to ${dto.target_mahal_name}, ${dto.destination_place}. Reason: ${dto.reason}`,
        verification_token: verificationToken,
        status: 'ACTIVE',
        issued_by_user_id: userId,
        issued_at: new Date(dto.issued_date),
        valid_until: validUntilDate,
      })
      .returning();

    return this.getCertificate(mahalId, created.id);
  }

  // ===========================================================================
  // ISSUE MEMBERSHIP CERTIFICATE
  // ===========================================================================
  async issueMembershipCertificate(
    mahalId: string,
    dto: IssueMembershipCertificateDto,
    userId: string,
  ): Promise<CertificateDetail> {
    const year = dto.issued_date ? new Date(dto.issued_date).getFullYear() : new Date().getFullYear();
    const certificateNumber = await this.generateCertificateNumber(mahalId, 'MEMBERSHIP', year);
    const verificationToken = this.generateVerificationToken();

    // Fetch family & member details
    const [family] = await this.db
      .select({
        id: families.id,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        ward_id: families.ward_id,
      })
      .from(families)
      .where(and(eq(families.id, dto.family_id), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    let wardName: string | null = null;
    if (family.ward_id) {
      const [w] = await this.db
        .select({ name: wards.name })
        .from(wards)
        .where(eq(wards.id, family.ward_id))
        .limit(1);
      wardName = w?.name ?? null;
    }

    let member = null;
    if (dto.member_id) {
      const [m] = await this.db
        .select({
          id: family_members.id,
          name: family_members.name,
          name_ml: family_members.name_ml,
        })
        .from(family_members)
        .where(
          and(
            eq(family_members.id, dto.member_id),
            eq(family_members.family_id, dto.family_id),
            eq(family_members.mahal_id, mahalId),
          ),
        )
        .limit(1);
      member = m;
    }

    const recipientName = member?.name
      ? `${member.name} (${family.house_name} - #${family.family_number})`
      : `${family.house_name} Family (#${family.family_number})`;

    const recipientNameMl = member?.name_ml
      ? `${member.name_ml} (${family.house_name_ml || family.house_name} - #${family.family_number})`
      : `${family.house_name_ml || family.house_name} കുടുംബം (#${family.family_number})`;

    const membershipData: MembershipCertificateData = {
      family_id: dto.family_id,
      member_id: dto.member_id ?? null,
      purpose: dto.purpose,
      purpose_ml: dto.purpose_ml ?? null,
      custom_purpose_text: dto.custom_purpose_text ?? null,
      custom_purpose_text_ml: dto.custom_purpose_text_ml ?? null,
      issued_date: dto.issued_date,
      valid_until: dto.valid_until ?? null,
      notes: dto.notes ?? null,
      family_name: family.house_name,
      family_number: family.family_number,
      member_name: member?.name ?? null,
      member_name_ml: member?.name_ml ?? null,
      house_name: family.house_name,
      ward_name: wardName,
    };

    const validUntilDate = dto.valid_until ? new Date(dto.valid_until) : null;

    const [created] = await this.db
      .insert(certificates)
      .values({
        mahal_id: mahalId,
        family_id: dto.family_id,
        member_id: dto.member_id ?? null,
        certificate_number: certificateNumber,
        type: 'MEMBERSHIP',
        recipient_name: recipientName,
        recipient_name_ml: recipientNameMl,
        data: membershipData as unknown as Record<string, unknown>,
        content: `Mahal Membership Certificate issued for purpose: ${dto.purpose}${dto.custom_purpose_text ? ` (${dto.custom_purpose_text})` : ''}`,
        verification_token: verificationToken,
        status: 'ACTIVE',
        issued_by_user_id: userId,
        issued_at: new Date(dto.issued_date),
        valid_until: validUntilDate,
      })
      .returning();

    return this.getCertificate(mahalId, created.id);
  }

  // ===========================================================================
  // LIST CERTIFICATES
  // ===========================================================================
  async listCertificates(mahalId: string, query: CertificateFilterDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(certificates.mahal_id, mahalId)];

    if (query.certificate_type) {
      conditions.push(eq(certificates.type, query.certificate_type));
    }

    if (query.status) {
      conditions.push(eq(certificates.status, query.status));
    }

    if (query.start_date) {
      conditions.push(gte(certificates.issued_at, new Date(query.start_date)));
    }

    if (query.end_date) {
      const endOfDay = new Date(query.end_date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(lte(certificates.issued_at, endOfDay));
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerm = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(certificates.certificate_number, searchTerm),
          ilike(certificates.recipient_name, searchTerm),
          ilike(certificates.recipient_name_ml, searchTerm),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({
        total: sql<number>`cast(count(${certificates.id}) as integer)`,
      })
      .from(certificates)
      .where(whereClause);

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select({
        id: certificates.id,
        mahal_id: certificates.mahal_id,
        certificate_number: certificates.certificate_number,
        type: certificates.type,
        family_id: certificates.family_id,
        member_id: certificates.member_id,
        recipient_name: certificates.recipient_name,
        recipient_name_ml: certificates.recipient_name_ml,
        status: certificates.status,
        verification_token: certificates.verification_token,
        issued_by_user_id: certificates.issued_by_user_id,
        issued_at: certificates.issued_at,
        valid_until: certificates.valid_until,
        revoked_at: certificates.revoked_at,
        revoked_reason: certificates.revoked_reason,
        data: certificates.data,
        issued_by_name: users.name,
      })
      .from(certificates)
      .leftJoin(users, eq(certificates.issued_by_user_id, users.id))
      .where(whereClause)
      .orderBy(desc(certificates.issued_at), desc(certificates.created_at))
      .limit(limit)
      .offset(offset);

    const items: CertificateItem[] = rows.map((r) => ({
      id: r.id,
      mahal_id: r.mahal_id,
      certificate_number: r.certificate_number,
      type: r.type as CertificateType,
      family_id: r.family_id,
      member_id: r.member_id,
      recipient_name: r.recipient_name,
      recipient_name_ml: r.recipient_name_ml,
      status: r.status as 'ACTIVE' | 'REVOKED',
      verification_token: r.verification_token,
      issued_by_user_id: r.issued_by_user_id,
      issued_by_name: r.issued_by_name,
      issued_at: r.issued_at,
      valid_until: r.valid_until,
      revoked_at: r.revoked_at,
      revoked_reason: r.revoked_reason,
      data: r.data as unknown as CertificateItem['data'],
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // ===========================================================================
  // GET CERTIFICATE DETAIL
  // ===========================================================================
  async getCertificate(mahalId: string, id: string): Promise<CertificateDetail> {
    const [row] = await this.db
      .select({
        id: certificates.id,
        mahal_id: certificates.mahal_id,
        certificate_number: certificates.certificate_number,
        type: certificates.type,
        family_id: certificates.family_id,
        member_id: certificates.member_id,
        recipient_name: certificates.recipient_name,
        recipient_name_ml: certificates.recipient_name_ml,
        status: certificates.status,
        verification_token: certificates.verification_token,
        issued_by_user_id: certificates.issued_by_user_id,
        issued_at: certificates.issued_at,
        valid_until: certificates.valid_until,
        revoked_at: certificates.revoked_at,
        revoked_reason: certificates.revoked_reason,
        data: certificates.data,
        issued_by_name: users.name,
        mahal_name: mahals.name,
        mahal_name_ml: mahals.name_ml,
        mahal_slug: mahals.slug,
        mahal_registration_type: mahals.registration_type,
        mahal_waqf_number: mahals.waqf_number,
        mahal_address: mahals.address,
        mahal_district: mahals.district,
        mahal_contact_phone: mahals.contact_phone,
        family_number: families.family_number,
        family_house_name: families.house_name,
        family_house_name_ml: families.house_name_ml,
        family_ward_id: families.ward_id,
        member_name: family_members.name,
        member_name_ml: family_members.name_ml,
        member_phone: family_members.phone,
      })
      .from(certificates)
      .innerJoin(mahals, eq(certificates.mahal_id, mahals.id))
      .leftJoin(users, eq(certificates.issued_by_user_id, users.id))
      .leftJoin(families, eq(certificates.family_id, families.id))
      .leftJoin(family_members, eq(certificates.member_id, family_members.id))
      .where(and(eq(certificates.id, id), eq(certificates.mahal_id, mahalId)))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Certificate not found');
    }

    let wardName: string | null = null;
    if (row.family_ward_id) {
      const [w] = await this.db
        .select({ name: wards.name })
        .from(wards)
        .where(eq(wards.id, row.family_ward_id))
        .limit(1);
      wardName = w?.name ?? null;
    }

    return {
      id: row.id,
      mahal_id: row.mahal_id,
      certificate_number: row.certificate_number,
      type: row.type as CertificateType,
      family_id: row.family_id,
      member_id: row.member_id,
      recipient_name: row.recipient_name,
      recipient_name_ml: row.recipient_name_ml,
      status: row.status as 'ACTIVE' | 'REVOKED',
      verification_token: row.verification_token,
      issued_by_user_id: row.issued_by_user_id,
      issued_by_name: row.issued_by_name,
      issued_at: row.issued_at,
      valid_until: row.valid_until,
      revoked_at: row.revoked_at,
      revoked_reason: row.revoked_reason,
      data: row.data as unknown as CertificateDetail['data'],
      mahal: {
        id: row.mahal_id,
        name: row.mahal_name,
        name_ml: row.mahal_name_ml,
        slug: row.mahal_slug,
        registration_type: row.mahal_registration_type,
        waqf_number: row.mahal_waqf_number,
        address: row.mahal_address,
        district: row.mahal_district,
        contact_phone: row.mahal_contact_phone,
      },
      family: row.family_id
        ? {
            id: row.family_id,
            family_number: row.family_number ?? 0,
            house_name: row.family_house_name ?? '',
            house_name_ml: row.family_house_name_ml,
            ward_name: wardName,
          }
        : null,
      member: row.member_id
        ? {
            id: row.member_id,
            name: row.member_name ?? '',
            name_ml: row.member_name_ml,
            phone: row.member_phone,
          }
        : null,
      verification_url: `/verify/${row.verification_token}`,
    };
  }

  // ===========================================================================
  // PUBLIC VERIFICATION (Unauthenticated)
  // ===========================================================================
  async verifyPublicCertificate(token: string): Promise<PublicCertificateVerification> {
    if (!token || token.trim() === '') {
      throw new BadRequestException('Verification token is required');
    }

    const [row] = await this.db
      .select({
        id: certificates.id,
        certificate_number: certificates.certificate_number,
        type: certificates.type,
        status: certificates.status,
        issued_at: certificates.issued_at,
        valid_until: certificates.valid_until,
        revoked_at: certificates.revoked_at,
        revoked_reason: certificates.revoked_reason,
        recipient_name: certificates.recipient_name,
        recipient_name_ml: certificates.recipient_name_ml,
        data: certificates.data,
        content: certificates.content,
        mahal_name: mahals.name,
        mahal_name_ml: mahals.name_ml,
        mahal_district: mahals.district,
        mahal_waqf_number: mahals.waqf_number,
        mahal_registration_type: mahals.registration_type,
        mahal_address: mahals.address,
      })
      .from(certificates)
      .innerJoin(mahals, eq(certificates.mahal_id, mahals.id))
      .where(eq(certificates.verification_token, token.trim()))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Certificate with the provided verification token was not found.');
    }

    const isRevoked = row.status === 'REVOKED';

    let summary = '';
    let summaryMl = '';

    if (row.type === 'NIKAH') {
      const data = row.data as unknown as NikahCertificateData;
      summary = `Official Nikah Certificate registered on ${data.nikah_date || 'N/A'} at ${data.nikah_venue || 'N/A'}`;
      summaryMl = `ഔദ്യോഗിക വിവാഹ (നികാഹ്) സർട്ടിഫിക്കറ്റ് — തീയതി: ${data.nikah_date || 'N/A'}`;
    } else if (row.type === 'NOC') {
      const data = row.data as unknown as NocCertificateData;
      summary = `No Objection Certificate for Mahal Transfer to ${data.target_mahal_name || 'N/A'}`;
      summaryMl = `മഹല്ല് മാറ്റത്തിനായുള്ള നിരാക്ഷേപ പത്രം (NOC) — ${data.target_mahal_name_ml || data.target_mahal_name || 'N/A'}`;
    } else {
      const data = row.data as unknown as MembershipCertificateData;
      summary = `Mahal Membership & Identity Certificate issued for ${data.purpose || 'Official Purpose'}`;
      summaryMl = `മഹല്ല് അംഗത്വ സർട്ടിഫിക്കറ്റ് — ആവശ്യം: ${data.purpose_ml || data.purpose || 'ഔദ്യോഗിക ആവശ്യം'}`;
    }

    return {
      valid: !isRevoked,
      certificate_number: row.certificate_number,
      type: row.type as CertificateType,
      status: row.status as 'ACTIVE' | 'REVOKED',
      issued_at: row.issued_at,
      valid_until: row.valid_until,
      revoked_at: row.revoked_at,
      revoked_reason: row.revoked_reason,
      mahal: {
        name: row.mahal_name,
        name_ml: row.mahal_name_ml,
        district: row.mahal_district,
        waqf_number: row.mahal_waqf_number,
        registration_type: row.mahal_registration_type,
        address: row.mahal_address,
      },
      recipient_name: row.recipient_name,
      recipient_name_ml: row.recipient_name_ml,
      summary,
      summary_ml: summaryMl,
    };
  }

  // ===========================================================================
  // REVOKE / DELETE CERTIFICATE
  // ===========================================================================
  async revokeCertificate(
    mahalId: string,
    id: string,
    dto: RevokeCertificateDto,
  ) {
    const cert = await this.getCertificate(mahalId, id);

    if (cert.status === 'REVOKED') {
      throw new BadRequestException('Certificate has already been revoked');
    }

    const [updated] = await this.db
      .update(certificates)
      .set({
        status: 'REVOKED',
        revoked_at: new Date(),
        revoked_reason: dto.reason,
        updated_at: new Date(),
      })
      .where(and(eq(certificates.id, id), eq(certificates.mahal_id, mahalId)))
      .returning();

    return {
      success: true,
      message: `Certificate ${updated.certificate_number} has been revoked successfully.`,
      data: updated,
    };
  }
}
