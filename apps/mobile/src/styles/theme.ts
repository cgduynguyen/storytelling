/**
 * Theme and styling foundation for AI Storyteller
 * Child-friendly colors and typography optimized for ages 3-10
 */

export const colors = {
  // Primary brand colors - warm and inviting
  primary: {
    main: '#FF6B6B', // Coral red (playful, energetic)
    light: '#FFB3B3', // Light coral
    dark: '#CC5555', // Dark coral
  },

  // Secondary colors - calming and supportive
  secondary: {
    main: '#4ECDC4', // Turquoise (friendly, creative)
    light: '#9FE2DD', // Light turquoise
    dark: '#3EA39B', // Dark turquoise
  },

  // Accent colors for different story themes
  accent: {
    adventure: '#FFD93D', // Sunny yellow
    fantasy: '#A78BFA', // Purple
    animals: '#34D399', // Green
    science: '#60A5FA', // Blue
    mystery: '#F472B6', // Pink
  },

  // Background colors
  background: {
    primary: '#FFFFFF', // White
    secondary: '#F8F9FA', // Light gray
    tertiary: '#FFF9E6', // Cream (softer on eyes)
  },

  // Text colors
  text: {
    primary: '#2D3748', // Dark gray (readable)
    secondary: '#718096', // Medium gray
    light: '#A0AEC0', // Light gray
    white: '#FFFFFF', // White
  },

  // UI state colors
  state: {
    success: '#48BB78', // Green
    warning: '#F6AD55', // Orange
    error: '#FC8181', // Red (softer than harsh red)
    info: '#63B3ED', // Blue
  },

  // Interactive element colors
  interactive: {
    enabled: '#FF6B6B', // Primary color
    disabled: '#CBD5E0', // Gray
    hover: '#FFB3B3', // Light primary
    pressed: '#CC5555', // Dark primary
  },
};

export const typography = {
  // Font families (using system fonts for reliability)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Rounded fonts are more child-friendly
    heading: 'System', // Will use rounded variant
  },

  // Font sizes (larger for young readers)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights (generous for readability)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

/**
 * Age-specific theme adjustments
 */
export const ageThemes = {
  AGE_3_5: {
    fontSize: typography.fontSize.xl, // Larger text
    spacing: spacing.lg, // More generous spacing
    borderRadius: borderRadius.xl, // Rounder corners
  },
  AGE_6_8: {
    fontSize: typography.fontSize.lg,
    spacing: spacing.md,
    borderRadius: borderRadius.lg,
  },
  AGE_9_10: {
    fontSize: typography.fontSize.md,
    spacing: spacing.md,
    borderRadius: borderRadius.md,
  },
};

/**
 * Common component styles
 */
export const components = {
  button: {
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  input: {
    height: 56,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    ...shadows.md,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  ageThemes,
  components,
};

export type Theme = typeof theme;
