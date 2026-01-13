import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemeSelector } from '../../components/story/ThemeSelector';
import { LengthSelector } from '../../components/story/LengthSelector';
import { CharacterInput } from '../../components/story/CharacterInput';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useStoryStore } from '../../stores/storyStore';
import { useCreateStory } from '../../hooks/useStory';
import { useAuthStore } from '../../stores/authStore';
import type { StoryTheme, StoryLength } from '@storyteller/shared';
import { theme } from '../../styles/theme';

/**
 * CreateStoryScreen
 *
 * Main screen for story creation with theme, length, and character selection
 */
export default function CreateStoryScreen() {
  const user = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.user
  );
  const isAuthenticated = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated
  );

  const creationParams = useStoryStore(
    (state: ReturnType<typeof useStoryStore.getState>) => state.creationParams
  );
  const updateCreationParams = useStoryStore(
    (state: ReturnType<typeof useStoryStore.getState>) =>
      state.updateCreationParams
  );
  const resetCreationParams = useStoryStore(
    (state: ReturnType<typeof useStoryStore.getState>) =>
      state.resetCreationParams
  );
  const setGenerating = useStoryStore(
    (state: ReturnType<typeof useStoryStore.getState>) => state.setGenerating
  );
  const setCurrentStory = useStoryStore(
    (state: ReturnType<typeof useStoryStore.getState>) => state.setCurrentStory
  );

  const createStoryMutation = useCreateStory();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  const handleThemeSelect = (selectedTheme: StoryTheme) => {
    updateCreationParams({ theme: selectedTheme });
  };

  const handleLengthSelect = (length: StoryLength) => {
    updateCreationParams({ length });
  };

  const handleCharacterChange = (mainCharacter: string) => {
    updateCreationParams({ mainCharacter });
  };

  const handleCreateStory = async () => {
    // Validate required fields
    if (!creationParams.theme) {
      Alert.alert('Missing Theme', 'Please select a theme for your story.');
      return;
    }

    if (!creationParams.length) {
      Alert.alert('Missing Length', 'Please select a story length.');
      return;
    }

    try {
      setGenerating(true);

      const newStory = await createStoryMutation.mutateAsync({
        theme: creationParams.theme,
        length: creationParams.length,
        mainCharacter: creationParams.mainCharacter || undefined,
        isInteractive: creationParams.isInteractive || false,
      });

      // Set as current story
      setCurrentStory(newStory);

      // Navigate to generating view
      router.push(`/story/${newStory.id}`);

      // Reset creation params for next story
      resetCreationParams();
    } catch (error) {
      setGenerating(false);
      Alert.alert(
        'Story Creation Failed',
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const canCreate = creationParams.theme && creationParams.length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create a Story</Text>
          {user?.childName && (
            <Text style={styles.subtitle}>
              Let's create a magical story, {user.childName}! ✨
            </Text>
          )}
        </View>

        {createStoryMutation.isError && (
          <ErrorMessage
            message={
              createStoryMutation.error instanceof Error
                ? createStoryMutation.error.message
                : 'Failed to create story'
            }
            onRetry={createStoryMutation.reset}
          />
        )}

        <ThemeSelector
          selectedTheme={creationParams.theme}
          onSelectTheme={handleThemeSelect}
        />

        <LengthSelector
          selectedLength={creationParams.length || 'MEDIUM'}
          onSelectLength={handleLengthSelect}
        />

        <CharacterInput
          value={creationParams.mainCharacter || ''}
          onChangeText={handleCharacterChange}
        />

        <View style={styles.footer}>
          <Button
            onPress={handleCreateStory}
            disabled={!canCreate || createStoryMutation.isPending}
            loading={createStoryMutation.isPending}
            accessibilityLabel="Create story button"
          >
            {createStoryMutation.isPending ? 'Creating...' : 'Create Story'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
