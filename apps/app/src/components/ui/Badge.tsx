import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export interface BadgeProps {
  label: string;
  variant?:
    | 'paid'
    | 'unpaid'
    | 'urgent'
    | 'warning'
    | 'info'
    | 'neutral'
    | 'primary'
    | 'blood'
    | 'nri';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const getColors = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'paid':
        return { bg: colors.paidBg, text: colors.paid, border: colors.paidBorder };
      case 'unpaid':
        return { bg: colors.unpaidBg, text: colors.unpaid, border: colors.unpaidBorder };
      case 'urgent':
        return { bg: colors.urgentBg, text: colors.urgent, border: colors.urgentBorder };
      case 'warning':
        return { bg: colors.warningBg, text: colors.goldDark, border: colors.warningBorder };
      case 'info':
        return { bg: colors.infoBg, text: colors.info, border: colors.infoBorder };
      case 'primary':
        return { bg: colors.primaryMuted, text: colors.primaryDark, border: colors.primaryLight };
      case 'blood':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'nri':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'neutral':
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, border: colors.border };
    }
  };

  const scheme = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border || 'transparent',
          borderWidth: scheme.border ? 1 : 0,
          paddingVertical: isSm ? 2 : spacing.xs,
          paddingHorizontal: isSm ? spacing.xs + 2 : spacing.sm + 2,
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: scheme.text,
            fontSize: isSm ? 10 : 12,
            lineHeight: isSm ? 13 : 16,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: '600',
  },
});
