import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { DeathRecordListItem } from '@maheall/shared';

export interface UrgentBannerProps {
  janazah?: DeathRecordListItem | null;
  onPress: () => void;
}

export function UrgentBanner({ janazah, onPress }: UrgentBannerProps) {
  if (!janazah) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.topHeader}>
        <View style={styles.tag}>
          <Ionicons name="notifications" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.tagText}>JANAZAH NOTICE • വഫാത്ത് അറിയിപ്പ്</Text>
        </View>
        <Text style={styles.arabicHeader}>إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.nameText}>
          {janazah.name}
          {janazah.name_ml ? ` (${janazah.name_ml})` : ''}
        </Text>

        <Text style={styles.detailsText} numberOfLines={2}>
          {janazah.family_house_name ? `House: ${janazah.family_house_name} • ` : ''}
          {janazah.prayer_location
            ? `Janazah Prayer: ${janazah.prayer_location}`
            : 'Janazah prayer time announced'}
          {janazah.prayer_time ? ` at ${new Date(janazah.prayer_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
        </Text>
      </View>

      <View style={styles.tapRow}>
        <Text style={styles.tapText}>Tap for full obituary & WhatsApp share</Text>
        <Ionicons name="arrow-forward" size={14} color="#fca5a5" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#991b1b', // Deep urgent red
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arabicHeader: {
    color: '#fed7aa',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    marginVertical: spacing.xs,
  },
  nameText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsText: {
    color: '#fee2e2',
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  tapText: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '600',
  },
});
