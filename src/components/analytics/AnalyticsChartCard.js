import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AnalyticsChartCard = ({ 
  title, 
  children, 
  delay = 0,
  summary,
  style 
}) => {
  return (
    <Animated.View 
      style={[styles.container, style]}
      entering={FadeInUp.duration(600).delay(delay).springify()}
    >
      <Text style={styles.title}>{title}</Text>
      {summary && (
        <View style={styles.summaryContainer}>
          {summary.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.chartWrapper}>
        {children}
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
    marginBottom: SIZES.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.sm,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
  },
});

export default AnalyticsChartCard;