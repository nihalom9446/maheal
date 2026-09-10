import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
    };

    // Size
    if (size === 'sm') {
      base.paddingVertical = spacing.xs + 2;
      base.paddingHorizontal = spacing.md;
    } else if (size === 'lg') {
      base.paddingVertical = spacing.base;
      base.paddingHorizontal = spacing.xl;
    } else {
      base.paddingVertical = spacing.md;
      base.paddingHorizontal = spacing.lg;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = disabled ? colors.borderDark : colors.primary;
        break;
      case 'emerald':
        base.backgroundColor = disabled ? colors.borderDark : colors.emerald;
        break;
      case 'secondary':
        base.backgroundColor = disabled ? colors.surfaceSubtle : colors.emeraldMuted;
        break;
      case 'danger':
        base.backgroundColor = disabled ? colors.borderDark : colors.urgent;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = disabled ? colors.borderDark : colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    if (size === 'sm') base.fontSize = 13;
    else if (size === 'lg') base.fontSize = 17;
    else base.fontSize = 15;

    switch (variant) {
      case 'primary':
      case 'emerald':
      case 'danger':
        base.color = colors.textLight;
        break;
      case 'secondary':
        base.color = colors.emeraldDark;
        break;
      case 'outline':
        base.color = disabled ? colors.textMuted : colors.primary;
        break;
      case 'ghost':
        base.color = disabled ? colors.textMuted : colors.primary;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textLight}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
