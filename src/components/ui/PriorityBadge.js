import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

/**
 * PriorityBadge - Reusable priority indicator component
 * 
 * @param {string} priority - Priority value (Critical, High, Medium, Low)
 * @param {string} size - 'small' | 'medium' | 'large'
 */
const PriorityBadge = ({ 
  priority, 
  size = 'medium',
  style 
}) => {
  const getPriorityConfig = (priority) => {
    const priorityLower = priority?.toLowerCase() || 'default';
    
    const configs = {
      critical: { color: '#DC2626', bg: '#FEE2E2', label: 'Critical' },
      high: { color: COLORS.error, bg: COLORS.errorLight, label: 'High' },
      medium: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Medium' },
      low: { color: COLORS.success, bg: COLORS.successLight, label: 'Low' },
      default: { color: COLORS.gray, bg: COLORS.lightGray, label: priority || 'N/A' },
    };

    return configs[priorityLower] || configs.default;
  };

  const config = getPriorityConfig(priority);
  
  const sizeStyles = {
    small: {
      paddingHorizontal: SPACING[2],
      paddingVertical: SPACING[1],
      fontSize: TYPOGRAPHY.caption.fontSize,
    },
    medium: {
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      fontSize: TYPOGRAPHY.label.fontSize,
    },
    large: {
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[2],
      fontSize: TYPOGRAPHY.body.fontSize,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: config.bg,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
        style,
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: config.color,
            fontSize: currentSize.fontSize,
          }
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: TYPOGRAPHY.label.fontWeight,
    letterSpacing: TYPOGRAPHY.label.letterSpacing,
  },
});

export default PriorityBadge;