import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MahalInfo } from '../../lib/storage';

export interface PaymentInstructionModalProps {
  visible: boolean;
  onClose: () => void;
  unpaidAmount?: number;
  familyNumber?: number;
  mahalInfo?: MahalInfo | null;
}

export function PaymentInstructionModal({
  visible,
  onClose,
  unpaidAmount = 200,
  familyNumber = 142,
  mahalInfo,
}: PaymentInstructionModalProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const upiId = 'mahal.treasury@upi';

  const handleCopyUpi = () => {
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleOpenUpiApp = () => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      mahalInfo?.name || 'Mahal Committee',
    )}&am=${unpaidAmount}&cu=INR&tn=Family%20${familyNumber}%20Pirivu`;
    Linking.openURL(upiUrl).catch(() => {
      // If UPI app is not available on device/emulator
    });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Payment Instructions"
      titleMl="മാസവരി അടയ്ക്കേണ്ട രീതികൾ"
      footer={
        <Button
          title="Done / അടച്ചു കഴിഞ്ഞു"
          onPress={onClose}
          variant="primary"
        />
      }
    >
      <View style={styles.container}>
        {/* Amount Due Banner */}
        <View style={styles.dueBanner}>
          <Text style={styles.dueLabel}>Total Pending Amount / അടയ്ക്കാനുള്ള തുക</Text>
          <Text style={styles.dueAmount}>₹{unpaidAmount}</Text>
          <Text style={styles.dueSub}>For Family #{familyNumber}</Text>
        </View>

        {/* Option 1: UPI Transfer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Pay via UPI (GPay / PhonePe / Paytm)</Text>
          </View>

          <View style={styles.upiBox}>
            <View style={styles.upiIdRow}>
              <View>
                <Text style={styles.upiLabel}>Official Mahal UPI ID</Text>
                <Text style={styles.upiValue}>{upiId}</Text>
              </View>

              <TouchableOpacity
                onPress={handleCopyUpi}
                style={styles.copyBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copiedUpi ? 'checkmark-done' : 'copy-outline'}
                  size={16}
                  color={copiedUpi ? colors.paid : colors.primary}
                />
                <Text
                  style={[
                    styles.copyBtnText,
                    copiedUpi ? { color: colors.paid } : null,
                  ]}
                >
                  {copiedUpi ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Open UPI App to Pay"
              onPress={handleOpenUpiApp}
              variant="emerald"
              size="sm"
              icon={<Ionicons name="flash-outline" size={16} color="#ffffff" />}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>

        {/* Option 2: Bank NEFT / IMPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>Direct Bank Account Transfer</Text>
          </View>

          <View style={styles.bankBox}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>State Bank of India</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Name:</Text>
              <Text style={styles.bankValue}>{mahalInfo?.name || 'Mahal Committee'}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account No:</Text>
              <Text style={styles.bankValue}>389201099238</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>IFSC Code:</Text>
              <Text style={styles.bankValue}>SBIN0008472</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>Civil Station, Kozhikode</Text>
            </View>
          </View>
        </View>

        {/* Option 3: Cash to Office */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>3</Text>
            </View>
            <Text style={styles.sectionTitle}>Cash Payment at Mahal Office</Text>
          </View>

          <View style={styles.cashBox}>
            <Text style={styles.cashText}>
              Pay in cash directly to the Treasurer or Ward Convener during office hours:
            </Text>
            <Text style={styles.cashHours}>
              • Morning: 08:30 AM - 12:30 PM{'\n'}• Evening: 04:30 PM - 08:00 PM
            </Text>
            <Text style={styles.cashNote}>
              Instant digital receipt will be sent to your mobile number upon payment.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  dueBanner: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  dueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  dueAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  dueSub: {
    fontSize: 11,
    color: colors.emerald,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  optionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  optionNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  upiBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upiIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  upiValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  bankBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bankLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  cashBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cashText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  cashHours: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.emeraldDark,
    marginVertical: spacing.xs,
    lineHeight: 18,
  },
  cashNote: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
