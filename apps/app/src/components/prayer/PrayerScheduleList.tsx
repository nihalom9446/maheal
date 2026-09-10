import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays } from 'date-fns';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import {
  calculatePrayerTimes,
  getPrayerListForUI,
  DEFAULT_COORDINATES,
} from '../../lib/prayer-calculator';
import { getHijriDate } from '../../lib/date-utils';

export interface PrayerScheduleListProps {
  latitude?: number;
  longitude?: number;
}

type ViewMode = 'today' | 'weekly' | 'monthly';

export function PrayerScheduleList({ latitude, longitude }: PrayerScheduleListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const coords =
    latitude && longitude ? { latitude, longitude } : DEFAULT_COORDINATES;

  const today = new Date();
  const calculatedToday = calculatePrayerTimes(today, coords);
  const prayerListToday = getPrayerListForUI(calculatedToday, today.getDay() === 5);

  // Generate next 7 days for weekly view
  const weeklyDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    const times = calculatePrayerTimes(d, coords);
    const hijri = getHijriDate(d);
    return {
      date: d,
      hijri,
      isFriday: d.getDay() === 5,
      fajr: format(times.fajr, 'hh:mm a'),
      sunrise: format(times.sunrise, 'hh:mm a'),
      dhuhr: format(times.dhuhr, 'hh:mm a'),
      asr: format(times.asr, 'hh:mm a'),
      maghrib: format(times.maghrib, 'hh:mm a'),
      isha: format(times.isha, 'hh:mm a'),
    };
  });

  // Generate current month days
  const monthlyDays = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(today, i - today.getDate() + 1);
    const times = calculatePrayerTimes(d, coords);
    const hijri = getHijriDate(d);
    return {
      date: d,
      hijri,
      isFriday: d.getDay() === 5,
      fajr: format(times.fajr, 'hh:mm a'),
      sunrise: format(times.sunrise, 'hh:mm a'),
      dhuhr: format(times.dhuhr, 'hh:mm a'),
      asr: format(times.asr, 'hh:mm a'),
      maghrib: format(times.maghrib, 'hh:mm a'),
      isha: format(times.isha, 'hh:mm a'),
    };
  });

  return (
    <View style={styles.container}>
      {/* View Mode Selector Tabs */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabBtn, viewMode === 'today' ? styles.tabBtnActive : null]}
          onPress={() => setViewMode('today')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabBtnText,
              viewMode === 'today' ? styles.tabBtnTextActive : null,
            ]}
          >
            Today (ഇന്ന്)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, viewMode === 'weekly' ? styles.tabBtnActive : null]}
          onPress={() => setViewMode('weekly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabBtnText,
              viewMode === 'weekly' ? styles.tabBtnTextActive : null,
            ]}
          >
            Weekly (ആഴ്ച)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, viewMode === 'monthly' ? styles.tabBtnActive : null]}
          onPress={() => setViewMode('monthly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabBtnText,
              viewMode === 'monthly' ? styles.tabBtnTextActive : null,
            ]}
          >
            Monthly (മാസം)
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Mode Content */}
      {viewMode === 'today' && (
        <View style={styles.todayCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { flex: 2 }]}>PRAYER / നമസ്കാരം</Text>
            <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'center' }]}>AZAN</Text>
            <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right' }]}>IQAMAH</Text>
          </View>

          {prayerListToday.map((prayer) => (
            <View
              key={prayer.id}
              style={[
                styles.todayRow,
                prayer.isCurrent || prayer.isNext ? styles.activeRow : null,
              ]}
            >
              <View style={{ flex: 2 }}>
                <Text style={styles.prayerTitleEn}>{prayer.name}</Text>
                <Text style={styles.prayerTitleMl}>
                  {prayer.name_ml} • {prayer.arabic}
                </Text>
              </View>

              <View style={{ flex: 1.5, alignItems: 'center' }}>
                <Text style={styles.timeMain}>{prayer.athanTime}</Text>
              </View>

              <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                {prayer.iqamahTime ? (
                  <View style={styles.iqamahPill}>
                    <Text style={styles.iqamahPillText}>{prayer.iqamahTime}</Text>
                  </View>
                ) : (
                  <Text style={styles.noIqamah}>—</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {(viewMode === 'weekly' || viewMode === 'monthly') && (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.multiDayTable}>
            {/* Table Header */}
            <View style={styles.multiDayHeaderRow}>
              <Text style={[styles.multiDayColHeader, { width: 90 }]}>DATE</Text>
              <Text style={[styles.multiDayColHeader, { width: 90 }]}>HIJRI</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>FAJR</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>SUNRISE</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>DHUHR</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>ASR</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>MAGHRIB</Text>
              <Text style={[styles.multiDayColHeader, { width: 75 }]}>ISHA</Text>
            </View>

            {/* Rows */}
            {(viewMode === 'weekly' ? weeklyDays : monthlyDays).map((d, index) => {
              const isTodayRow = format(d.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              return (
                <View
                  key={index}
                  style={[
                    styles.multiDayRow,
                    isTodayRow ? styles.multiDayTodayRow : null,
                    d.isFriday ? styles.fridayRow : null,
                  ]}
                >
                  <View style={{ width: 90 }}>
                    <Text style={[styles.dateCellText, isTodayRow ? styles.boldCellText : null]}>
                      {format(d.date, 'd MMM (EEE)')}
                    </Text>
                  </View>

                  <View style={{ width: 90 }}>
                    <Text style={styles.hijriCellText}>
                      {d.hijri.day} {d.hijri.monthEn.slice(0, 6)}
                    </Text>
                  </View>

                  <Text style={[styles.timeCellText, { width: 75 }]}>{d.fajr}</Text>
                  <Text style={[styles.timeCellText, { width: 75, color: colors.textMuted }]}>
                    {d.sunrise}
                  </Text>
                  <Text style={[styles.timeCellText, { width: 75 }]}>{d.dhuhr}</Text>
                  <Text style={[styles.timeCellText, { width: 75 }]}>{d.asr}</Text>
                  <Text style={[styles.timeCellText, { width: 75 }]}>{d.maghrib}</Text>
                  <Text style={[styles.timeCellText, { width: 75 }]}>{d.isha}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  activeRow: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
  },
  prayerTitleEn: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  prayerTitleMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  timeMain: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  iqamahPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  iqamahPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    fontVariant: ['tabular-nums'],
  },
  noIqamah: {
    fontSize: 14,
    color: colors.textMuted,
  },
  multiDayTable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiDayHeaderRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  multiDayColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  multiDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  multiDayTodayRow: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.sm,
  },
  fridayRow: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  dateCellText: {
    fontSize: 12,
    color: colors.textPrimary,
    paddingLeft: spacing.xs,
  },
  boldCellText: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  hijriCellText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeCellText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
