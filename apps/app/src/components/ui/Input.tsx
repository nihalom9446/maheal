import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  labelMl?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  labelMl,
  error,
  prefix,
  suffix,
  containerStyle,
  inputStyle,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {labelMl ? <Text style={styles.labelMl}>({labelMl})</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          props.editable === false ? styles.inputDisabled : null,
        ]}
      >
        {prefix ? <View style={styles.prefixContainer}>{prefix}</View> : null}

        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, inputStyle]}
          {...props}
        />

        {suffix ? <View style={styles.suffixContainer}>{suffix}</View> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs + 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  inputError: {
    borderColor: colors.unpaid,
    backgroundColor: colors.unpaidBg,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  prefixContainer: {
    marginRight: spacing.sm,
  },
  suffixContainer: {
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.unpaid,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
