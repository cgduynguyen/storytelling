import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useStoryStore } from '../../stores/storyStore';
import { theme } from '../../styles/theme';

interface GeneratingViewProps {
  theme?: string;
  characterName?: string;
}

/**
 * GeneratingView component
 *
 * Displays loading state during story generation with progress
 */
export const GeneratingView: React.FC<GeneratingViewProps> = ({
  theme: storyTheme,
  characterName,
}) => {
  const generationProgress = useStoryStore((state) => state.generationProgress);

  // Animated progress bar
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: generationProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [generationProgress, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getLoadingMessage = () => {
    if (generationProgress < 30) {
      return 'Starting the magic...';
    } else if (generationProgress < 60) {
      return characterName
        ? `Creating ${characterName}'s adventure...`
        : 'Crafting your story...';
    } else if (generationProgress < 90) {
      return 'Adding the final touches...';
    } else {
      return 'Almost ready!';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LoadingSpinner size="large" />

        <Text style={styles.title}>Creating Your Story</Text>

        <Text style={styles.message}>{getLoadingMessage()}</Text>

        {storyTheme && (
          <Text style={styles.themeText}>Theme: {storyTheme}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(generationProgress)}%
          </Text>
        </View>

        <Text style={styles.hint}>This usually takes about 20-30 seconds</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  themeText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
