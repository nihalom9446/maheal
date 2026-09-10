import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceService } from '../src/modules/finance/finance.service';
import { DATABASE_TOKEN } from '../src/database/database.module';

describe('FinanceService - Pirivu Collection', () => {
  let service: FinanceService;
  let mockDb: any;
  let mockTx: any;

  const mockMahalId = '11111111-1111-1111-1111-111111111111';
  const mockFamilyId = '22222222-2222-2222-2222-222222222222';
  const mockUserId = '33333333-3333-3333-3333-333333333333';

  beforeEach(async () => {
    mockTx = {
      select: jest.fn(),
      insert: jest.fn(),
    };

    mockDb = {
      transaction: jest.fn((cb) => cb(mockTx)),
      select: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: DATABASE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('recordPirivu - Multi-Month Collection & Sequential Receipt Generation', () => {
    it('should throw NotFoundException if family does not exist in mahal', async () => {
      // 1. Family query returns empty
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      await expect(
        service.recordPirivu(
          mockMahalId,
          {
            family_id: mockFamilyId,
            payment_months: ['2026-09-01'],
            amount_per_month: 200,
            payment_method: 'CASH',
          },
          mockUserId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if any of the requested months is already collected', async () => {
      // 1. Family query returns family
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([
                  {
                    id: mockFamilyId,
                    mahal_id: mockMahalId,
                    family_number: 101,
                    house_name: 'Rose Villa',
                    status: 'ACTIVE',
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      // 2. Duplicate check returns existing collection
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { payment_month: '2026-09-01' },
          ]),
        }),
      });

      await expect(
        service.recordPirivu(
          mockMahalId,
          {
            family_id: mockFamilyId,
            payment_months: ['2026-09-01'],
            amount_per_month: 200,
            payment_method: 'CASH',
          },
          mockUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record atomic multi-month collection and generate sequential receipt number', async () => {
      // 1. Family query returns family
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([
                  {
                    id: mockFamilyId,
                    mahal_id: mockMahalId,
                    family_number: 101,
                    house_name: 'Rose Villa',
                    house_name_ml: 'റോസ് വില്ല',
                    door_number: '12/34',
                    ward_name: 'Ward 1',
                    ward_name_ml: 'വാർഡ് 1',
                    head_name: 'Ahmed',
                    head_phone: '+919846012345',
                    status: 'ACTIVE',
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      // 2. Duplicate check returns empty
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      // 3. Sequential receipt check on mockDb (generateReceiptNumber)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { receipt_number: 'REC-202609-0004' },
              ]),
            }),
          }),
        }),
      });

      // 4. Inserts for pirivu collections (one per month) and income record
      mockTx.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'mock-id-1' }]),
        }),
      });

      // 5. Collector name query
      mockTx.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ name: 'Treasurer Usman' }]),
          }),
        }),
      });

      const result = await service.recordPirivu(
        mockMahalId,
        {
          family_id: mockFamilyId,
          payment_months: ['2026-08-01', '2026-09-01'],
          amount_per_month: 200,
          payment_method: 'CASH',
        },
        mockUserId,
      );

      expect(result).toBeDefined();
      expect(result.receipt_number).toBe('REC-202609-0005');
      expect(result.total_amount).toBe(400);
      expect(result.payment_months).toEqual(['2026-08-01', '2026-09-01']);
      expect(result.amount_per_month).toBe(200);
      expect(result.payment_method).toBe('CASH');
      expect(result.family_number).toBe(101);
      expect(result.house_name).toBe('Rose Villa');
    });
  });
});
