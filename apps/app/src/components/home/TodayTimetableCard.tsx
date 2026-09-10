import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import {
  calculatePrayerTimes,
  getPrayerListForUI,
  DEFAULT_COORDINATES,
} from '../../lib/prayer-calculator';

export interface TodayTimetableCardProps {
  latitude?: number;
  longitude?: number;
}

export function TodayTimetableCard({ latitude, longitude }: TodayTimetableCardProps) {
  const coords =
    latitude && longitude ? { latitude, longitude } : DEFAULT_COORDINATES;

  const today = new Date();
  const isFriday = today.getDay() === 5;
  const calculated = calculatePrayerTimes(today, coords);
  const prayerList = getPrayerListForUI(calculated, isFriday);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.title}>Today's Prayer Timings</Text>
        </View>
        <Text style={styles.titleMl}>ഇന്നത്തെ നിസ്കാര സമയങ്ങൾ</Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.colHeader, { flex: 2 }]}>PRAYER</Text>
        <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'center' }]}>AZAN</Text>
        <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right' }]}>IQAMAH</Text>
      </View>

      {/* Prayer Rows */}
      {prayerList.map((prayer) => {
        const isHighlight = prayer.isNext || prayer.isCurrent;

        return (
          <View
            key={prayer.id}
            style={[
              styles.row,
              isHighlight ? styles.activeRow : null,
              prayer.id === 'sunrise' ? styles.sunriseRow : null,
            ]}
          >
            {/* Prayer Name & Malayalam */}
            <View style={{ flex: 2 }}>
              <View style={styles.nameWithIcon}>
                {isHighlight ? (
                  <View style={styles.activeDot} />
                ) : null}
                <Text
                  style={[
                    styles.prayerName,
                    isHighlight ? styles.activeText : null,
                    prayer.id === 'sunrise' ? styles.sunriseText : null,
                  ]}
                >
                  {prayer.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.prayerMl,
                  isHighlight ? styles.activeSubtext : null,
                  prayer.id === 'sunrise' ? styles.sunriseSubtext : null,
                ]}
              >
                {prayer.name_ml} ({prayer.arabic})
              </Text>
            </View>

            {/* Azan Time */}
            <View style={{ flex: 1.5, alignItems: 'center' }}>
              <Text
                style={[
                  styles.timeText,
                  isHighlight ? styles.activeTimeText : null,
                  prayer.id === 'sunrise' ? styles.sunriseText : null,
                ]}
              >
                {prayer.athanTime}
              </Text>
            </View>

            {/* Iqamah Time */}
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
              {prayer.iqamahTime ? (
                <View
                  style={[
                    styles.iqamahBadge,
                    isHighlight ? styles.activeIqamahBadge : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.iqamahText,
                      isHighlight ? styles.activeIqamahText : null,
                    ]}
                  >
                    {prayer.iqamahTime}
                  </Text>
                </View>
              ) : (
                <Text style={styles.noIqamahText}>—</Text>
              )}
            </View>
          </View>
        );
      })}

      <View style={styles.footerInfo}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={styles.footerNote}>
          Iqamah timings follow Mahal Committee Jama'at schedule
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 24,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  row: {
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
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  sunriseRow: {
    opacity: 0.85,
  },
  nameWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  prayerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activeText: {
    color: colors.primaryDark,
  },
  sunriseText: {
    color: colors.textSecondary,
  },
  prayerMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activeSubtext: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  sunriseSubtext: {
    color: colors.textMuted,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  activeTimeText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  iqamahBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  activeIqamahBadge: {
    backgroundColor: colors.primary,
  },
  iqamahText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  activeIqamahText: {
    color: colors.textLight,
  },
  noIqamahText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingRight: spacing.sm,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  footerNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
