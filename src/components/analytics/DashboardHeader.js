import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_SIZES } from '../../constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const DashboardHeader = ({ title, subtitle, date, onRefresh, refreshing }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeInDown.duration(600).springify()}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="refresh" 
            size={22} 
            color={COLORS.primary} 
            style={refreshing ? styles.spinning : null}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
    marginTop: SIZES.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl + 4,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SIZES.sm,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
});

export default DashboardHeader;