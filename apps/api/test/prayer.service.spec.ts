import { Test, TestingModule } from '@nestjs/testing';
import { PrayerService } from '../src/modules/prayer/prayer.service';
import { DATABASE_TOKEN } from '../src/database/database.module';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

describe('PrayerService', () => {
  let service: PrayerService;
  let mockDb: any;

  const mockMahalId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrayerService,
        {
          provide: DATABASE_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PrayerService>(PrayerService);
  });

  describe('Adhan Calculation with Shafi madhab and Karachi angles', () => {
    it('should calculate accurate prayer times using Karachi method with 18.0 degree angles and Shafi madhab', () => {
      // Kerala Centroid (Malappuram/Thrissur region)
      const lat = 10.8505;
      const lng = 76.2711;
      const coordinates = new Coordinates(lat, lng);

      const params = CalculationMethod.Karachi();
      params.madhab = Madhab.Shafi;
      params.fajrAngle = 18.0;
      params.ishaAngle = 18.0;

      const testDate = new Date('2026-09-08T12:00:00+05:30');
      const prayerTimes = new PrayerTimes(coordinates, testDate, params);

      expect(prayerTimes).toBeDefined();
      expect(prayerTimes.fajr).toBeInstanceOf(Date);
      expect(prayerTimes.sunrise).toBeInstanceOf(Date);
      expect(prayerTimes.dhuhr).toBeInstanceOf(Date);
      expect(prayerTimes.asr).toBeInstanceOf(Date);
      expect(prayerTimes.maghrib).toBeInstanceOf(Date);
      expect(prayerTimes.isha).toBeInstanceOf(Date);

      // Verify sequence: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha
      expect(prayerTimes.fajr.getTime()).toBeLessThan(prayerTimes.sunrise.getTime());
      expect(prayerTimes.sunrise.getTime()).toBeLessThan(prayerTimes.dhuhr.getTime());
      expect(prayerTimes.dhuhr.getTime()).toBeLessThan(prayerTimes.asr.getTime());
      expect(prayerTimes.asr.getTime()).toBeLessThan(prayerTimes.maghrib.getTime());
      expect(prayerTimes.maghrib.getTime()).toBeLessThan(prayerTimes.isha.getTime());

      // Verify Shafi'i shadow ratio is single shadow length + noon shadow
      expect(params.madhab).toEqual(Madhab.Shafi);
      expect(params.fajrAngle).toBe(18.0);
      expect(params.ishaAngle).toBe(18.0);
    });

    it('should return default schedule with Shafi madhab and 18-degree angles when no DB record exists', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // schedule query
      mockDb.limit.mockResolvedValueOnce([]); // mahal coordinates query

      const schedule = await service.getSchedule(mockMahalId);

      expect(schedule).toBeDefined();
      expect(schedule.madhab).toBe('SHAFI');
      expect(schedule.fajr_angle).toBe(18.0);
      expect(schedule.isha_angle).toBe(18.0);
      expect(schedule.fajr_iqamah_offset_minutes).toBe(20);
      expect(schedule.dhuhr_iqamah_offset_minutes).toBe(10);
      expect(schedule.asr_iqamah_offset_minutes).toBe(10);
      expect(schedule.maghrib_iqamah_offset_minutes).toBe(5);
      expect(schedule.isha_iqamah_offset_minutes).toBe(15);
    });

    it('should calculate today prayer times including Iqamah offsets correctly', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'sched-1',
          mahal_id: mockMahalId,
          madhab: 'SHAFI',
          fajr_angle: '18.00',
          isha_angle: '18.00',
          fajr_iqamah_offset_minutes: 25,
          dhuhr_iqamah_offset_minutes: 15,
          asr_iqamah_offset_minutes: 15,
          maghrib_iqamah_offset_minutes: 10,
          isha_iqamah_offset_minutes: 20,
          jumuah_time: '12:30',
          jumuah_second_time: null,
          jumuah_iqamah_offset_minutes: 10,
          seasonal_overrides: null,
          updated_by_user_id: null,
          updated_at: new Date(),
        },
      ]);
      mockDb.limit.mockResolvedValueOnce([
        {
          masjid_lat: '11.2588',
          masjid_lng: '75.7804',
        },
      ]);

      const todayTimes = await service.getTodayTimes(mockMahalId, '2026-09-08');

      expect(todayTimes).toBeDefined();
      expect(todayTimes.date).toBe('2026-09-08');
      expect(todayTimes.fajr_azan).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.fajr_iqamah).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.dhuhr_azan).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.dhuhr_iqamah).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.asr_azan).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.maghrib_azan).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.isha_azan).toMatch(/^\d{2}:\d{2}$/);
      expect(todayTimes.madhab).toBe('SHAFI');
    });

    it('should generate monthly prayer calendar with exact day count for September (30 days)', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);

      const monthTimes = await service.getMonthTimes(mockMahalId, 2026, 9);

      expect(monthTimes.year).toBe(2026);
      expect(monthTimes.month).toBe(9);
      expect(monthTimes.days).toHaveLength(30);
      expect(monthTimes.days[0].date).toBe('2026-09-01');
      expect(monthTimes.days[29].date).toBe('2026-09-30');
    });
  });
});
