import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Button } from '../ui/Button';
import { FamilyPirivuStatus } from '@maheall/shared';

export interface ArrearsSummaryCardProps {
  status: FamilyPirivuStatus | null;
  onPayNow: () => void;
}

export function ArrearsSummaryCard({ status, onPayNow }: ArrearsSummaryCardProps) {
  if (!status) return null;

  const unpaidCount = status.unpaid_months_count;
  const monthlyRate = parseFloat(status.pirivu_amount || '200');
  const totalOverdue = unpaidCount * monthlyRate;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Pirivu Financial Summary</Text>
          <Text style={styles.subtitle}>
            Family #{status.family_number} • {status.house_name} ({status.house_name_ml || ''})
          </Text>
        </View>
        <View style={styles.yearPill}>
          <Text style={styles.yearText}>{status.year}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsContainer}>
        {/* Total Paid */}
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Paid (അടച്ചത്)</Text>
          <Text style={styles.metricValuePaid}>₹{status.total_paid_year}</Text>
          <Text style={styles.metricSub}>
            {status.monthly_status.filter((m) => m.status === 'PAID').length} of 12 months
          </Text>
        </View>

        <View style={styles.metricDivider} />

        {/* Total Overdue */}
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Overdue (കുടിശ്ശിക)</Text>
          <Text
            style={[
              styles.metricValueOverdue,
              unpaidCount === 0 ? styles.metricValueClear : null,
            ]}
          >
            ₹{totalOverdue}
          </Text>
          <Text style={styles.metricSub}>
            {unpaidCount === 0 ? 'No pending dues' : `${unpaidCount} month(s) pending`}
          </Text>
        </View>
      </View>

      {/* Monthly Rate Info */}
      <View style={styles.rateInfoRow}>
        <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.rateInfoText}>
          Monthly Quota (നിശ്ചിത മാസവരി): <Text style={styles.rateBold}>₹{monthlyRate}/month</Text>
        </Text>
      </View>

      {/* Pay CTA */}
      <Button
        title={unpaidCount > 0 ? `Pay Overdue Dues (₹${totalOverdue})` : 'Make Advance Contribution'}
        onPress={onPayNow}
        variant={unpaidCount > 0 ? 'primary' : 'secondary'}
        icon={<Ionicons name="card-outline" size={18} color={unpaidCount > 0 ? '#ffffff' : colors.primaryDark} />}
        style={{ marginTop: spacing.md }}
      />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  yearPill: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValuePaid: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.paid,
    fontVariant: ['tabular-nums'],
  },
  metricValueOverdue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.unpaid,
    fontVariant: ['tabular-nums'],
  },
  metricValueClear: {
    color: colors.paid,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  rateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  rateInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  rateBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
