import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

/**
 * StatusBadge - Reusable status indicator component
 * 
 * @param {string} status - Status value (Active, Completed, Pending, etc.)
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} showDot - Whether to show status dot
 */
const StatusBadge = ({ 
  status, 
  size = 'medium', 
  showDot = true,
  style 
}) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || 'default';
    
    const configs = {
      // Project/Task Status
      active: { color: COLORS.success, bg: COLORS.successLight, label: 'Active' },
      completed: { color: COLORS.info, bg: COLORS.infoLight, label: 'Completed' },
      inProgress: { color: COLORS.info, bg: COLORS.infoLight, label: 'In Progress' },
      pending: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Pending' },
      planning: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Planning' },
      onHold: { color: COLORS.warning, bg: COLORS.warningLight, label: 'On Hold' },
      delayed: { color: COLORS.error, bg: COLORS.errorLight, label: 'Delayed' },
      blocked: { color: COLORS.gray, bg: COLORS.lightGray, label: 'Blocked' },
      overdue: { color: COLORS.error, bg: COLORS.errorLight, label: 'Overdue' },
      
      // Worker Status
      'on leave': { color: COLORS.warning, bg: COLORS.warningLight, label: 'On Leave' },
      suspended: { color: COLORS.error, bg: COLORS.errorLight, label: 'Suspended' },
      resigned: { color: COLORS.gray, bg: COLORS.lightGray, label: 'Resigned' },
      terminated: { color: COLORS.error, bg: '#FEE2E2', label: 'Terminated' },
      
      // Material Status
      available: { color: COLORS.success, bg: COLORS.successLight, label: 'Available' },
      'low stock': { color: COLORS.warning, bg: COLORS.warningLight, label: 'Low Stock' },
      'out of stock': { color: COLORS.error, bg: COLORS.errorLight, label: 'Out of Stock' },
      
      // Default
      default: { color: COLORS.gray, bg: COLORS.lightGray, label: status || 'Unknown' },
    };

    return configs[statusLower] || configs.default;
  };

  const config = getStatusConfig(status);
  
  const sizeStyles = {
    small: {
      paddingHorizontal: SPACING[2],
      paddingVertical: SPACING[1],
      fontSize: TYPOGRAPHY.caption.fontSize,
      dotSize: 6,
    },
    medium: {
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      fontSize: TYPOGRAPHY.label.fontSize,
      dotSize: 8,
    },
    large: {
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[2],
      fontSize: TYPOGRAPHY.body.fontSize,
      dotSize: 10,
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
      {showDot && (
        <View 
          style={[
            styles.dot, 
            { 
              backgroundColor: config.color,
              width: currentSize.dotSize,
              height: currentSize.dotSize,
            }
          ]} 
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING[1],
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: BORDER_RADIUS.full,
  },
  text: {
    fontWeight: TYPOGRAPHY.label.fontWeight,
    letterSpacing: TYPOGRAPHY.label.letterSpacing,
  },
});

export default StatusBadge;