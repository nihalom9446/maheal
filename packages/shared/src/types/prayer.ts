export interface PrayerSchedule {
  id: string;
  mahal_id: string;
  madhab: 'SHAFI' | 'HANAFI';
  fajr_angle: number;
  isha_angle: number;
  fajr_iqamah_offset_minutes: number;
  dhuhr_iqamah_offset_minutes: number;
  asr_iqamah_offset_minutes: number;
  maghrib_iqamah_offset_minutes: number;
  isha_iqamah_offset_minutes: number;
  jumuah_time: string | null;         // HH:mm
  jumuah_second_time: string | null;  // HH:mm, for Mahals with 2 Jumu'ah
  jumuah_iqamah_offset_minutes: number;
  seasonal_overrides: Record<string, unknown> | null;
  updated_by_user_id: string | null;
  updated_at: Date | string;
}

export type PrayerScheduleDetail = PrayerSchedule & {
  masjid_lat?: number | null;
  masjid_lng?: number | null;
};

export interface CalculatedPrayerTimes {
  date: string;         // YYYY-MM-DD
  fajr_azan: string;    // HH:mm
  fajr_iqamah: string;
  sunrise: string;
  dhuhr_azan: string;
  dhuhr_iqamah: string;
  asr_azan: string;
  asr_iqamah: string;
  maghrib_azan: string;
  maghrib_iqamah: string;
  isha_azan: string;
  isha_iqamah: string;
  jumuah_time: string | null;
  jumuah_iqamah: string | null;
}

export interface DayPrayerTimes extends CalculatedPrayerTimes {
  current_prayer: string | null; // e.g. 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Sunrise', or null
  next_prayer: string;           // e.g. 'Fajr', 'Dhuhr', etc.
  next_prayer_time: string;      // HH:mm
  time_to_next: string;          // e.g. "01:23:45"
  is_jumuah: boolean;
  latitude: number;
  longitude: number;
  madhab: 'SHAFI' | 'HANAFI';
}

export type TodayPrayerTimesDto = DayPrayerTimes;

export interface MonthPrayerTimesResponse {
  year: number;
  month: number;
  mahal_id: string;
  days: CalculatedPrayerTimes[];
}

export type PrayerMonthTimesDto = MonthPrayerTimesResponse;