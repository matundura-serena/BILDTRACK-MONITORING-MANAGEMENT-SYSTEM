import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

/**
 * EmptyState - Reusable empty state component
 * 
 * @param {string} icon - Ionicons name for the icon
 * @param {string} title - Title text
 * @param {string} subtitle - Subtitle/description text
 * @param {string} buttonText - Button text (optional)
 * @param {function} onButtonPress - Button press handler
 * @param {string} iconColor - Icon color
 */
const EmptyState = ({ 
  icon, 
  title, 
  subtitle, 
  buttonText, 
  onButtonPress,
  iconColor = COLORS.lightGray,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {buttonText && onButtonPress && (
        <Pressable 
          style={styles.button}
          onPress={onButtonPress}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[10],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  title: {
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: TYPOGRAPHY.h5.fontWeight,
    color: COLORS.text,
    marginTop: SPACING[3],
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.body.lineHeight,
    marginBottom: SPACING[5],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING[3] + 2,
    paddingHorizontal: SPACING[5],
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING[2],
    ...SHADOW.button,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.button.fontSize,
    fontWeight: TYPOGRAPHY.button.fontWeight,
  },
});

export default EmptyState;