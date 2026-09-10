import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import {
  calculatePrayerTimes,
  formatCountdown,
  DEFAULT_COORDINATES,
} from '../../lib/prayer-calculator';

export interface NextPrayerCountdownProps {
  latitude?: number;
  longitude?: number;
}

export function NextPrayerCountdown({ latitude, longitude }: NextPrayerCountdownProps) {
  const coords =
    latitude && longitude ? { latitude, longitude } : DEFAULT_COORDINATES;

  const [prayerData, setPrayerData] = useState(() => calculatePrayerTimes(new Date(), coords));
  const [secondsLeft, setSecondsLeft] = useState(prayerData.timeRemainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = calculatePrayerTimes(new Date(), coords);
      setPrayerData(updated);
      setSecondsLeft(updated.timeRemainingSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [coords.latitude, coords.longitude]);

  // Prayer Malayalam translation mapping
  const getMalayalamPrayerName = (prayer: string): string => {
    switch (prayer.toLowerCase()) {
      case 'fajr':
        return 'സുബ്ഹി';
      case 'sunrise':
        return 'സൂര്യോദയം';
      case 'dhuhr':
        return 'ളുഹ്ർ';
      case 'asr':
        return 'അസ്വർ';
      case 'maghrib':
        return 'മഗ്‌രിബ്';
      case 'isha':
        return 'ഇശാ';
      default:
        return prayer;
    }
  };

  const formattedTimeStr = prayerData.nextPrayerTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.indicatorRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusLabel}>NEXT PRAYER • അടുത്ത നമസ്കാരം</Text>
        </View>
        <View style={styles.shafiBadge}>
          <Text style={styles.shafiText}>Shafi'i (ശാഫിഈ)</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.prayerName}>{prayerData.nextPrayer}</Text>
          <Text style={styles.prayerNameMl}>
            {getMalayalamPrayerName(prayerData.nextPrayer)}
          </Text>
        </View>

        <View style={styles.timeBlock}>
          <Ionicons name="time-outline" size={18} color={colors.emeraldLight} style={{ marginRight: 4 }} />
          <Text style={styles.prayerTime}>{formattedTimeStr}</Text>
        </View>
      </View>

      <View style={styles.countdownContainer}>
        <Text style={styles.countdownCaption}>Starts in</Text>
        <Text style={styles.countdownTimer}>{formatCountdown(secondsLeft)}</Text>
      </View>

      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          Current: {prayerData.currentPrayer} ({getMalayalamPrayerName(prayerData.currentPrayer)})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.emeraldDark,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    ...shadows.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: spacing.xs,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86efac',
    letterSpacing: 0.5,
  },
  shafiBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  shafiText: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  prayerName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  prayerNameMl: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a7f3d0',
    marginTop: 2,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  countdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countdownCaption: {
    fontSize: 13,
    color: '#d1fae5',
    fontWeight: '500',
  },
  countdownTimer: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fef08a', // Goldish for high legibility
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  footerNote: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '500',
  },
});
