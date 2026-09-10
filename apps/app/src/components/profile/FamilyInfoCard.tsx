import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Badge } from '../ui/Badge';
import { FamilyDetail } from '@maheall/shared';

export interface FamilyInfoCardProps {
  family: FamilyDetail | null;
}

export function FamilyInfoCard({ family }: FamilyInfoCardProps) {
  if (!family) return null;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>FAMILY #{family.family_number}</Text>
        </View>

        {family.is_nri_household ? (
          <Badge label="NRI Household (പ്രവാസി കുടുംബം)" variant="nri" size="sm" />
        ) : (
          <Badge label="Active Member" variant="paid" size="sm" />
        )}
      </View>

      {/* House Name */}
      <Text style={styles.houseNameEn}>{family.house_name}</Text>
      {family.house_name_ml ? (
        <Text style={styles.houseNameMl}>{family.house_name_ml}</Text>
      ) : null}

      <View style={styles.divider} />

      {/* Grid of info items */}
      <View style={styles.infoGrid}>
        {/* Ward */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="map-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Ward / വാർഡ്</Text>
            <Text style={styles.infoValue}>
              {family.ward?.name || 'Ward 4 - Darussalam'}
            </Text>
            {family.ward?.name_ml ? (
              <Text style={styles.infoSub}>{family.ward.name_ml}</Text>
            ) : null}
          </View>
        </View>

        {/* Door Number */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="home-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Door No / വീട്ടു നമ്പർ</Text>
            <Text style={styles.infoValue}>{family.door_number || '14/320-A'}</Text>
          </View>
        </View>

        {/* Monthly Pirivu */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Monthly Pirivu / മാസവരി</Text>
            <Text style={styles.infoValue}>₹{family.pirivu_amount}/month</Text>
          </View>
        </View>

        {/* Total Registered Members */}
        <View style={styles.infoItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Registered Members</Text>
            <Text style={styles.infoValue}>
              {family.members?.length || 0} Members (അംഗങ്ങൾ)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  numberBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  houseNameEn: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  houseNameMl: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
    marginVertical: spacing.md,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  infoSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});
