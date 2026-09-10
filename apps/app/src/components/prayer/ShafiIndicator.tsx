import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export function ShafiIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={18} color={colors.primaryDark} style={{ marginRight: 6 }} />
        <Text style={styles.title}>Shafi'i Madhab Standard • ശാഫിഈ മദ്ഹബ്</Text>
      </View>

      <Text style={styles.description}>
        All prayer timings follow orthodox Shafi'i fiqh astronomical rules verified for Kerala:
      </Text>

      <View style={styles.bulletList}>
        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            <Text style={styles.bulletBold}>Asr:</Text> Shadow length equals object height plus solar noon shadow (1x shadow ratio).
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            <Text style={styles.bulletBold}>Fajr & Isha:</Text> 18° astronomical twilight angle (Egyptian General Authority of Survey & MWL).
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>
            <Text style={styles.bulletBold}>Jumu'ah:</Text> Congregational prayer conducted at 01:00 PM / 01:15 PM per Mahal custom.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  bulletList: {
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  bulletBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
