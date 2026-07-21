/**
 * BuildTrack Design System - Color Tokens
 * Material Design 3 inspired color system
 */

// Primary Brand Colors (Indigo)
export const PRIMARY = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1', // Main brand color
  600: '#4F46E5', // Primary actions
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81', // Darkest variant
};

// Semantic Colors - Success (Green)
export const SUCCESS = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981', // Success states
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
};

// Semantic Colors - Warning (Amber)
export const WARNING = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Warning states
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
};

// Semantic Colors - Error (Red)
export const ERROR = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444', // Error states
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
};

// Semantic Colors - Info (Blue)
export const INFO = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6', // Info states
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

// Neutral Colors (Gray Scale)
export const NEUTRAL = {
  0: '#FFFFFF',    // White
  50: '#F9FAFB',   // Background
  100: '#F3F4F6',  // Surface
  200: '#E5E7EB',  // Border
  300: '#D1D5DB',
  400: '#9CA3AF',  // Disabled
  500: '#6B7280',  // Secondary text
  600: '#4B5563',
  700: '#374151',  // Primary text
  800: '#1F2937',
  900: '#111827',  // Darkest text
  950: '#0A0A0A',  // Near black
};

// Status Colors (Construction-specific)
export const STATUS = {
  active: '#10B981',
  planning: '#F59E0B',
  onHold: '#F59E0B',
  completed: '#3B82F6',
  delayed: '#EF4444',
  pending: '#F59E0B',
  inProgress: '#3B82F6',
  blocked: '#6B7280',
  overdue: '#EF4444',
  available: '#10B981',
  lowStock: '#F59E0B',
  outOfStock: '#EF4444',
};

// Priority Colors
export const PRIORITY = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

// Department Colors (for avatars and badges)
export const DEPARTMENT = {
  construction: '#F59E0B',
  engineering: '#3B82F6',
  electrical: '#EF4444',
  plumbing: '#10B981',
  safety: '#8B5CF6',
  procurement: '#EC4899',
  finance: '#14B8A6',
  administration: '#6366F1',
  qualityAssurance: '#F97316',
};

// Export combined color object for backward compatibility
export const COLORS = {
  primary: PRIMARY[600],
  primaryLight: PRIMARY[100],
  primaryDark: PRIMARY[800],
  secondary: NEUTRAL[900],
  gray: NEUTRAL[500],
  lightGray: NEUTRAL[200],
  white: NEUTRAL[0],
  background: NEUTRAL[50],
  text: NEUTRAL[900],
  textSecondary: NEUTRAL[500],
  error: ERROR[500],
  success: SUCCESS[500],
  warning: WARNING[500],
  border: NEUTRAL[200],
  shadow: NEUTRAL[950],
  
  // Additional colors
  info: INFO[500],
  infoLight: INFO[100],
  successLight: SUCCESS[100],
  warningLight: WARNING[100],
  errorLight: ERROR[100],
};

export default COLORS;