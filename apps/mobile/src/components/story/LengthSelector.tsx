import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LENGTH_OPTIONS } from '../../hooks/useStory';
import type { StoryLength } from '@storyteller/shared';
import { theme } from '../../styles/theme';

interface LengthSelectorProps {
  selectedLength: StoryLength;
  onSelectLength: (length: StoryLength) => void;
}

/**
 * LengthSelector component
 *
 * Displays story length options (Short, Medium, Long)
 */
export const LengthSelector: React.FC<LengthSelectorProps> = ({
  selectedLength,
  onSelectLength,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Story Length</Text>
      <View style={styles.options}>
        {LENGTH_OPTIONS.map((option) => {
          const isSelected = selectedLength === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.lengthCard,
                isSelected && styles.lengthCardSelected,
              ]}
              onPress={() => onSelectLength(option.value)}
              accessibilityLabel={`Select ${option.label} length, approximately ${option.description}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.lengthLabel,
                  isSelected && styles.lengthLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.lengthDescription,
                  isSelected && styles.lengthDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
              <Text
                style={[
                  styles.lengthWords,
                  isSelected && styles.lengthWordsSelected,
                ]}
              >
                ~{option.estimatedWords} words
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  options: {
    gap: 12,
  },
  lengthCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lengthCardSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.dark,
  },
  lengthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  lengthLabelSelected: {
    color: '#FFFFFF',
  },
  lengthDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  lengthDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lengthWords: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  lengthWordsSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
