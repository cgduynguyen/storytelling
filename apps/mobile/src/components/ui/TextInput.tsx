import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, components } from '../../styles/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

/**
 * Text input component with label and error support
 *
 * Child-friendly styling with large touch targets
 * Includes validation error display
 */
export function TextInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        {...props}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        placeholderTextColor={colors.text.light}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    height: components.input.height,
    paddingHorizontal: components.input.paddingHorizontal,
    borderRadius: components.input.borderRadius,
    borderWidth: components.input.borderWidth,
    borderColor: colors.text.light,
    backgroundColor: colors.background.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.state.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.state.error,
    marginTop: spacing.xs,
  },
});
