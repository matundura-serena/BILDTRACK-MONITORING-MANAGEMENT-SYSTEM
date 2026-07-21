import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function CustomInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  icon,
  keyboardType,
  autoCapitalize,
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    ...FONTS.caption,
    color: COLORS.gray,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    height: 48,
  },
  iconWrap: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    paddingVertical: 0,
    color: COLORS.secondary,
  },
});

