import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

/**
 * Loading spinner component
 *
 * Shows activity indicator with optional message
 * Used during story generation, audio loading, etc.
 */
export function LoadingSpinner({
  message,
  size = 'large',
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary.main} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
