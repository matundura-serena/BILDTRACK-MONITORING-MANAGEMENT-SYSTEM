/**
 * BuildTrack Design System - Main Theme Export
 * Consolidates all design tokens for easy importing
 */

// Import all design tokens
import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';
import { SPACING, SIZES } from './spacing';
import { ELEVATION, SHADOW } from './elevation';

// Border radius constants
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Font size constants (for backward compatibility)
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
};

// Legacy font styles (for backward compatibility)
export const FONTS = {
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.secondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

// Animation constants
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    standard: 'ease-in-out',
    decelerate: 'ease-out',
    accelerate: 'ease-in',
  },
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
  desktop: 1024,
};

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
};

// Default export with all tokens
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SIZES,
  BORDER_RADIUS,
  ELEVATION,
  SHADOW,
  FONTS,
  FONT_SIZES,
  ANIMATION,
  BREAKPOINTS,
  Z_INDEX,
};