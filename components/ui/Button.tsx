import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled ? styles.disabledText : undefined,
  ] as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.accent : COLORS.textPrimary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  smallSize: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
  },
  mediumSize: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minWidth: 120,
  },
  largeSize: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minWidth: 200,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  primaryText: {
    color: COLORS.textPrimary,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  outlineText: {
    color: COLORS.accent,
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  disabledText: {
    opacity: 0.7,
  },
});
