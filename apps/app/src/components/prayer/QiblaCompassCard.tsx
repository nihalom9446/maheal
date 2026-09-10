import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { getQiblaDirection, DEFAULT_COORDINATES } from '../../lib/prayer-calculator';

export interface QiblaCompassCardProps {
  latitude?: number;
  longitude?: number;
}

export function QiblaCompassCard({ latitude, longitude }: QiblaCompassCardProps) {
  const coords =
    latitude && longitude ? { latitude, longitude } : DEFAULT_COORDINATES;

  const qibla = getQiblaDirection(coords);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="compass-outline" size={20} color={colors.emerald} style={{ marginRight: 6 }} />
          <Text style={styles.title}>Qibla Direction</Text>
        </View>
        <Text style={styles.titleMl}>ഖിബ്‌ല ദിശ (കഅ്ബ)</Text>
      </View>

      <View style={styles.contentRow}>
        {/* Compass Dial Simulation Visual */}
        <View style={styles.compassDial}>
          <View style={styles.northMarker}>
            <Text style={styles.northText}>N</Text>
          </View>
          <View style={styles.eastMarker}>
            <Text style={styles.cardinalText}>E</Text>
          </View>
          <View style={styles.southMarker}>
            <Text style={styles.cardinalText}>S</Text>
          </View>
          <View style={styles.westMarker}>
            <Text style={styles.cardinalText}>W</Text>
          </View>

          {/* Qibla Needle Pointing 292 degrees */}
          <View style={[styles.needleContainer, { transform: [{ rotate: `${qibla.degrees}deg` }] }]}>
            <View style={styles.needlePointer}>
              <Ionicons name="navigate" size={28} color={colors.emerald} />
            </View>
          </View>

          <View style={styles.centerDot} />
        </View>

        {/* Qibla Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.degreeBox}>
            <Text style={styles.degreeValue}>{qibla.degrees}°</Text>
            <Text style={styles.degreeUnit}>from True North</Text>
          </View>

          <Text style={styles.cardinalValue}>{qibla.cardinal}</Text>

          <View style={styles.infoBadge}>
            <Ionicons name="location-outline" size={14} color={colors.emeraldDark} />
            <Text style={styles.infoBadgeText}>Kerala standard: ~292° WNW</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          Face 68° north of west towards the Holy Ka'bah in Makkah al-Mukarramah.
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
  titleRow: {
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
    marginLeft: 26,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  compassDial: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 2,
    borderColor: colors.emeraldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  northMarker: {
    position: 'absolute',
    top: 4,
  },
  northText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.urgent,
  },
  eastMarker: {
    position: 'absolute',
    right: 6,
  },
  southMarker: {
    position: 'absolute',
    bottom: 4,
  },
  westMarker: {
    position: 'absolute',
    left: 6,
  },
  cardinalText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  needleContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'absolute',
  },
  needlePointer: {
    transform: [{ translateY: -2 }],
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emeraldDark,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  degreeBox: {
    marginBottom: spacing.xs,
  },
  degreeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.emeraldDark,
    fontVariant: ['tabular-nums'],
  },
  degreeUnit: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardinalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.emeraldDark,
    marginLeft: 4,
  },
  footerNote: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
