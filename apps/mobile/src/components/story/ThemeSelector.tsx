import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { THEME_OPTIONS } from '../../hooks/useStory';
import type { StoryTheme } from '@storyteller/shared';
import { theme } from '../../styles/theme';

interface ThemeSelectorProps {
  selectedTheme?: StoryTheme;
  onSelectTheme: (theme: StoryTheme) => void;
  excludedThemes?: StoryTheme[];
}

/**
 * ThemeSelector component
 *
 * Displays a grid of theme options for story creation
 * Respects parental controls for excluded themes
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
  excludedThemes = [],
}) => {
  // Filter out excluded themes
  const availableThemes = THEME_OPTIONS.filter(
    (option) => !excludedThemes.includes(option.value)
  );

  const renderThemeItem = ({ item }: { item: (typeof THEME_OPTIONS)[0] }) => {
    const isSelected = selectedTheme === item.value;

    return (
      <TouchableOpacity
        style={[styles.themeCard, isSelected && styles.themeCardSelected]}
        onPress={() => onSelectTheme(item.value)}
        accessibilityLabel={`Select ${item.label} theme`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={styles.themeEmoji}>{item.emoji}</Text>
        <Text
          style={[styles.themeLabel, isSelected && styles.themeLabelSelected]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (availableThemes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No themes available. Please check parental settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Theme</Text>
      <FlatList
        data={availableThemes}
        renderItem={renderThemeItem}
        keyExtractor={(item) => item.value}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  grid: {
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  themeCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.dark,
  },
  themeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  themeLabelSelected: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
