import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_SIZES } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const KPIStatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  iconBgColor, 
  delay = 0,
  percentage 
}) => {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInUp.duration(500).delay(delay).springify()}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {percentage !== undefined && (
          <View style={styles.percentageContainer}>
            <View style={[styles.percentageBar, { backgroundColor: COLORS.lightGray }]}>
              <View 
                style={[
                  styles.percentageFill, 
                  { 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: color 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: SIZES.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray,
    fontWeight: '500',
  },
  percentageContainer: {
    marginTop: SIZES.xs,
    gap: 4,
  },
  percentageBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '700',
  },
});

export default KPIStatCard;