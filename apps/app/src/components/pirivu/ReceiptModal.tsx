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
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FamilyPirivuMonthStatus } from '@maheall/shared';
import { MahalInfo } from '../../lib/storage';

export interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  item: FamilyPirivuMonthStatus | null;
  familyHouseName?: string;
  familyHouseNameMl?: string | null;
  familyNumber?: number;
  wardName?: string | null;
  headName?: string | null;
  mahalInfo?: MahalInfo | null;
}

export function ReceiptModal({
  visible,
  onClose,
  item,
  familyHouseName = 'Baitul Noor',
  familyHouseNameMl = 'ബൈത്തുൽ നൂർ',
  familyNumber = 142,
  wardName = 'Ward 4 - Darussalam',
  headName = 'Mohammed Ali K.',
  mahalInfo,
}: ReceiptModalProps) {
  if (!item) return null;

  const receiptNo = item.receipt_number || `REC-2026-${String(familyNumber).padStart(4, '0')}`;
  const amount = item.amount_paid || '200.00';
  const paymentMethod = item.payment_method || 'UPI';
  const paymentDate = item.paid_date ? String(item.paid_date) : '2026-05-02';

  const handleShareWhatsApp = async () => {
    const text = `*MAHAL PIRIVU DIGITAL RECEIPT / മഹല്ല് മാസവരി രസീത്*
----------------------------------------
*Receipt No:* ${receiptNo}
*Mahal:* ${mahalInfo?.name || 'Noor Juma Masjid Mahal'}
*Family No:* #${familyNumber}
*House:* ${familyHouseName} (${familyHouseNameMl || ''})
*Head of Family:* ${headName}
*Ward:* ${wardName}
----------------------------------------
*Month Covered:* ${item.month_name} 2026
*Amount Paid:* ₹${amount}
*Payment Method:* ${paymentMethod}
*Payment Date:* ${paymentDate}
*Status:* VERIFIED & RECORDED ✓
----------------------------------------
_Generated via MAHEALL Mahal Community OS_`;

    try {
      await Share.share({
        message: text,
        title: `Pirivu Receipt ${receiptNo}`,
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
      title="Official Digital Receipt"
      titleMl="ഡിജിറ്റൽ മാസവരി രസീത്"
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
            title="Done"
            onPress={onClose}
            variant="outline"
            style={{ flex: 0.5 }}
          />
        </View>
      }
    >
      <View style={styles.receiptCard}>
        {/* Mahal Header Seal */}
        <View style={styles.sealHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-done" size={24} color={colors.paid} />
          </View>
          <Text style={styles.mahalName}>{mahalInfo?.name || 'Noor Juma Masjid Mahal'}</Text>
          <Text style={styles.mahalNameMl}>{mahalInfo?.name_ml || 'നൂർ ജുമാ മസ്ജിദ് മഹല്ല്'}</Text>
          <Text style={styles.regNo}>
            Reg No: {mahalInfo?.registration_number || 'WK-KL-2024-8891'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Receipt Meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>RECEIPT NO / രസീത് നമ്പർ</Text>
            <Text style={styles.receiptNumber}>{receiptNo}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>DATE / തീയതി</Text>
            <Text style={styles.metaValue}>{paymentDate}</Text>
          </View>
        </View>

        {/* Household Info */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Family # / കുടുംബ നമ്പർ:</Text>
            <Text style={styles.detailValue}>#{familyNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>House / വീട്ടുപേര്:</Text>
            <Text style={styles.detailValue}>
              {familyHouseName} {familyHouseNameMl ? `(${familyHouseNameMl})` : ''}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Head of Family:</Text>
            <Text style={styles.detailValue}>{headName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ward / വാർഡ്:</Text>
            <Text style={styles.detailValue}>{wardName}</Text>
          </View>
        </View>

        {/* Payment Line Items */}
        <View style={styles.amountBox}>
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.monthCoveredLabel}>
                Mahal Pirivu - {item.month_name} 2026
              </Text>
              <Text style={styles.monthCoveredSub}>മാസവരി വിഹിതം</Text>
            </View>
            <Text style={styles.amountBig}>₹{amount}</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <Text style={styles.methodLabel}>Payment Mode:</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodBadgeText}>{paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Verified Footer */}
        <View style={styles.verifiedFooter}>
          <Ionicons name="shield-checkmark" size={16} color={colors.paid} />
          <Text style={styles.verifiedText}>
            Digitally generated and verified by Mahal Committee
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sealHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.paidBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  mahalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mahalNameMl: {
    fontSize: 13,
    color: colors.primaryDark,
    marginTop: 1,
  },
  regNo: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  receiptNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  amountBox: {
    backgroundColor: colors.paidBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderColor: colors.paidBorder,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  monthCoveredLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  monthCoveredSub: {
    fontSize: 11,
    color: colors.emerald,
  },
  amountBig: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.paid,
    fontVariant: ['tabular-nums'],
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.paidBorder,
    paddingTop: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  methodLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  methodBadge: {
    backgroundColor: colors.paid,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.paid,
    fontWeight: '500',
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
