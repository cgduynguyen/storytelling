import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

/**
 * Error message component
 *
 * Displays child-friendly error messages with optional retry button
 * Used throughout the app for error states
 */
export function ErrorMessage({ message, onRetry, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>😔</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          onPress={onRetry}
          variant="primary"
          size="medium"
          style={styles.retryButton}
        >
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: '80%',
  },
  retryButton: {
    marginTop: spacing.md,
  },
});
