/**
 * BuildTrack Design System - Spacing System
 * 4px base grid system
 */

export const SPACING = {
  0: 0,
  1: 4,    // xs
  2: 8,    // sm
  3: 12,   // md-sm
  4: 16,   // md
  5: 20,   // md-lg
  6: 24,   // lg
  7: 28,   // lg-xl
  8: 32,   // xl
  10: 40,  // 2xl
  12: 48,  // 3xl
  16: 64,  // 4xl
  20: 80,  // 5xl
  24: 96,  // 6xl
};

// Semantic spacing aliases for common use cases
export const SPACING_SEMANTIC = {
  // Screen padding
  screenPadding: SPACING[4],
  screenPaddingLarge: SPACING[6],

  // Card spacing
  cardPadding: SPACING[4],
  cardPaddingLarge: SPACING[6],
  cardGap: SPACING[4],

  // List spacing
  listItemPadding: SPACING[4],
  listItemGap: SPACING[3],

  // Form spacing
  inputPadding: SPACING[4],
  inputGap: SPACING[4],
  labelMargin: SPACING[2],

  // Button spacing
  buttonPaddingVertical: SPACING[3],
  buttonPaddingHorizontal: SPACING[6],
  buttonGap: SPACING[3],

  // Icon spacing
  iconMargin: SPACING[2],
  iconPadding: SPACING[3],

  // Section spacing
  sectionMargin: SPACING[6],
  sectionGap: SPACING[4],

  // Header spacing
  headerPadding: SPACING[4],
  headerPaddingTop: SPACING[12], // Account for status bar

  // Modal spacing
  modalPadding: SPACING[6],
  modalGap: SPACING[4],
};

// Export for backward compatibility
export const SIZES = {
  padding: SPACING[4],
  radius: 12,
  xs: SPACING[1],
  sm: SPACING[2],
  md: SPACING[4],
  lg: SPACING[6],
  xl: SPACING[8],
};

export default SPACING;