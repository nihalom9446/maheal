import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CertificateService } from '../src/modules/certificate/certificate.service';
import { DATABASE_TOKEN } from '../src/database/database.module';
import { IssueNikahCertificateDto } from '@maheall/shared';

describe('CertificateService', () => {
  let service: CertificateService;
  let mockDb: any;

  const mockMahalId = '11111111-1111-1111-1111-111111111111';
  const mockUserId = '33333333-3333-3333-3333-333333333333';

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        {
          provide: DATABASE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  describe('issueNikahCertificate', () => {
    it('should generate sequential certificate number and unique verification token for Nikah certificate', async () => {
      // Mock count query for certificate sequence
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]); // next will be 0003

      // Mock inserted record return
      const createdCertificate = {
        id: 'cert-1',
        mahal_id: mockMahalId,
        certificate_number: 'NIK-2026-0003',
        type: 'NIKAH',
        recipient_name: 'Zayd & Fatima',
        recipient_name_ml: 'സൈദ് & ഫാത്തിമ',
        data: {},
        verification_token: 'a1b2c3d4e5f6789012345678abcdef01',
        status: 'ACTIVE',
        issued_at: new Date(),
        created_at: new Date(),
      };

      mockDb.returning.mockResolvedValueOnce([createdCertificate]);

      // Mock getCertificate query in response
      mockDb.limit.mockResolvedValueOnce([
        {
          ...createdCertificate,
          issuer_name: 'Secretary Ali',
          mahal_name: 'Central Juma Masjid',
          mahal_name_ml: 'സെൻട്രൽ ജുമാ മസ്ജിദ്',
        },
      ]);

      const nikahDto: IssueNikahCertificateDto = {
        groom_name: 'Zayd',
        groom_name_ml: 'സൈദ്',
        groom_father: 'Ibrahim',
        groom_father_ml: 'ഇബ്രാഹിം',
        groom_house: 'Zayd Villa',
        groom_house_ml: 'സൈദ് വില്ല',
        groom_mahal: 'Central Mahal',
        groom_mahal_ml: 'സെൻട്രൽ മഹല്ല്',
        groom_dob: '1995-05-12',
        groom_phone: '+919846011111',
        bride_name: 'Fatima',
        bride_name_ml: 'ഫാത്തിമ',
        bride_father: 'Umar',
        bride_father_ml: 'ഉമർ',
        bride_house: 'Green House',
        bride_house_ml: 'ഗ്രീൻ ഹൗസ്',
        bride_mahal: 'Central Mahal',
        bride_mahal_ml: 'സെൻട്രൽ മഹല്ല്',
        bride_dob: '1998-08-20',
        bride_phone: '+919846022222',
        mahr_amount: 50000,
        mahr_description: '5 Pavan Gold',
        mahr_description_ml: '5 പവൻ സ്വർണ്ണം',
        wali_name: 'Umar',
        wali_name_ml: 'ഉമർ',
        wali_relation: 'FATHER',
        wali_relation_ml: 'പിതാവ്',
        witness1_name: 'Kareem',
        witness1_name_ml: 'കരീം',
        witness2_name: 'Rashid',
        witness2_name_ml: 'റഷീദ്',
        qazi_name: 'Usthad Abdullah',
        qazi_name_ml: 'ഉസ്താദ് അബ്ദുല്ല',
        nikah_date: '2026-09-08',
        nikah_time: '11:30 AM',
        nikah_venue: 'Central Masjid Auditorium',
        nikah_venue_ml: 'സെൻട്രൽ മസ്ജിദ് ഓഡിറ്റോറിയം',
        family_id: null,
        member_id: null,
        notes: null,
      };

      const result = await service.issueNikahCertificate(
        mockMahalId,
        nikahDto,
        mockUserId,
      );

      expect(result).toBeDefined();
      expect(result.certificate_number).toBe('NIK-2026-0003');
      expect(result.verification_token).toBeDefined();
      expect(result.verification_token).toHaveLength(32);
      expect(result.type).toBe('NIKAH');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('verifyPublicCertificate', () => {
    it('should verify an active certificate by public token and return valid response', async () => {
      const token = 'a1b2c3d4e5f6789012345678abcdef01';

      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'cert-1',
          certificate_number: 'NIK-2026-0003',
          type: 'NIKAH',
          recipient_name: 'Zayd & Fatima',
          recipient_name_ml: 'സൈദ് & ഫാത്തിമ',
          data: { nikah_date: '2026-09-08', nikah_venue: 'Central Masjid' },
          status: 'ACTIVE',
          issued_at: new Date('2026-09-08T10:00:00Z'),
          revoked_reason: null,
          mahal_name: 'Central Juma Masjid',
          mahal_name_ml: 'സെൻട്രൽ ജുമാ മസ്ജിദ്',
          mahal_district: 'Malappuram',
          mahal_waqf_number: 'REG-1234',
          mahal_registration_type: 'WAQF',
          mahal_address: 'Main Road',
        },
      ]);

      const verification = await service.verifyPublicCertificate(token);

      expect(verification).toBeDefined();
      expect(verification.valid).toBe(true);
      expect(verification.certificate_number).toBe('NIK-2026-0003');
      expect(verification.recipient_name).toBe('Zayd & Fatima');
      expect(verification.mahal.name).toBe('Central Juma Masjid');
    });

    it('should throw NotFoundException if verification token does not match any certificate', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // no certificate found

      await expect(
        service.verifyPublicCertificate('non-existent-token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return valid false if certificate has been revoked', async () => {
      const token = 'revoked-token-123456789012345678';

      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'cert-2',
          certificate_number: 'MEM-2026-0001',
          type: 'MEMBERSHIP',
          recipient_name: 'Former Member',
          recipient_name_ml: null,
          data: {},
          status: 'REVOKED',
          issued_at: new Date('2026-01-01T10:00:00Z'),
          revoked_reason: 'Membership transferred to another Mahal',
          mahal_name: 'Central Juma Masjid',
          mahal_name_ml: 'സെൻട്രൽ ജുമാ മസ്ജിദ്',
          mahal_district: 'Malappuram',
          mahal_waqf_number: 'REG-1234',
          mahal_registration_type: 'WAQF',
          mahal_address: 'Main Road',
        },
      ]);

      const verification = await service.verifyPublicCertificate(token);

      expect(verification).toBeDefined();
      expect(verification.valid).toBe(false);
      expect(verification.status).toBe('REVOKED');
      expect(verification.revoked_reason).toBe(
        'Membership transferred to another Mahal',
      );
    });
  });
});
