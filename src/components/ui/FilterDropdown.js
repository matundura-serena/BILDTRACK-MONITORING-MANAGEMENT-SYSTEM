import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOW } from '../../constants/theme';

/**
 * FilterDropdown - Reusable filter dropdown component
 * 
 * @param {string} label - Label for the dropdown
 * @param {string} value - Currently selected value
 * @param {function} onSelect - Callback when option is selected
 * @param {array} options - Array of {label, value} objects
 * @param {string} icon - Ionicons name for the icon
 */
const FilterDropdown = ({ 
  label, 
  value, 
  onSelect, 
  options, 
  icon,
  style 
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={18} color={COLORS.gray} />
        </View>
        <Text style={styles.dropdownText} numberOfLines={1}>
          {value || label}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={COLORS.gray} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2] + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING[2],
    minHeight: 40,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.body.fontWeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    width: '85%',
    maxHeight: '70%',
    padding: SPACING[4],
    ...SHADOW.modal,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h6.fontSize,
    fontWeight: TYPOGRAPHY.h6.fontWeight,
    color: COLORS.text,
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[3] + 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING[1],
    backgroundColor: COLORS.background,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.body.fontWeight,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: SPACING[3],
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default FilterDropdown;