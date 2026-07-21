import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function CustomButton({ title, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed ? { opacity: 0.85 } : null,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
  },
});

