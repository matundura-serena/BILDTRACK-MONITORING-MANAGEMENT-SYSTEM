import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWorkers } from '../context/WorkerContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 📋 CONSTANTS & OPTIONS
// ==========================================

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const DEPARTMENT_OPTIONS = [
  { label: 'Construction', value: 'Construction' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Electrical', value: 'Electrical' },
  { label: 'Plumbing', value: 'Plumbing' },
  { label: 'Safety', value: 'Safety' },
  { label: 'Procurement', value: 'Procurement' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Administration', value: 'Administration' },
  { label: 'Quality Assurance', value: 'Quality Assurance' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'Permanent', value: 'Permanent' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Intern', value: 'Intern' },
  { label: 'Consultant', value: 'Consultant' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'On Leave', value: 'On Leave' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Resigned', value: 'Resigned' },
  { label: 'Terminated', value: 'Terminated' },
];

// ==========================================
// 🎨 REUSABLE UI COMPONENTS
// ==========================================

const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  required = false,
  ...props
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.requiredStar}> *</Text>}
    </Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.inputError,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const DropdownPicker = ({ label, value, onSelect, options, error, required = false }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.dropdownButton, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || 'Select an option'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

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
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const DatePickerField = ({ label, value, onChange, error, required = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
    }
  }, [value]);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.datePickerButton, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
        <Text style={[styles.datePickerText, !value && styles.placeholderText]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={Platform.OS === 'ios' ? undefined : new Date()}
        />
      )}
    </View>
  );
};

// ==========================================
// 📱 MAIN ADD WORKER SCREEN
// ==========================================

export default function AddWorkerScreen({ navigation, route }) {
  const { addWorker, updateWorker, getWorkerById } = useWorkers();
  const isEditMode = route?.params?.workerId;
  const existingWorker = route?.params?.worker;

  // 📸 PROFILE PHOTO STATE
  const [profilePhoto, setProfilePhoto] = useState(existingWorker?.profile_photo || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // 📝 FORM STATE
  const [formData, setFormData] = useState({
    first_name: existingWorker?.first_name || '',
    last_name: existingWorker?.last_name || '',
    national_id: existingWorker?.national_id || '',
    gender: existingWorker?.gender || '',
    date_of_birth: existingWorker?.date_of_birth || '',
    phone_number: existingWorker?.phone_number || '',
    email: existingWorker?.email || '',
    address: existingWorker?.address || '',
    job_title: existingWorker?.job_title || '',
    department: existingWorker?.department || '',
    employment_type: existingWorker?.employment_type || '',
    daily_rate: existingWorker?.daily_rate || '',
    monthly_salary: existingWorker?.monthly_salary || '',
    hire_date: existingWorker?.hire_date || '',
    status: existingWorker?.status || 'Active',
    emergency_contact_name: existingWorker?.emergency_contact_name || '',
    emergency_contact_phone: existingWorker?.emergency_contact_phone || '',
  });

  // ✅ VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 🔄 UPDATE FORM FIELD HELPER
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // 📸 IMAGE PICKER HANDLER
  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      // Show action sheet
      Alert.alert(
        'Select Photo',
        'Choose a photo from',
        [
          {
            text: 'Camera',
            onPress: () => pickImage('camera'),
          },
          {
            text: 'Gallery',
            onPress: () => pickImage('gallery'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const pickImage = async (source) => {
    try {
      setUploadingPhoto(true);

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
        console.log('📸 Photo selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }

    if (!formData.employment_type) {
      newErrors.employment_type = 'Employment type is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    // National ID validation
    if (!formData.national_id.trim()) {
      newErrors.national_id = 'National ID is required';
    } else if (!/^\d+$/.test(formData.national_id.trim())) {
      newErrors.national_id = 'National ID must contain only digits';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (formData.phone_number) {
      const phoneDigits = formData.phone_number.replace(/\D/g, '');
      if (!/^\d+$/.test(formData.phone_number.replace(/\s/g, ''))) {
        newErrors.phone_number = 'Phone number must contain only digits';
      } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        newErrors.phone_number = 'Phone number must be between 10 and 15 digits';
      }
    }

    // Daily rate validation
    if (formData.daily_rate && (isNaN(formData.daily_rate) || parseFloat(formData.daily_rate) <= 0)) {
      newErrors.daily_rate = 'Daily rate must be a positive number';
    }

    // Monthly salary validation
    if (formData.monthly_salary && (isNaN(formData.monthly_salary) || parseFloat(formData.monthly_salary) <= 0)) {
      newErrors.monthly_salary = 'Monthly salary must be a positive number';
    }

    // Date of birth validation
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    // Hire date validation
    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date);
      const today = new Date();

      if (isNaN(hireDate.getTime())) {
        newErrors.hire_date = 'Invalid hire date';
      } else if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        if (hireDate < dob) {
          newErrors.hire_date = 'Hire date cannot be before date of birth';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📤 FORM SUBMISSION HANDLER
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare worker data
      const workerData = {
        ...formData,
        profile_photo: profilePhoto,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
        monthly_salary: formData.monthly_salary ? parseFloat(formData.monthly_salary) : null,
      };

      let result;
      if (isEditMode && existingWorker?.id) {
        // Update existing worker
        result = await updateWorker(existingWorker.id, workerData);
        Alert.alert('Success', 'Worker updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Add new worker
        result = await addWorker(workerData);
        Alert.alert('Success', 'Worker registered successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }

      console.log('✅ Submission result:', result);
    } catch (error) {
      console.error('❌ Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to save worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Worker' : 'Add New Worker'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode
              ? 'Update worker information'
              : 'Enter worker details to register them in the system'}
          </Text>
        </View>

        {/* ==================== A. PROFILE PHOTO ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Profile Photo" icon="person-circle-outline" />
          <View style={styles.photoContainer}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.gray} />
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePicker}
              disabled={uploadingPhoto}
            >
              <Ionicons name="camera" size={20} color={COLORS.white} />
              <Text style={styles.uploadButtonText}>
                {uploadingPhoto ? 'Uploading...' : profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================== B. PERSONAL INFORMATION ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Personal Information" icon="person-outline" />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormInput
                label="First Name"
                value={formData.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                placeholder="John"
                error={errors.first_name}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <FormInput
                label="Last Name"
                value={formData.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                placeholder="Doe"
                error={errors.last_name}
                required
              />
            </View>
          </View>

          <FormInput
            label="National ID"
            value={formData.national_id}
            onChangeText={(text) => updateField('national_id', text.replace(/[^0-9]/g, ''))}
            placeholder="12345678"
            keyboardType="numeric"
            error={errors.national_id}
            required
          />

          <DropdownPicker
            label="Gender"
            value={formData.gender}
            onSelect={(value) => updateField('gender', value)}
            options={GENDER_OPTIONS}
            error={errors.gender}
          />

          <DatePickerField
            label="Date of Birth"
            value={formData.date_of_birth}
            onChange={(value) => updateField('date_of_birth', value)}
            error={errors.date_of_birth}
          />
        </View>

        {/* ==================== C. CONTACT INFORMATION ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Contact Information" icon="call-outline" />
          
          <FormInput
            label="Phone Number"
            value={formData.phone_number}
            onChangeText={(text) => updateField('phone_number', text)}
            placeholder="+254 700 000 000"
            keyboardType="phone-pad"
            error={errors.phone_number}
            required
          />

          <FormInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <FormInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => updateField('address', text)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
            error={errors.address}
          />
        </View>

        {/* ==================== D. EMPLOYMENT INFORMATION ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Employment Information" icon="briefcase-outline" />
          
          <FormInput
            label="Job Title"
            value={formData.job_title}
            onChangeText={(text) => updateField('job_title', text)}
            placeholder="e.g., Site Engineer, Electrician"
            error={errors.job_title}
            required
          />

          <DropdownPicker
            label="Department"
            value={formData.department}
            onSelect={(value) => updateField('department', value)}
            options={DEPARTMENT_OPTIONS}
            error={errors.department}
          />

          <DropdownPicker
            label="Employment Type"
            value={formData.employment_type}
            onSelect={(value) => updateField('employment_type', value)}
            options={EMPLOYMENT_TYPE_OPTIONS}
            error={errors.employment_type}
            required
          />

          <DropdownPicker
            label="Status"
            value={formData.status}
            onSelect={(value) => updateField('status', value)}
            options={STATUS_OPTIONS}
            error={errors.status}
          />

          <DatePickerField
            label="Hire Date"
            value={formData.hire_date}
            onChange={(value) => updateField('hire_date', value)}
            error={errors.hire_date}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormInput
                label="Daily Rate (KES)"
                value={formData.daily_rate}
                onChangeText={(text) => updateField('daily_rate', text.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.daily_rate}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormInput
                label="Monthly Salary (KES)"
                value={formData.monthly_salary}
                onChangeText={(text) => updateField('monthly_salary', text.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.monthly_salary}
              />
            </View>
          </View>
        </View>

        {/* ==================== E. EMERGENCY CONTACT ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Emergency Contact" icon="alert-circle-outline" />
          
          <FormInput
            label="Contact Name"
            value={formData.emergency_contact_name}
            onChangeText={(text) => updateField('emergency_contact_name', text)}
            placeholder="Full name"
            error={errors.emergency_contact_name}
          />

          <FormInput
            label="Contact Phone"
            value={formData.emergency_contact_phone}
            onChangeText={(text) => updateField('emergency_contact_phone', text)}
            placeholder="+254 700 000 000"
            keyboardType="phone-pad"
            error={errors.emergency_contact_phone}
          />
        </View>

        {/* ==================== F. SUBMIT BUTTON ==================== */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : (
              <>
                <Ionicons name="save" size={22} color={COLORS.white} />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Worker' : 'Save Worker'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: SIZES.padding,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: 15,
    color: COLORS.secondary,
    minHeight: 48,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  // Dropdown Styles
  dropdownButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.secondary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width * 0.85,
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
  },
  optionItemSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray,
  },
  // Date Picker Styles
  datePickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 10,
  },
  datePickerText: {
    fontSize: 15,
    color: COLORS.secondary,
    flex: 1,
  },
  // Photo Upload Styles
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Submit Button Styles
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 15,
    fontWeight: '600',
  },
});