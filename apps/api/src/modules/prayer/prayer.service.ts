import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { prayer_schedules, mahals } from '../../database/schema';
import {
  UpdatePrayerScheduleDto,
  PrayerScheduleDetail,
  DayPrayerTimes,
  MonthPrayerTimesResponse,
  CalculatedPrayerTimes,
} from '@maheall/shared';

const KERALA_CENTROID_LAT = 10.8505;
const KERALA_CENTROID_LNG = 76.2711;

@Injectable()
export class PrayerService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private addMinutes(date: Date, minutes: number): string {
    const newDate = new Date(date.getTime() + minutes * 60 * 1000);
    return this.formatTime(newDate);
  }

  private formatCountdown(diffMs: number): string {
    if (diffMs <= 0) return '00:00:00';
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async getSchedule(mahalId: string): Promise<PrayerScheduleDetail> {
    const [schedule] = await this.db
      .select()
      .from(prayer_schedules)
      .where(eq(prayer_schedules.mahal_id, mahalId))
      .limit(1);

    const [mahal] = await this.db
      .select({
        masjid_lat: mahals.masjid_lat,
        masjid_lng: mahals.masjid_lng,
      })
      .from(mahals)
      .where(eq(mahals.id, mahalId))
      .limit(1);

    const lat = mahal?.masjid_lat ? Number(mahal.masjid_lat) : KERALA_CENTROID_LAT;
    const lng = mahal?.masjid_lng ? Number(mahal.masjid_lng) : KERALA_CENTROID_LNG;

    if (!schedule) {
      return {
        id: '',
        mahal_id: mahalId,
        madhab: 'SHAFI',
        fajr_angle: 18.0,
        isha_angle: 18.0,
        fajr_iqamah_offset_minutes: 20,
        dhuhr_iqamah_offset_minutes: 10,
        asr_iqamah_offset_minutes: 10,
        maghrib_iqamah_offset_minutes: 5,
        isha_iqamah_offset_minutes: 15,
        jumuah_time: '12:30',
        jumuah_second_time: null,
        jumuah_iqamah_offset_minutes: 5,
        seasonal_overrides: null,
        updated_by_user_id: null,
        updated_at: new Date(),
        masjid_lat: lat,
        masjid_lng: lng,
      };
    }

    return {
      id: schedule.id,
      mahal_id: schedule.mahal_id,
      madhab: schedule.madhab,
      fajr_angle: Number(schedule.fajr_angle),
      isha_angle: Number(schedule.isha_angle),
      fajr_iqamah_offset_minutes: schedule.fajr_iqamah_offset_minutes,
      dhuhr_iqamah_offset_minutes: schedule.dhuhr_iqamah_offset_minutes,
      asr_iqamah_offset_minutes: schedule.asr_iqamah_offset_minutes,
      maghrib_iqamah_offset_minutes: schedule.maghrib_iqamah_offset_minutes,
      isha_iqamah_offset_minutes: schedule.isha_iqamah_offset_minutes,
      jumuah_time: schedule.jumuah_time,
      jumuah_second_time: schedule.jumuah_second_time,
      jumuah_iqamah_offset_minutes: schedule.jumuah_iqamah_offset_minutes,
      seasonal_overrides: schedule.seasonal_overrides as Record<string, unknown> | null,
      updated_by_user_id: schedule.updated_by_user_id,
      updated_at: schedule.updated_at,
      masjid_lat: lat,
      masjid_lng: lng,
    };
  }

  async updateSchedule(
    mahalId: string,
    dto: UpdatePrayerScheduleDto,
    userId: string,
  ): Promise<PrayerScheduleDetail> {
    // If coordinates are provided, update mahal table
    if (dto.masjid_lat !== undefined || dto.masjid_lng !== undefined) {
      await this.db
        .update(mahals)
        .set({
          masjid_lat: dto.masjid_lat !== undefined && dto.masjid_lat !== null ? String(dto.masjid_lat) : undefined,
          masjid_lng: dto.masjid_lng !== undefined && dto.masjid_lng !== null ? String(dto.masjid_lng) : undefined,
        })
        .where(eq(mahals.id, mahalId));
    }

    const [existing] = await this.db
      .select()
      .from(prayer_schedules)
      .where(eq(prayer_schedules.mahal_id, mahalId))
      .limit(1);

    const values = {
      mahal_id: mahalId,
      madhab: dto.madhab || 'SHAFI',
      fajr_angle: String(dto.fajr_angle ?? 18.0),
      isha_angle: String(dto.isha_angle ?? 18.0),
      fajr_iqamah_offset_minutes: dto.fajr_iqamah_offset_minutes ?? 20,
      dhuhr_iqamah_offset_minutes: dto.dhuhr_iqamah_offset_minutes ?? 10,
      asr_iqamah_offset_minutes: dto.asr_iqamah_offset_minutes ?? 10,
      maghrib_iqamah_offset_minutes: dto.maghrib_iqamah_offset_minutes ?? 5,
      isha_iqamah_offset_minutes: dto.isha_iqamah_offset_minutes ?? 15,
      jumuah_time: dto.jumuah_time ?? null,
      jumuah_second_time: dto.jumuah_second_time ?? null,
      jumuah_iqamah_offset_minutes: dto.jumuah_iqamah_offset_minutes ?? 5,
      seasonal_overrides: dto.seasonal_overrides ?? null,
      updated_by_user_id: userId,
      updated_at: new Date(),
    };

    if (existing) {
      await this.db
        .update(prayer_schedules)
        .set(values)
        .where(eq(prayer_schedules.mahal_id, mahalId));
    } else {
      await this.db.insert(prayer_schedules).values(values);
    }

    return this.getSchedule(mahalId);
  }

  async getTodayTimes(mahalId: string, dateStr?: string): Promise<DayPrayerTimes> {
    const schedule = await this.getSchedule(mahalId);
    const lat = schedule.masjid_lat || KERALA_CENTROID_LAT;
    const lng = schedule.masjid_lng || KERALA_CENTROID_LNG;

    const targetDate = dateStr
      ? new Date(`${dateStr}T12:00:00+05:30`)
      : new Date();

    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Karachi();
    params.madhab = schedule.madhab === 'HANAFI' ? Madhab.Hanafi : Madhab.Shafi;
    params.fajrAngle = schedule.fajr_angle;
    params.ishaAngle = schedule.isha_angle;

    const prayerTimes = new PrayerTimes(coordinates, targetDate, params);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formattedDateStr = `${year}-${month}-${day}`;

    const isJumuah = targetDate.getDay() === 5; // Friday

    const fajrAzan = this.formatTime(prayerTimes.fajr);
    const sunrise = this.formatTime(prayerTimes.sunrise);
    const dhuhrAzan = this.formatTime(prayerTimes.dhuhr);
    const asrAzan = this.formatTime(prayerTimes.asr);
    const maghribAzan = this.formatTime(prayerTimes.maghrib);
    const ishaAzan = this.formatTime(prayerTimes.isha);

    const fajrIqamah = this.addMinutes(prayerTimes.fajr, schedule.fajr_iqamah_offset_minutes);
    const dhuhrIqamah = this.addMinutes(prayerTimes.dhuhr, schedule.dhuhr_iqamah_offset_minutes);
    const asrIqamah = this.addMinutes(prayerTimes.asr, schedule.asr_iqamah_offset_minutes);
    const maghribIqamah = this.addMinutes(prayerTimes.maghrib, schedule.maghrib_iqamah_offset_minutes);
    const ishaIqamah = this.addMinutes(prayerTimes.isha, schedule.isha_iqamah_offset_minutes);

    const jumuahTime = schedule.jumuah_time || '12:30';
    let jumuahIqamah: string | null = null;
    if (schedule.jumuah_time) {
      const [jHour, jMin] = schedule.jumuah_time.split(':').map(Number);
      const jDate = new Date(targetDate);
      jDate.setHours(jHour, jMin, 0, 0);
      jumuahIqamah = this.addMinutes(jDate, schedule.jumuah_iqamah_offset_minutes);
    }

    // Determine current & next prayer and countdown
    const now = new Date();
    const isTargetToday = targetDate.toDateString() === now.toDateString();
    const comparisonTime = isTargetToday ? now : targetDate;

    const prayersList = [
      { name: 'Fajr', time: prayerTimes.fajr, azan: fajrAzan },
      { name: 'Sunrise', time: prayerTimes.sunrise, azan: sunrise },
      { name: isJumuah ? "Jumu'ah" : 'Dhuhr', time: prayerTimes.dhuhr, azan: isJumuah && schedule.jumuah_time ? schedule.jumuah_time : dhuhrAzan },
      { name: 'Asr', time: prayerTimes.asr, azan: asrAzan },
      { name: 'Maghrib', time: prayerTimes.maghrib, azan: maghribAzan },
      { name: 'Isha', time: prayerTimes.isha, azan: ishaAzan },
    ];

    let currentPrayer: string | null = null;
    let nextPrayer = 'Fajr';
    let nextPrayerTime = fajrAzan;
    let timeToNext = '00:00:00';

    if (comparisonTime < prayerTimes.fajr) {
      currentPrayer = null;
      nextPrayer = 'Fajr';
      nextPrayerTime = fajrAzan;
      timeToNext = this.formatCountdown(prayerTimes.fajr.getTime() - comparisonTime.getTime());
    } else if (comparisonTime < prayerTimes.sunrise) {
      currentPrayer = 'Fajr';
      nextPrayer = 'Sunrise';
      nextPrayerTime = sunrise;
      timeToNext = this.formatCountdown(prayerTimes.sunrise.getTime() - comparisonTime.getTime());
    } else if (comparisonTime < prayerTimes.dhuhr) {
      currentPrayer = 'Sunrise';
      nextPrayer = isJumuah ? "Jumu'ah" : 'Dhuhr';
      nextPrayerTime = isJumuah && schedule.jumuah_time ? schedule.jumuah_time : dhuhrAzan;
      timeToNext = this.formatCountdown(prayerTimes.dhuhr.getTime() - comparisonTime.getTime());
    } else if (comparisonTime < prayerTimes.asr) {
      currentPrayer = isJumuah ? "Jumu'ah" : 'Dhuhr';
      nextPrayer = 'Asr';
      nextPrayerTime = asrAzan;
      timeToNext = this.formatCountdown(prayerTimes.asr.getTime() - comparisonTime.getTime());
    } else if (comparisonTime < prayerTimes.maghrib) {
      currentPrayer = 'Asr';
      nextPrayer = 'Maghrib';
      nextPrayerTime = maghribAzan;
      timeToNext = this.formatCountdown(prayerTimes.maghrib.getTime() - comparisonTime.getTime());
    } else if (comparisonTime < prayerTimes.isha) {
      currentPrayer = 'Maghrib';
      nextPrayer = 'Isha';
      nextPrayerTime = ishaAzan;
      timeToNext = this.formatCountdown(prayerTimes.isha.getTime() - comparisonTime.getTime());
    } else {
      currentPrayer = 'Isha';
      // Next prayer is tomorrow's Fajr
      const tomorrow = new Date(targetDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
      nextPrayer = 'Fajr';
      nextPrayerTime = this.formatTime(tomorrowTimes.fajr);
      timeToNext = this.formatCountdown(tomorrowTimes.fajr.getTime() - comparisonTime.getTime());
    }

    return {
      date: formattedDateStr,
      fajr_azan: fajrAzan,
      fajr_iqamah: fajrIqamah,
      sunrise,
      dhuhr_azan: dhuhrAzan,
      dhuhr_iqamah: dhuhrIqamah,
      asr_azan: asrAzan,
      asr_iqamah: asrIqamah,
      maghrib_azan: maghribAzan,
      maghrib_iqamah: maghribIqamah,
      isha_azan: ishaAzan,
      isha_iqamah: ishaIqamah,
      jumuah_time: isJumuah ? jumuahTime : null,
      jumuah_iqamah: isJumuah ? jumuahIqamah : null,
      current_prayer: currentPrayer,
      next_prayer: nextPrayer,
      next_prayer_time: nextPrayerTime,
      time_to_next: timeToNext,
      is_jumuah: isJumuah,
      latitude: lat,
      longitude: lng,
      madhab: schedule.madhab,
    };
  }

  async getMonthTimes(
    mahalId: string,
    year: number,
    month: number,
  ): Promise<MonthPrayerTimesResponse> {
    const schedule = await this.getSchedule(mahalId);
    const lat = schedule.masjid_lat || KERALA_CENTROID_LAT;
    const lng = schedule.masjid_lng || KERALA_CENTROID_LNG;

    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Karachi();
    params.madhab = schedule.madhab === 'HANAFI' ? Madhab.Hanafi : Madhab.Shafi;
    params.fajrAngle = schedule.fajr_angle;
    params.ishaAngle = schedule.isha_angle;

    const daysInMonth = new Date(year, month, 0).getDate();
    const days: CalculatedPrayerTimes[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const prayerTimes = new PrayerTimes(coordinates, date, params);
      const isJumuah = date.getDay() === 5;

      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const jumuahTime = schedule.jumuah_time || '12:30';
      let jumuahIqamah: string | null = null;
      if (schedule.jumuah_time) {
        const [jHour, jMin] = schedule.jumuah_time.split(':').map(Number);
        const jDate = new Date(date);
        jDate.setHours(jHour, jMin, 0, 0);
        jumuahIqamah = this.addMinutes(jDate, schedule.jumuah_iqamah_offset_minutes);
      }

      days.push({
        date: dateStr,
        fajr_azan: this.formatTime(prayerTimes.fajr),
        fajr_iqamah: this.addMinutes(prayerTimes.fajr, schedule.fajr_iqamah_offset_minutes),
        sunrise: this.formatTime(prayerTimes.sunrise),
        dhuhr_azan: this.formatTime(prayerTimes.dhuhr),
        dhuhr_iqamah: this.addMinutes(prayerTimes.dhuhr, schedule.dhuhr_iqamah_offset_minutes),
        asr_azan: this.formatTime(prayerTimes.asr),
        asr_iqamah: this.addMinutes(prayerTimes.asr, schedule.asr_iqamah_offset_minutes),
        maghrib_azan: this.formatTime(prayerTimes.maghrib),
        maghrib_iqamah: this.addMinutes(prayerTimes.maghrib, schedule.maghrib_iqamah_offset_minutes),
        isha_azan: this.formatTime(prayerTimes.isha),
        isha_iqamah: this.addMinutes(prayerTimes.isha, schedule.isha_iqamah_offset_minutes),
        jumuah_time: isJumuah ? jumuahTime : null,
        jumuah_iqamah: isJumuah ? jumuahIqamah : null,
      });
    }

    return {
      year,
      month,
      mahal_id: mahalId,
      days,
    };
  }
}