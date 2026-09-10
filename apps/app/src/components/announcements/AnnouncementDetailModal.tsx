import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AnnouncementListItem } from '@maheall/shared';
import { formatRelativeTime } from '../../lib/date-utils';

export interface AnnouncementDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: AnnouncementListItem | null;
}

export function AnnouncementDetailModal({
  visible,
  onClose,
  item,
}: AnnouncementDetailModalProps) {
  if (!item) return null;

  const handleShareWhatsApp = async () => {
    const text = `*${item.title}*
${item.title_ml ? `*${item.title_ml}*\n` : ''}
${item.content || ''}
${item.content_ml ? `\n${item.content_ml}\n` : ''}
----------------------------------------
_Category: ${item.category}_
_Published by Mahal Committee via MAHEALL_`;

    try {
      await Share.share({
        message: text,
        title: item.title,
      });
    } catch {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Mahal Notice"
      titleMl="മഹല്ല് അറിയിപ്പ്"
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Share via WhatsApp"
            onPress={handleShareWhatsApp}
            variant="emerald"
            icon={<Ionicons name="logo-whatsapp" size={18} color="#ffffff" />}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Button
            title="Close"
            onPress={onClose}
            variant="outline"
            style={{ flex: 0.4 }}
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Category & Date Header */}
        <View style={styles.metaRow}>
          <Badge label={item.category} variant="primary" />
          <Text style={styles.dateText}>
            {formatRelativeTime(item.published_at || item.created_at)}
          </Text>
        </View>

        {/* Titles */}
        <Text style={styles.titleEn}>{item.title}</Text>
        {item.title_ml ? <Text style={styles.titleMl}>{item.title_ml}</Text> : null}

        <View style={styles.divider} />

        {/* Content Body in English & Malayalam */}
        {item.content ? (
          <View style={styles.section}>
            <Text style={styles.contentEn}>{item.content}</Text>
          </View>
        ) : null}

        {item.content_ml ? (
          <View style={styles.sectionMl}>
            <Text style={styles.sectionMlHeader}>മലയാളം വിവരണം:</Text>
            <Text style={styles.contentMl}>{item.content_ml}</Text>
          </View>
        ) : null}

        {/* Mahal Office Seal Footer */}
        <View style={styles.sealBox}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text style={styles.sealText}>
            Officially issued by Mahal Committee & Secretary Office
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  titleEn: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  titleMl: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  contentEn: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  sectionMl: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionMlHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contentMl: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  sealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  sealText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
