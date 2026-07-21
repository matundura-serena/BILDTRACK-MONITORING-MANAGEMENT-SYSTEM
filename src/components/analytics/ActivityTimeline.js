import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_SIZES } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ActivityTimeline = ({ activities, delay = 0 }) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'checkin':
      case 'check-out':
        return COLORS.success;
      case 'project':
        return COLORS.primary;
      case 'task':
        return '#F59E0B';
      case 'milestone':
        return '#7C3AED';
      default:
        return COLORS.gray;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'checkin':
        return 'log-in';
      case 'check-out':
        return 'log-out';
      case 'project':
        return 'briefcase';
      case 'task':
        return 'checkmark-circle';
      case 'milestone':
        return 'flag';
      default:
        return 'information-circle';
    }
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInUp.duration(600).delay(delay).springify()}
    >
      <Text style={styles.title}>Recent Activity</Text>
      <View style={styles.timeline}>
        {activities.slice(0, 5).map((activity, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${getActivityColor(activity.type)}20` }]}>
                <Ionicons 
                  name={getActivityIcon(activity.type)} 
                  size={18} 
                  color={getActivityColor(activity.type)} 
                />
              </View>
              {index < activities.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.activityText}>{activity.message}</Text>
              <Text style={styles.timestamp}>{activity.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SIZES.md,
  },
  timeline: {
    gap: SIZES.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.lightGray,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SIZES.sm,
  },
  activityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray,
    fontWeight: '400',
  },
});

export default ActivityTimeline;