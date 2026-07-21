import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_SIZES } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const DeadlineCard = ({ 
  project, 
  dueDate, 
  daysRemaining, 
  priority = 'medium',
  delay = 0 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#FEE2E2';
      case 'medium':
        return '#FEF3C7';
      case 'low':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityColor = getPriorityColor(priority);
  const priorityBgColor = getPriorityBgColor(priority);

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInUp.duration(500).delay(delay).springify()}
    >
      <View style={styles.header}>
        <View style={styles.projectInfo}>
          <Ionicons name="briefcase" size={20} color={COLORS.primary} />
          <Text style={styles.projectName} numberOfLines={1}>{project}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityBgColor }]}>
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {priority.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Due Date:</Text>
          <Text style={styles.detailValue}>{formatDate(dueDate)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color={COLORS.gray} />
          <Text style={styles.detailLabel}>Remaining:</Text>
          <Text style={[
            styles.detailValue, 
            { color: daysRemaining <= 7 ? COLORS.error : COLORS.secondary }
          ]}>
            {daysRemaining === 0 ? 'Today' : 
             daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
             `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {daysRemaining <= 7 && daysRemaining >= 0 && (
        <View style={styles.urgentIndicator}>
          <Ionicons name="warning" size={14} color={COLORS.warning} />
          <Text style={styles.urgentText}>Due soon</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginRight: SIZES.sm,
  },
  projectName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: FONT_SIZES.xs - 2,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    gap: SIZES.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '600',
    flex: 1,
  },
  urgentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.xs,
    paddingTop: SIZES.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  urgentText: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.warning,
    fontWeight: '600',
  },
});

export default DeadlineCard;