import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMaterials } from '../context/MaterialContext';
import { materialService } from '../services/materialService';
import { COLORS, SIZES, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import CustomButton from '../components/CustomButton';

const { width: screenWidth } = Dimensions.get('window');

export default function BulkMaterialEntryScreen({ navigation }) {
  const { refreshMaterials, loadStatistics } = useMaterials();
  
  const [materials, setMaterials] = useState([
    {
      material_name: '',
      category: '',
      unit: '',
      quantity_total: '',
      minimum_stock: '',
      unit_price: '',
      supplier: '',
      location: '',
      description: '',
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  // Add new row
  const handleAddRow = () => {
    setMaterials([
      ...materials,
      {
        material_name: '',
        category: '',
        unit: '',
        quantity_total: '',
        minimum_stock: '',
        unit_price: '',
        supplier: '',
        location: '',
        description: '',
      }
    ]);
  };

  // Delete row
  const handleDeleteRow = (index) => {
    if (materials.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one row');
      return;
    }
    
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
    
    // Clear errors for deleted row
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  // Update field
  const handleFieldChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
    
    // Clear error for this field when user starts typing
    if (errors[index]?.[field]) {
      setErrors({
        ...errors,
        [index]: {
          ...errors[index],
          [field]: null
        }
      });
    }
  };

  // Validate single material
  const validateMaterial = (material, index) => {
    const rowErrors = {};
    
    if (!material.material_name || !material.material_name.trim()) {
      rowErrors.material_name = 'Material name is required';
    }
    
    if (!material.category || !material.category.trim()) {
      rowErrors.category = 'Category is required';
    }
    
    if (!material.unit || !material.unit.trim()) {
      rowErrors.unit = 'Unit is required';
    }
    
    const quantity = parseFloat(material.quantity_total);
    if (material.quantity_total === '' || material.quantity_total === undefined || isNaN(quantity)) {
      rowErrors.quantity_total = 'Quantity must be a number';
    } else if (quantity < 0) {
      rowErrors.quantity_total = 'Quantity cannot be negative';
    }
    
    const minStock = parseFloat(material.minimum_stock);
    if (material.minimum_stock !== '' && material.minimum_stock !== undefined) {
      if (isNaN(minStock)) {
        rowErrors.minimum_stock = 'Must be a number';
      } else if (minStock < 0) {
        rowErrors.minimum_stock = 'Cannot be negative';
      }
    }
    
    const price = parseFloat(material.unit_price);
    if (material.unit_price === '' || material.unit_price === undefined || isNaN(price)) {
      rowErrors.unit_price = 'Price must be a number';
    } else if (price < 0) {
      rowErrors.unit_price = 'Price cannot be negative';
    }
    
    return rowErrors;
  };

  // Validate all materials
  const validateAll = () => {
    const allErrors = {};
    let hasErrors = false;
    
    materials.forEach((material, index) => {
      const rowErrors = validateMaterial(material, index);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[index] = rowErrors;
        hasErrors = true;
      }
    });
    
    setErrors(allErrors);
    return !hasErrors;
  };

  // Save all materials
  const handleSaveAll = async () => {
    if (!validateAll()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      // Prepare data for API
      const materialsToSubmit = materials.map(m => ({
        material_name: m.material_name.trim(),
        category: m.category.trim(),
        unit: m.unit.trim(),
        quantity_total: parseFloat(m.quantity_total),
        minimum_stock: m.minimum_stock ? parseFloat(m.minimum_stock) : 0,
        unit_price: parseFloat(m.unit_price),
        supplier: m.supplier?.trim() || null,
        location: m.location?.trim() || null,
        description: m.description?.trim() || null,
      }));
      
      const response = await materialService.bulkCreateMaterials(materialsToSubmit);
      
      setResult(response);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `${response.inserted} material(s) added successfully`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Refresh materials list and statistics
                await refreshMaterials();
                await loadStatistics();
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Partial Success',
          `${response.inserted} inserted, ${response.failed} failed`,
          [
            {
              text: 'OK',
              onPress: async () => {
                // Refresh materials list even if some failed
                await refreshMaterials();
                await loadStatistics();
                navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save materials');
      setResult({
        success: false,
        inserted: 0,
        failed: materials.length,
        errors: [{ message: error.message }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel
  const handleCancel = () => {
    Alert.alert(
      'Cancel Entry',
      'Are you sure you want to cancel? All unsaved data will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Render material row
  const renderMaterialRow = (material, index) => {
    const rowErrors = errors[index] || {};
    
    return (
      <View key={index} style={styles.materialRow}>
        {/* Row Header */}
        <View style={styles.rowHeader}>
          <View style={styles.rowNumberContainer}>
            <Text style={styles.rowNumber}>#{index + 1}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteRowButton}
            onPress={() => handleDeleteRow(index)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Material Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Material Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              rowErrors.material_name && styles.fieldInputError
            ]}
            placeholder="e.g., Cement"
            value={material.material_name}
            onChangeText={(value) => handleFieldChange(index, 'material_name', value)}
            placeholderTextColor={COLORS.gray}
          />
          {rowErrors.material_name && (
            <Text style={styles.errorText}>{rowErrors.material_name}</Text>
          )}
        </View>

        {/* Category and Unit */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                rowErrors.category && styles.fieldInputError
              ]}
              placeholder="e.g., Building"
              value={material.category}
              onChangeText={(value) => handleFieldChange(index, 'category', value)}
              placeholderTextColor={COLORS.gray}
            />
            {rowErrors.category && (
              <Text style={styles.errorText}>{rowErrors.category}</Text>
            )}
          </View>

          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>
              Unit <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                rowErrors.unit && styles.fieldInputError
              ]}
              placeholder="e.g., Bags"
              value={material.unit}
              onChangeText={(value) => handleFieldChange(index, 'unit', value)}
              placeholderTextColor={COLORS.gray}
            />
            {rowErrors.unit && (
              <Text style={styles.errorText}>{rowErrors.unit}</Text>
            )}
          </View>
        </View>

        {/* Quantity and Minimum Stock */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>
              Quantity <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                rowErrors.quantity_total && styles.fieldInputError
              ]}
              placeholder="0"
              value={material.quantity_total}
              onChangeText={(value) => handleFieldChange(index, 'quantity_total', value)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray}
            />
            {rowErrors.quantity_total && (
              <Text style={styles.errorText}>{rowErrors.quantity_total}</Text>
            )}
          </View>

          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Min Stock</Text>
            <TextInput
              style={[
                styles.fieldInput,
                rowErrors.minimum_stock && styles.fieldInputError
              ]}
              placeholder="0"
              value={material.minimum_stock}
              onChangeText={(value) => handleFieldChange(index, 'minimum_stock', value)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray}
            />
            {rowErrors.minimum_stock && (
              <Text style={styles.errorText}>{rowErrors.minimum_stock}</Text>
            )}
          </View>
        </View>

        {/* Unit Price */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Unit Price (KSh) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              rowErrors.unit_price && styles.fieldInputError
            ]}
            placeholder="0.00"
            value={material.unit_price}
            onChangeText={(value) => handleFieldChange(index, 'unit_price', value)}
            keyboardType="numeric"
            placeholderTextColor={COLORS.gray}
          />
          {rowErrors.unit_price && (
            <Text style={styles.errorText}>{rowErrors.unit_price}</Text>
          )}
        </View>

        {/* Supplier and Location */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Supplier</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g., Bamburi"
              value={material.supplier}
              onChangeText={(value) => handleFieldChange(index, 'supplier', value)}
              placeholderTextColor={COLORS.gray}
            />
          </View>

          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g., Warehouse A"
              value={material.location}
              onChangeText={(value) => handleFieldChange(index, 'location', value)}
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.fieldInput, styles.textArea]}
            placeholder="Additional details..."
            value={material.description}
            onChangeText={(value) => handleFieldChange(index, 'description', value)}
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Bulk Materials Entry</Text>
          <Text style={styles.headerSubtitle}>
            {materials.length} {materials.length === 1 ? 'row' : 'rows'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.instructionsText}>
            Add multiple materials at once. Fill in the details for each row and save all at once.
          </Text>
        </View>

        {/* Material Rows */}
        {materials.map((material, index) => renderMaterialRow(material, index))}

        {/* Add Row Button */}
        <TouchableOpacity style={styles.addRowButton} onPress={handleAddRow}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addRowText}>Add Another Row</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="Cancel"
            onPress={handleCancel}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <CustomButton
            title="Save All Materials"
            onPress={handleSaveAll}
            loading={loading}
            style={styles.saveButton}
          />
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Saving materials...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    gap: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SIZES.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  instructionsText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  materialRow: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowNumberContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  rowNumber: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  deleteRowButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowFields: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  fieldContainer: {
    marginBottom: SIZES.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    textTransform: 'uppercase',
  },
  required: {
    color: COLORS.error,
  },
  fieldInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  fieldInputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEE2E2',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    marginTop: SIZES.xs,
    fontWeight: '500',
  },
  addRowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: SIZES.lg,
  },
  addRowText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.secondary,
  },
  saveButton: {
    flex: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    fontWeight: '500',
  },
});