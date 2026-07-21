/**
 * BuildTrack Design System - Elevation & Shadows
 * Material Design 3 inspired elevation system
 */

export const ELEVATION = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

// Semantic elevation aliases
export const ELEVATION_SEMANTIC = {
  none: ELEVATION[0],
  low: ELEVATION[1],
  medium: ELEVATION[2],
  high: ELEVATION[3],
  highest: ELEVATION[4],
};

// Helper to get elevation style
export const getElevationStyle = (level) => {
  return ELEVATION[level] || ELEVATION[0];
};

// Common shadow presets
export const SHADOW = {
  card: ELEVATION[2],
  button: ELEVATION[2],
  fab: ELEVATION[3],
  modal: ELEVATION[4],
  dropdown: ELEVATION[3],
};

export default ELEVATION;