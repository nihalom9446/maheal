import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function LogoutModal({
  visible,
  onClose,
  onConfirm,
  loading = false,
}: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Confirm Logout"
      titleMl="ലോഗ് ഔട്ട് ചെയ്യുക"
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Yes, Log Out"
            onPress={onConfirm}
            variant="danger"
            loading={loading}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            disabled={loading}
            style={{ flex: 0.8 }}
          />
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="log-out-outline" size={32} color={colors.urgent} />
        </View>

        <Text style={styles.message}>
          Are you sure you want to sign out from MAHEALL Member App?
        </Text>
        <Text style={styles.messageMl}>
          മഹല്ല് മെമ്പർ ആപ്പിൽ നിന്നും ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  messageMl: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
