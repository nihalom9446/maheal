import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { OtpService } from '../src/modules/auth/otp.service';
import { DATABASE_TOKEN } from '../src/database/database.module';
import * as bcrypt from 'bcrypt';

describe('OtpService', () => {
  let service: OtpService;
  let mockDb: any;

  const testPhone = '+919846012345';

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: DATABASE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  describe('generateOtp', () => {
    it('should generate a valid 6-digit numeric OTP string and store hashed version', async () => {
      // Mock no recent OTPs (rate limit passes)
      mockDb.where.mockResolvedValueOnce([]); // rate limit check query

      const otp = await service.generateOtp(testPhone);

      expect(otp).toBeDefined();
      expect(typeof otp).toBe('string');
      expect(otp).toMatch(/^\d{6}$/);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThanOrEqual(999999);

      // Verify db insert was called
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: testPhone,
          attempts: 0,
        }),
      );
    });

    it('should throw 429 TOO_MANY_REQUESTS when rate limit is exceeded (>= 5 requests in window)', async () => {
      // Mock 5 recent OTPs in the cooldown window
      mockDb.where.mockResolvedValueOnce([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
      ]);

      await expect(service.generateOtp(testPhone)).rejects.toThrow(
        new HttpException(
          'Too many OTP requests. Please wait 15 minutes before trying again.',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should throw BadRequestException if no active session or expired', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // no session found

      await expect(service.verifyOtp(testPhone, '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw 429 when max attempts reached on a session', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'sess-1',
          phone: testPhone,
          otp_hash: 'somehash',
          attempts: 5, // OTP_MAX_ATTEMPTS
        },
      ]);

      await expect(service.verifyOtp(testPhone, '123456')).rejects.toThrow(
        new HttpException(
          'Too many incorrect OTP attempts. Please request a new one.',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });

    it('should increment attempt counter and throw BadRequestException on wrong OTP', async () => {
      const correctOtp = '654321';
      const hash = await bcrypt.hash(correctOtp, 10);

      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'sess-1',
          phone: testPhone,
          otp_hash: hash,
          attempts: 1,
        },
      ]);

      await expect(service.verifyOtp(testPhone, '111111')).rejects.toThrow(
        BadRequestException,
      );

      // Verify attempts was incremented
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ attempts: 2 });
    });

    it('should successfully verify valid OTP and delete session', async () => {
      const validOtp = '123456';
      const hash = await bcrypt.hash(validOtp, 10);

      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'sess-1',
          phone: testPhone,
          otp_hash: hash,
          attempts: 0,
        },
      ]);

      const result = await service.verifyOtp(testPhone, validOtp);

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
