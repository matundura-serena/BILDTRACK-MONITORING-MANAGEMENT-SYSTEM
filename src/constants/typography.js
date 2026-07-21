/**
 * BuildTrack Design System - Typography Scale
 * Material Design 3 inspired type scale
 */

export const TYPOGRAPHY = {
  // Display - Hero sections, marketing
  display: {
    fontSize: 57,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0.25,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.15,
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Labels and captions
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 1.5,
  },

  // Button text
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// Helper to create text style with color
export const createTextStyle = (variant, color = 'text') => {
  const colorMap = {
    text: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    primary: '#4F46E5',
    secondary: '#374151',
    white: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  };

  return {
    ...TYPOGRAPHY[variant],
    color: colorMap[color] || color,
  };
};

export default TYPOGRAPHY;