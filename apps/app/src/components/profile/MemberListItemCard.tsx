import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { FamilyMember } from '@maheall/shared';

export interface MemberListItemCardProps {
  member: FamilyMember;
}

const RELATIONSHIP_LABELS_ML: Record<string, string> = {
  HEAD: 'ഗൃഹനാഥൻ (Head)',
  SPOUSE: 'ഭാര്യ / ഭർത്താവ് (Spouse)',
  SON: 'മകൻ (Son)',
  DAUGHTER: 'മകൾ (Daughter)',
  FATHER: 'പിതാവ് (Father)',
  MOTHER: 'മാതാവ് (Mother)',
  SIBLING: 'സഹോദരൻ / സഹോദരി',
  OTHER: 'മറ്റുള്ളവർ',
};

export function MemberListItemCard({ member }: MemberListItemCardProps) {
  const isHead = member.relationship_to_head === 'HEAD';
  const relLabel = member.relationship_to_head
    ? RELATIONSHIP_LABELS_ML[member.relationship_to_head] || member.relationship_to_head
    : 'Member';

  return (
    <View style={[styles.card, isHead ? styles.headCard : null]}>
      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge
            label={relLabel}
            variant={isHead ? 'primary' : 'neutral'}
            size="sm"
          />

          {member.blood_group ? (
            <Badge
              label={member.blood_group}
              variant="blood"
              size="sm"
              style={{ marginLeft: spacing.xs }}
            />
          ) : null}

          {member.is_nri ? (
            <Badge
              label={member.nri_country ? `NRI (${member.nri_country})` : 'NRI'}
              variant="nri"
              size="sm"
              style={{ marginLeft: spacing.xs }}
            />
          ) : null}
        </View>
      </View>

      {/* Member Name */}
      <View style={styles.nameRow}>
        <View style={styles.avatarMini}>
          <Ionicons
            name={member.gender === 'F' ? 'person' : 'person'}
            size={18}
            color={isHead ? colors.primaryDark : colors.textSecondary}
          />
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.nameEn}>{member.name}</Text>
          {member.name_ml ? <Text style={styles.nameMl}>{member.name_ml}</Text> : null}
        </View>
      </View>

      {/* Contact & Occupation Details */}
      <View style={styles.detailsRow}>
        {member.phone ? (
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.detailText}>{member.phone}</Text>
          </View>
        ) : null}

        {member.occupation ? (
          <View style={styles.detailItem}>
            <Ionicons name="briefcase-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {member.occupation}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headCard: {
    borderColor: colors.primaryLight,
    backgroundColor: '#fbfdfb',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nameBlock: {
    flex: 1,
  },
  nameEn: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nameMl: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
