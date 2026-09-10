import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { FamilyPirivuMonthStatus } from '@maheall/shared';

export interface MonthStatusGridProps {
  monthlyStatus: FamilyPirivuMonthStatus[];
  onSelectPaidMonth: (month: FamilyPirivuMonthStatus) => void;
  onSelectUnpaidMonth: (month: FamilyPirivuMonthStatus) => void;
}

const MONTH_NAMES_ML: Record<string, string> = {
  January: 'ജനുവരി',
  February: 'ഫെബ്രുവരി',
  March: 'മാർച്ച്',
  April: 'ഏപ്രിൽ',
  May: 'മെയ്',
  June: 'ജൂൺ',
  July: 'ജൂലൈ',
  August: 'ആഗസ്റ്റ്',
  September: 'സെപ്റ്റംബർ',
  October: 'ഒക്ടോബർ',
  November: 'നവംബർ',
  December: 'ഡിസംബർ',
};

export function MonthStatusGrid({
  monthlyStatus,
  onSelectPaidMonth,
  onSelectUnpaidMonth,
}: MonthStatusGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>12-Month Collection Grid</Text>
        <Text style={styles.subtitle}>
          12 മാസത്തെ മാസവരി വിവരങ്ങൾ • Tap any month for receipt / payment
        </Text>
      </View>

      <View style={styles.grid}>
        {monthlyStatus.map((item, index) => {
          const isPaid = item.status === 'PAID';
          const monthMl = MONTH_NAMES_ML[item.month_name] || item.month_name;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => (isPaid ? onSelectPaidMonth(item) : onSelectUnpaidMonth(item))}
              style={[
                styles.tile,
                isPaid ? styles.paidTile : styles.unpaidTile,
              ]}
            >
              {/* Status Icon */}
              <View
                style={[
                  styles.iconCircle,
                  isPaid ? styles.paidCircle : styles.unpaidCircle,
                ]}
              >
                <Ionicons
                  name={isPaid ? 'checkmark' : 'alert'}
                  size={14}
                  color={isPaid ? '#ffffff' : '#ffffff'}
                />
              </View>

              {/* Month Name */}
              <Text
                style={[
                  styles.monthText,
                  isPaid ? styles.paidMonthText : styles.unpaidMonthText,
                ]}
                numberOfLines={1}
              >
                {item.month_name.slice(0, 3)}
              </Text>
              <Text
                style={[
                  styles.monthMlText,
                  isPaid ? styles.paidMonthMlText : styles.unpaidMonthMlText,
                ]}
                numberOfLines={1}
              >
                {monthMl}
              </Text>

              {/* Status Badge text */}
              <View style={styles.statusRow}>
                {isPaid ? (
                  <Text style={styles.paidAmountText}>₹{item.amount_paid || '200'}</Text>
                ) : (
                  <Text style={styles.unpaidLabelText}>UNPAID</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%', // 3 columns
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
    borderWidth: 1.5,
  },
  paidTile: {
    backgroundColor: colors.paidBg,
    borderColor: colors.paidBorder,
  },
  unpaidTile: {
    backgroundColor: colors.unpaidBg,
    borderColor: colors.unpaidBorder,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  paidCircle: {
    backgroundColor: colors.paid,
  },
  unpaidCircle: {
    backgroundColor: colors.unpaid,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paidMonthText: {
    color: '#15803d',
  },
  unpaidMonthText: {
    color: '#b91c1c',
  },
  monthMlText: {
    fontSize: 11,
    marginBottom: 4,
  },
  paidMonthMlText: {
    color: '#16a34a',
  },
  unpaidMonthMlText: {
    color: '#dc2626',
  },
  statusRow: {
    marginTop: 2,
  },
  paidAmountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  unpaidLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b91c1c',
    letterSpacing: 0.5,
  },
});
