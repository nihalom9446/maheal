import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { AnnouncementListItem } from '@maheall/shared';
import { formatRelativeTime } from '../../lib/date-utils';

export interface RecentAnnouncementsFeedProps {
  announcements: AnnouncementListItem[];
  onSelect: (item: AnnouncementListItem) => void;
  onViewAll: () => void;
}

export function RecentAnnouncementsFeed({
  announcements,
  onSelect,
  onViewAll,
}: RecentAnnouncementsFeedProps) {
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'JANAZAH':
        return 'urgent';
      case 'EMERGENCY':
        return 'urgent';
      case 'MADRASA':
        return 'info';
      case 'FINANCE':
        return 'warning';
      case 'GENERAL':
      default:
        return 'primary';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Mahal Announcements</Text>
          <Text style={styles.sectionTitleMl}>മഹല്ല് അറിയിപ്പുകൾ</Text>
        </View>

        <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>No recent announcements</Text>
        </View>
      ) : (
        announcements.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => onSelect(item)}
            style={styles.itemCard}
          >
            <View style={styles.itemHeader}>
              <Badge
                label={item.category}
                variant={getBadgeVariant(item.category) as any}
                size="sm"
              />
              <Text style={styles.dateText}>
                {formatRelativeTime(item.published_at || item.created_at)}
              </Text>
            </View>

            <Text style={styles.titleEn} numberOfLines={1}>
              {item.title}
            </Text>

            {item.title_ml ? (
              <Text style={styles.titleMl} numberOfLines={1}>
                {item.title_ml}
              </Text>
            ) : null}

            {item.content ? (
              <Text style={styles.snippet} numberOfLines={2}>
                {item.content}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitleMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  titleEn: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  titleMl: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  snippet: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
