import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const BudgetKPICard = ({ 
  title, 
  value, 
  icon, 
  color, 
  backgroundColor,
  subtitle,
  format = 'number' 
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '0';
    
    if (format === 'currency') {
      return `KSh ${Number(val).toLocaleString('en-KE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
    
    if (format === 'percentage') {
      return `${Number(val).toFixed(1)}%`;
    }
    
    return Number(val).toLocaleString('en-KE');
  };

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{formatValue(value)}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: (SIZES.width - SIZES.padding * 2 - 36) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 12,
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
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default BudgetKPICard;