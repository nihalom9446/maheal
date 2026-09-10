import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { AnnouncementListItem } from '@maheall/shared';
import { formatRelativeTime } from '../../lib/date-utils';

export interface AnnouncementCardProps {
  item: AnnouncementListItem;
  onPress: () => void;
}

export function AnnouncementCard({ item, onPress }: AnnouncementCardProps) {
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'JANAZAH':
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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Badge
          label={item.category}
          variant={getBadgeVariant(item.category) as any}
          size="sm"
        />
        <Text style={styles.dateText}>
          {formatRelativeTime(item.published_at || item.created_at)}
        </Text>
      </View>

      <Text style={styles.titleEn} numberOfLines={2}>
        {item.title}
      </Text>

      {item.title_ml ? (
        <Text style={styles.titleMl} numberOfLines={2}>
          {item.title_ml}
        </Text>
      ) : null}

      {item.content ? (
        <Text style={styles.content} numberOfLines={3}>
          {item.content}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read Full Notice (വിശദാംശങ്ങൾ)</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>

        {item.attachment_keys && item.attachment_keys.length > 0 ? (
          <View style={styles.attachmentBadge}>
            <Ionicons name="attach-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.attachmentText}>Attachment</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  topRow: {
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  titleMl: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  content: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: spacing.xs + 2,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  attachmentText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});
