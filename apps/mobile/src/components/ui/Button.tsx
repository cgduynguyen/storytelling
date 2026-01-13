import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  components,
} from '../../styles/theme';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  debounceMs?: number;
}

/**
 * Button component with loading state and debouncing
 *
 * Features:
 * - Visual feedback during async operations
 * - Automatic debouncing to prevent double-taps
 * - Child-friendly sizing and colors
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  debounceMs = 300,
  ...props
}: ButtonProps) {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handlePress = useCallback(async () => {
    if (isDebouncing || loading || disabled) return;

    setIsDebouncing(true);

    try {
      await onPress();
    } finally {
      // Reset debounce after specified delay
      setTimeout(() => {
        setIsDebouncing(false);
      }, debounceMs);
    }
  }, [onPress, isDebouncing, loading, disabled, debounceMs]);

  const isDisabled = disabled || loading || isDebouncing;

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' ? colors.primary.main : colors.text.white
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    height: components.button.height,
    paddingHorizontal: components.button.paddingHorizontal,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },

  // Sizes
  small: {
    height: 40,
    paddingHorizontal: spacing.md,
  },
  medium: {
    height: components.button.height,
    paddingHorizontal: components.button.paddingHorizontal,
  },
  large: {
    height: 64,
    paddingHorizontal: spacing.xl,
  },

  // States
  disabled: {
    backgroundColor: colors.interactive.disabled,
    borderColor: colors.interactive.disabled,
  },

  // Text styles
  text: {
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.text.white,
    fontSize: typography.fontSize.lg,
  },
  secondaryText: {
    color: colors.text.white,
    fontSize: typography.fontSize.lg,
  },
  outlineText: {
    color: colors.primary.main,
    fontSize: typography.fontSize.lg,
  },
  smallText: {
    fontSize: typography.fontSize.md,
  },
  mediumText: {
    fontSize: typography.fontSize.lg,
  },
  largeText: {
    fontSize: typography.fontSize.xl,
  },
});
