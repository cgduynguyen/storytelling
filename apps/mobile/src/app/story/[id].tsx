import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GeneratingView } from '../../components/story/GeneratingView';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useStoryPolling } from '../../hooks/useStoryPolling';
import { useDeleteStory } from '../../hooks/useStory';
import { theme } from '../../styles/theme';

/**
 * StoryViewScreen
 *
 * Displays generated story or shows generating view during creation
 */
export default function StoryViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deleteStoryMutation = useDeleteStory();

  const { story, isComplete, isFailed, error } = useStoryPolling({
    storyId: id,
    enabled: true,
    onComplete: () => {
      // Story generation complete
    },
    onError: (err: Error) => {
      Alert.alert(
        'Generation Failed',
        err.message || 'Failed to generate your story. Please try again.'
      );
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id || typeof id !== 'string') {
            router.back();
            return;
          }
          try {
            await deleteStoryMutation.mutateAsync(id);
            router.back();
          } catch (error) {
            Alert.alert(
              'Delete Failed',
              error instanceof Error ? error.message : 'Failed to delete story'
            );
          }
        },
      },
    ]);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Show generating view if story is still being created
  if (!story || (story && !isComplete && !isFailed)) {
    return (
      <GeneratingView
        theme={story?.theme}
        characterName={story?.mainCharacter ?? undefined}
      />
    );
  }

  // Show error state
  if (isFailed || error) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={error?.message || story?.error || 'Story generation failed'}
          onRetry={handleGoBack}
        />
        <View style={styles.errorActions}>
          <Button onPress={handleGoBack}>Go Back</Button>
        </View>
      </View>
    );
  }

  // Show completed story
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Story Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{story.title}</Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataItem}>Theme: {story.theme}</Text>
            {story.mainCharacter && (
              <Text style={styles.metadataItem}>
                Character: {story.mainCharacter}
              </Text>
            )}
            <Text style={styles.metadataItem}>Length: {story.length}</Text>
          </View>
        </View>

        {/* Story Content */}
        <View style={styles.content}>
          <Text style={styles.storyText}>{story.content}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={handleGoBack}
            variant="secondary"
            style={styles.actionButton}
          >
            Back to Stories
          </Button>
          <Button
            onPress={handleDelete}
            variant="secondary"
            style={styles.actionButton}
            loading={deleteStoryMutation.isPending}
          >
            Delete Story
          </Button>
        </View>

        {/* Placeholder for future audio controls */}
        <View style={styles.audioPlaceholder}>
          <Text style={styles.audioPlaceholderText}>
            🎧 Audio narration coming soon!
          </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 12,
    lineHeight: 36,
  },
  metadata: {
    gap: 4,
  },
  metadataItem: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.text.primary,
    fontFamily: 'System',
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  errorActions: {
    padding: 16,
  },
  audioPlaceholder: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  audioPlaceholderText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
