import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from '../ui/TextInput';
import { theme } from '../../styles/theme';

interface CharacterInputProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
}

/**
 * CharacterInput component
 *
 * Input field for main character name with sanitization
 * Enforces character name rules (letters and spaces only, matching API schema)
 */
export const CharacterInput: React.FC<CharacterInputProps> = ({
  value,
  onChangeText,
  maxLength = 30,
}) => {
  const [error, setError] = useState<string>('');

  const handleTextChange = (text: string) => {
    // Sanitize input: Allow only letters and spaces (matching API schema /^[a-zA-Z\s]+$/)
    const sanitized = text.replace(/[^a-zA-Z\s]/g, '');

    // Trim leading spaces
    const trimmed = sanitized.replace(/^\s+/, '');

    // Check for validation errors
    if (text !== sanitized) {
      setError('Only letters and spaces are allowed');
    } else if (trimmed.length > maxLength) {
      setError(`Name must be ${maxLength} characters or less`);
    } else {
      setError('');
    }

    onChangeText(trimmed.slice(0, maxLength));
  };

  const characterCount = value.length;
  const showCount = characterCount > maxLength * 0.8; // Show count when 80% full

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Main Character Name</Text>
      <Text style={styles.hint}>
        Choose a name for your story's hero! (Optional)
      </Text>

      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder="e.g., Luna, Max, or leave empty"
        maxLength={maxLength}
        autoCapitalize="words"
        autoCorrect={false}
        error={error}
        accessibilityLabel="Character name input"
        accessibilityHint="Enter a name for the main character in your story"
      />

      {showCount && (
        <Text
          style={[
            styles.characterCount,
            characterCount >= maxLength && styles.characterCountMax,
          ]}
        >
          {characterCount}/{maxLength}
        </Text>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  characterCountMax: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
});
