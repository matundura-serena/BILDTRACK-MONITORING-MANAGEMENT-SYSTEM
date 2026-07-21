import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

// ==========================================
// 📊 REUSABLE STATISTICS CARD COMPONENT
// ==========================================

export default function StatCard({
  title,
  value,
  icon,
  color = COLORS.primary,
  backgroundColor = '#EEF2FF',
  trend,
  trendUp = true,
  cardWidth,
  onPress,
}) {
  const CardContainer = onPress ? TouchableOpacity : View;
  const touchProps = onPress ? { onPress, activeOpacity: 0.85 } : {};

  return (
    <CardContainer
      style={[styles.card, { borderLeftColor: color, width: cardWidth }]}
      {...touchProps}
    >
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={14}
              color={trendUp ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.trend, { color: trendUp ? '#10B981' : '#EF4444' }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
    </CardContainer>
  );
}

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginVertical: 6,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trend: {
    fontSize: 11,
    fontWeight: '600',
  },
});
