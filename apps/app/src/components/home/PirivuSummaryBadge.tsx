import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { FamilyPirivuStatus } from '@maheall/shared';

export interface PirivuSummaryBadgeProps {
  status: FamilyPirivuStatus | null;
  onPress: () => void;
}

export function PirivuSummaryBadge({ status, onPress }: PirivuSummaryBadgeProps) {
  if (!status) return null;

  const unpaidCount = status.unpaid_months_count;
  const isUpToDate = unpaidCount === 0;
  const monthlyQuota = parseFloat(status.pirivu_amount || '200');
  const totalOverdue = unpaidCount * monthlyQuota;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isUpToDate ? styles.containerUpToDate : styles.containerOverdue,
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconContainer,
            isUpToDate ? styles.iconUpToDate : styles.iconOverdue,
          ]}
        >
          <Ionicons
            name={isUpToDate ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={isUpToDate ? colors.paid : colors.unpaid}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.statusTitleRow}>
            <Text
              style={[
                styles.statusTitle,
                isUpToDate ? styles.titleUpToDate : styles.titleOverdue,
              ]}
            >
              {isUpToDate
                ? 'Pirivu Dues Up To Date'
                : `${unpaidCount} Month${unpaidCount > 1 ? 's' : ''} Overdue (₹${totalOverdue})`}
            </Text>
          </View>
          <Text style={styles.statusSubtitle}>
            {isUpToDate
              ? 'മാസവരി കുടിശ്ശികയില്ല • All contributions recorded'
              : 'മാസവരി അടയ്ക്കാൻ ബാക്കിയുണ്ട് • Tap to view & pay'}
          </Text>
        </View>
      </View>

      <View style={styles.rightAction}>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isUpToDate ? colors.paid : colors.unpaid}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  containerUpToDate: {
    backgroundColor: colors.paidBg,
    borderColor: colors.paidBorder,
  },
  containerOverdue: {
    backgroundColor: colors.unpaidBg,
    borderColor: colors.unpaidBorder,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconUpToDate: {
    backgroundColor: '#dcfce7',
  },
  iconOverdue: {
    backgroundColor: '#fee2e2',
  },
  textContainer: {
    flex: 1,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleUpToDate: {
    color: '#15803d',
  },
  titleOverdue: {
    color: '#b91c1c',
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: spacing.sm,
  },
});
