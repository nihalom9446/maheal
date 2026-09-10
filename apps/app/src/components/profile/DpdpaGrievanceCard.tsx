import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { MahalInfo } from '../../lib/storage';

export interface DpdpaGrievanceCardProps {
  mahalInfo?: MahalInfo | null;
}

export function DpdpaGrievanceCard({ mahalInfo }: DpdpaGrievanceCardProps) {
  const secretaryName = mahalInfo?.secretary_name || 'P. A. Abdul Rahman Moulavi';
  const secretaryPhone = mahalInfo?.secretary_phone || '+919847000111';
  const secretaryEmail = mahalInfo?.secretary_email || 'secretary@noorjuma.maheall.org';

  const handleCall = () => {
    Linking.openURL(`tel:${secretaryPhone}`).catch(() => {});
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${secretaryEmail}?subject=Mahal%20Data%20Grievance`).catch(() => {});
  };

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} style={{ marginRight: 6 }} />
        <View>
          <Text style={styles.title}>Privacy & DPDPA Compliance</Text>
          <Text style={styles.titleMl}>വ്യക്തിവിവര സംരക്ഷണവും പരാതി പരിഹാരവും</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Your family and financial records are strictly protected under the Digital Personal Data Protection Act (DPDPA 2023) and are accessible only to verified Mahal Committee administrators for community welfare and spiritual services.
      </Text>

      <View style={styles.divider} />

      {/* Grievance Officer Details */}
      <Text style={styles.officerHeader}>Mahal Grievance Redressal Officer:</Text>

      <View style={styles.officerBox}>
        <Text style={styles.officerName}>{secretaryName}</Text>
        <Text style={styles.officerRole}>General Secretary, {mahalInfo?.name || 'Mahal Committee'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={14} color={colors.primary} />
            <Text style={styles.actionText}>{secretaryPhone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={14} color={colors.primary} />
            <Text style={styles.actionText}>Email Officer</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
    marginVertical: spacing.md,
  },
  officerHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  officerBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  officerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  officerRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
