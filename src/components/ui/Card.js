import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/theme';

/**
 * Card - Reusable card component with variants
 * 
 * @param {string} variant - 'elevated' | 'filled' | 'outlined'
 * @param {boolean} pressable - Whether card is pressable
 * @param {function} onPress - Press handler
 * @param {number} elevation - Elevation level (0-4)
 */
const Card = ({ 
  children, 
  variant = 'elevated',
  pressable = false,
  onPress,
  elevation = 2,
  style,
  contentStyle,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: COLORS.background,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: COLORS.white,
          borderWidth: 0,
          ...SHADOW.card,
        };
    }
  };

  const cardContent = (
    <View 
      style={[
        styles.card,
        getVariantStyles(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (pressable && onPress) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

// Card sub-components
Card.Header = ({ children, style, ...props }) => (
  <View style={[styles.cardHeader, style]} {...props}>
    {children}
  </View>
);

Card.Body = ({ children, style, ...props }) => (
  <View style={[styles.cardBody, style]} {...props}>
    {children}
  </View>
);

Card.Footer = ({ children, style, ...props }) => (
  <View style={[styles.cardFooter, style]} {...props}>
    {children}
  </View>
);

Card.Actions = ({ children, style, ...props }) => (
  <View style={[styles.cardActions, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  pressable: {
    borderRadius: BORDER_RADIUS.lg,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    padding: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardBody: {
    padding: SPACING[4],
  },
  cardFooter: {
    padding: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default Card;