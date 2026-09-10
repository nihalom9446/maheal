import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const ISLAMIC_MONTHS_EN = [
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

const ISLAMIC_MONTHS_ML = [
  'മുഹറം',
  'സഫർ',
  'റബീഉൽ അവ്വൽ',
  'റബീഉൽ ആഖിർ',
  'ജമാദുൽ അവ്വൽ',
  'ജമാദുൽ ആഖിർ',
  'റജബ്',
  'ശഅ്ബാൻ',
  'റമദാൻ',
  'ശവ്വാൽ',
  'ദുൽഖഅദ്',
  'ദുൽഹിജ്ജ',
];

const MALAYALAM_DAYS = [
  'ഞായർ',
  'തിങ്കൾ',
  'ചൊവ്വ',
  'ബുധൻ',
  'വ്യാഴം',
  'വെള്ളി',
  'ശനി',
];

/**
 * Approximate Hijri Date Calculator based on Umm al-Qura algorithm
 */
export function getHijriDate(date: Date = new Date()): {
  day: number;
  monthEn: string;
  monthMl: string;
  monthIndex: number;
  year: number;
  formattedEn: string;
  formattedMl: string;
} {
  // Using Intl.DateTimeFormat with islamic-umalqura calendar if available
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let monthIndex = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') monthIndex = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const safeMonthIdx = Math.max(1, Math.min(12, monthIndex)) - 1;
    const monthEn = ISLAMIC_MONTHS_EN[safeMonthIdx] || 'Ramadan';
    const monthMl = ISLAMIC_MONTHS_ML[safeMonthIdx] || 'റമദാൻ';

    return {
      day,
      monthEn,
      monthMl,
      monthIndex: safeMonthIdx + 1,
      year,
      formattedEn: `${day} ${monthEn} ${year} AH`,
      formattedMl: `${day} ${monthMl} ${year} ഹിജ്റ`,
    };
  } catch {
    // Fallback static calculation
    return {
      day: 23,
      monthEn: 'Rabi al-Awwal',
      monthMl: 'റബീഉൽ അവ്വൽ',
      monthIndex: 3,
      year: 1448,
      formattedEn: '23 Rabi al-Awwal 1448 AH',
      formattedMl: '23 റബീഉൽ അവ്വൽ 1448 ഹിജ്റ',
    };
  }
}

/**
 * Formats Gregorian Date with Malayalam day name
 */
export function formatGregorianWithMalayalam(date: Date = new Date()): {
  gregorian: string;
  malayalamDay: string;
  fullDateString: string;
} {
  const gregorian = format(date, 'EEEE, d MMMM yyyy');
  const dayIdx = date.getDay();
  const malayalamDay = MALAYALAM_DAYS[dayIdx];
  const fullDateString = `${format(date, 'd MMMM yyyy')} (${malayalamDay})`;

  return {
    gregorian,
    malayalamDay,
    fullDateString,
  };
}

/**
 * Format relative time for announcements (e.g. "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isToday(d)) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'h:mm a')}`;
  }
  return format(d, 'd MMM yyyy, h:mm a');
}
