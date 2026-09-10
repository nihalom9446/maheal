/**
 * Islamic Hijri Date Utility
 * Handles accurate Hijri date calculation and English formatting.
 */

export interface HijriDateInfo {
  day: number;
  month: number;
  monthNameEn: string;
  monthNameMl: string;
  monthNameAr: string;
  year: number;
  formattedEn: string;
  formattedMl: string;
  formattedAr: string;
}

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export const HIJRI_MONTHS_ML = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

/**
 * Calculates approximate Hijri date from Gregorian date
 */
export function getHijriDate(date: Date = new Date(), dayAdjustment = 0): HijriDateInfo {
  const adjusted = new Date(date.getTime() + dayAdjustment * 24 * 60 * 60 * 1000);

  try {
    // Try browser/Node Intl with islamic-umalqura calendar
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(adjusted);
    let hDay = 1;
    let hMonth = 1;
    let hYear = 1448;

    for (const part of parts) {
      if (part.type === 'day') hDay = parseInt(part.value, 10);
      if (part.type === 'month') hMonth = parseInt(part.value, 10);
      if (part.type === 'year') {
        const cleaned = part.value.replace(/[^0-9]/g, '');
        if (cleaned) hYear = parseInt(cleaned, 10);
      }
    }

    const monthIdx = Math.max(0, Math.min(11, hMonth - 1));
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const monthNameMl = HIJRI_MONTHS_ML[monthIdx];
    const monthNameAr = HIJRI_MONTHS_AR[monthIdx];

    return {
      day: hDay,
      month: hMonth,
      monthNameEn,
      monthNameMl,
      monthNameAr,
      year: hYear,
      formattedEn: `${hDay} ${monthNameEn} ${hYear} AH`,
      formattedMl: `${hDay} ${monthNameEn} ${hYear} AH`,
      formattedAr: `${hDay} ${monthNameEn} ${hYear} AH`,
    };
  } catch {
    // Fallback algorithmic estimate
    const jd = Math.floor(adjusted.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(jd - 1948439.5) + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    const monthIdx = Math.max(0, Math.min(11, month - 1));
    const monthNameEn = HIJRI_MONTHS_EN[monthIdx];
    const monthNameMl = HIJRI_MONTHS_ML[monthIdx];
    const monthNameAr = HIJRI_MONTHS_AR[monthIdx];

    return {
      day,
      month,
      monthNameEn,
      monthNameMl,
      monthNameAr,
      year,
      formattedEn: `${day} ${monthNameEn} ${year} AH`,
      formattedMl: `${day} ${monthNameEn} ${year} AH`,
      formattedAr: `${day} ${monthNameEn} ${year} AH`,
    };
  }
}
