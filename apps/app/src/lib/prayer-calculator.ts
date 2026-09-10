import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Qibla,
  Madhab,
  Prayer,
} from 'adhan';
import { format, differenceInSeconds, addDays, isAfter } from 'date-fns';

// Default coordinates: Kozhikode, Kerala (Central Malabar)
export const DEFAULT_COORDINATES = {
  latitude: 11.2588,
  longitude: 75.7804,
  name: 'Kozhikode, Kerala',
};

export interface CalculatedPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  // Iqamah estimates based on standard Kerala Mahal practices
  iqamah: {
    fajr: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    jumua?: Date;
  };
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: Date;
  timeRemainingSeconds: number;
}

export interface PrayerItem {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'jumua';
  name: string;
  name_ml: string;
  arabic: string;
  athanTime: string;
  iqamahTime?: string;
  rawTime: Date;
  isCurrent: boolean;
  isNext: boolean;
}

/**
 * Calculates Shafi'i madhab prayer times with accurate astronomical formulas
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  coords: { latitude: number; longitude: number } = DEFAULT_COORDINATES,
): CalculatedPrayerTimes {
  const coordinates = new Coordinates(coords.latitude, coords.longitude);
  
  // Shafi'i calculation parameters (Muslim World League / Egyptian with Shafi'i Asr 1x shadow)
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi;
  params.fajrAngle = 18.0;
  params.ishaAngle = 18.0;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Standard Kerala Iqamah offsets in minutes (Fajr +20m, Dhuhr +15m, Asr +15m, Maghrib +10m, Isha +20m)
  const iqamah = {
    fajr: new Date(prayerTimes.fajr.getTime() + 20 * 60 * 1000),
    dhuhr: new Date(prayerTimes.dhuhr.getTime() + 15 * 60 * 1000),
    asr: new Date(prayerTimes.asr.getTime() + 15 * 60 * 1000),
    maghrib: new Date(prayerTimes.maghrib.getTime() + 10 * 60 * 1000),
    isha: new Date(prayerTimes.isha.getTime() + 20 * 60 * 1000),
    jumua: new Date(prayerTimes.dhuhr.getTime() + 30 * 60 * 1000), // Friday Jumu'ah 1:00 PM standard
  };

  const now = new Date();
  const currentPrayerName = prayerTimes.currentPrayer();
  const nextPrayerName = prayerTimes.nextPrayer();

  let nextPrayerTime: Date;
  let nextPrayerKey: string;

  if (nextPrayerName === Prayer.None || !nextPrayerName || (nextPrayerName as string) === 'none') {
    // Next prayer is Fajr tomorrow
    const tomorrow = addDays(date, 1);
    const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayerTime = tomorrowPrayerTimes.fajr;
    nextPrayerKey = 'Fajr';
  } else {
    nextPrayerTime = prayerTimes.timeForPrayer(nextPrayerName) ?? prayerTimes.fajr;
    nextPrayerKey = prayerNameToString(nextPrayerName);
  }

  const timeRemainingSeconds = Math.max(0, differenceInSeconds(nextPrayerTime, now));

  return {
    date,
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    iqamah,
    currentPrayer: prayerNameToString(currentPrayerName),
    nextPrayer: nextPrayerKey,
    nextPrayerTime,
    timeRemainingSeconds,
  };
}

export function prayerNameToString(prayer: any): string {
  switch (prayer) {
    case Prayer.Fajr:
    case 'fajr':
      return 'Fajr';
    case Prayer.Sunrise:
    case 'sunrise':
      return 'Sunrise';
    case Prayer.Dhuhr:
    case 'dhuhr':
      return 'Dhuhr';
    case Prayer.Asr:
    case 'asr':
      return 'Asr';
    case Prayer.Maghrib:
    case 'maghrib':
      return 'Maghrib';
    case Prayer.Isha:
    case 'isha':
      return 'Isha';
    default:
      return 'Isha';
  }
}

/**
 * Generates an array of UI-ready prayer rows for the today view
 */
export function getPrayerListForUI(
  calculated: CalculatedPrayerTimes,
  isFriday: boolean = false,
): PrayerItem[] {
  const { currentPrayer, nextPrayer } = calculated;

  const items: PrayerItem[] = [
    {
      id: 'fajr',
      name: 'Fajr',
      name_ml: 'സുബ്ഹി',
      arabic: 'الفجر',
      athanTime: format(calculated.fajr, 'hh:mm a'),
      iqamahTime: format(calculated.iqamah.fajr, 'hh:mm a'),
      rawTime: calculated.fajr,
      isCurrent: currentPrayer === 'Fajr',
      isNext: nextPrayer === 'Fajr',
    },
    {
      id: 'sunrise',
      name: 'Sunrise',
      name_ml: 'സൂര്യോദയം',
      arabic: 'الشروق',
      athanTime: format(calculated.sunrise, 'hh:mm a'),
      rawTime: calculated.sunrise,
      isCurrent: currentPrayer === 'Sunrise',
      isNext: nextPrayer === 'Sunrise',
    },
    {
      id: isFriday ? 'jumua' : 'dhuhr',
      name: isFriday ? "Jumu'ah" : 'Dhuhr',
      name_ml: isFriday ? 'ജുമുഅ' : 'ളുഹ്ർ',
      arabic: isFriday ? 'الجمعة' : 'الظهر',
      athanTime: format(calculated.dhuhr, 'hh:mm a'),
      iqamahTime: isFriday ? '01:00 PM' : format(calculated.iqamah.dhuhr, 'hh:mm a'),
      rawTime: calculated.dhuhr,
      isCurrent: currentPrayer === 'Dhuhr',
      isNext: nextPrayer === 'Dhuhr',
    },
    {
      id: 'asr',
      name: 'Asr',
      name_ml: 'അസ്വർ',
      arabic: 'العصر',
      athanTime: format(calculated.asr, 'hh:mm a'),
      iqamahTime: format(calculated.iqamah.asr, 'hh:mm a'),
      rawTime: calculated.asr,
      isCurrent: currentPrayer === 'Asr',
      isNext: nextPrayer === 'Asr',
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      name_ml: 'മഗ്‌രിബ്',
      arabic: 'المغرب',
      athanTime: format(calculated.maghrib, 'hh:mm a'),
      iqamahTime: format(calculated.iqamah.maghrib, 'hh:mm a'),
      rawTime: calculated.maghrib,
      isCurrent: currentPrayer === 'Maghrib',
      isNext: nextPrayer === 'Maghrib',
    },
    {
      id: 'isha',
      name: 'Isha',
      name_ml: 'ഇശാ',
      arabic: 'العشاء',
      athanTime: format(calculated.isha, 'hh:mm a'),
      iqamahTime: format(calculated.iqamah.isha, 'hh:mm a'),
      rawTime: calculated.isha,
      isCurrent: currentPrayer === 'Isha',
      isNext: nextPrayer === 'Isha',
    },
  ];

  return items;
}

/**
 * Calculates Qibla direction in degrees from True North
 * For Kerala, Qibla angle is ~292° (West-Northwest)
 */
export function getQiblaDirection(
  coords: { latitude: number; longitude: number } = DEFAULT_COORDINATES,
): { degrees: number; cardinal: string; description: string } {
  const coordinates = new Coordinates(coords.latitude, coords.longitude);
  const qiblaAngle = Qibla(coordinates);
  const roundedDegrees = Math.round(qiblaAngle);

  return {
    degrees: roundedDegrees,
    cardinal: 'WNW (പടിഞ്ഞാറ് - വടക്ക്)',
    description: `${roundedDegrees}° from North towards Ka'bah, Makkah`,
  };
}

/**
 * Formats countdown seconds to readable string (e.g. "02:14:30" or "45:10")
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
