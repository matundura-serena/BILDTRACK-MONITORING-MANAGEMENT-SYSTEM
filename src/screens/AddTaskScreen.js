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
  Dimensions,
 } from 'react-native'; 
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import { useWorkers } from '../context/WorkerContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 📋 CONSTANTS & OPTIONS
// ==========================================

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Blocked', value: 'Blocked' },
  { label: 'On Hold', value: 'On Hold' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
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
        />
      )}
    </View>
  );
};

// ==========================================
// 📱 MAIN ADD TASK SCREEN
// ==========================================

export default function AddTaskScreen({ navigation, route }) {
  const { addTask, updateTask } = useTasks();
  const { projects, getMilestones } = useProjects();
  const { workers } = useWorkers();
  
  const isEditMode = route?.params?.taskId;
  const existingTask = route?.params?.task;
  const projectId = route?.params?.projectId;

  // 📝 FORM STATE
  const [formData, setFormData] = useState({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    project_id: existingTask?.project_id || projectId || '',
    milestone_id: existingTask?.milestone_id || '',
    assigned_worker_id: existingTask?.assigned_worker_id || '',
    status: existingTask?.status || 'Pending',
    priority: existingTask?.priority || 'Medium',
    progress: existingTask?.progress || 0,
    start_date: existingTask?.start_date || '',
    due_date: existingTask?.due_date || '',
    notes: existingTask?.notes || '',
  });

  // 📸 ATTACHMENTS STATE
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ✅ VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 📋 MILESTONES FOR SELECTED PROJECT
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  // 🔄 UPDATE FORM FIELD HELPER
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // 📋 LOAD MILESTONES WHEN PROJECT CHANGES
  useEffect(() => {
    if (formData.project_id) {
      loadMilestones(formData.project_id);
    } else {
      setMilestones([]);
    }
  }, [formData.project_id]);

  const loadMilestones = async (projectId) => {
    try {
      setLoadingMilestones(true);
      const data = await getMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      console.error('❌ Error loading milestones:', error);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // 📸 IMAGE PICKER HANDLER
  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAttachments([...attachments, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (!formData.milestone_id) {
      newErrors.milestone_id = 'Milestone is required';
    }

    if (!formData.assigned_worker_id) {
      newErrors.assigned_worker_id = 'Assigned worker is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    if (formData.start_date && formData.due_date) {
      if (formData.due_date < formData.start_date) {
        newErrors.due_date = 'Due date cannot be before start date';
      }
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    if (formData.status === 'Completed' && formData.progress !== 100) {
      newErrors.progress = 'Completed tasks must have 100% progress';
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

      const taskData = {
        ...formData,
        project_id: parseInt(formData.project_id),
        milestone_id: parseInt(formData.milestone_id),
        assigned_worker_id: parseInt(formData.assigned_worker_id),
        progress: parseInt(formData.progress),
      };

      let result;
      if (isEditMode && existingTask?.id) {
        result = await updateTask(existingTask.id, taskData);
        Alert.alert('Success', 'Task updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        result = await addTask(taskData);
        Alert.alert('Success', 'Task created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }

      console.log('✅ Submission result:', result);
    } catch (error) {
      console.error('❌ Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to save task');
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
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode
              ? 'Update task information'
              : 'Enter task details to create a new task'}
          </Text>
        </View>

        {/* ==================== A. GENERAL INFORMATION ==================== */}
        <View style={styles.section}>
          <SectionHeader title="General Information" icon="information-circle-outline" />
          
          <FormInput
            label="Task Title"
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
            placeholder="Enter task title"
            error={errors.title}
            required
          />

          <FormInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            error={errors.description}
          />
        </View>

        {/* ==================== B. PROJECT ASSIGNMENT ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Project Assignment" icon="business-outline" />
          
          <DropdownPicker
            label="Project"
            value={formData.project_id}
            onSelect={(value) => {
              updateField('project_id', value);
              updateField('milestone_id', ''); // Reset milestone when project changes
            }}
            options={projects.map(p => ({ label: p.name, value: p.id.toString() }))}
            error={errors.project_id}
            required
          />

          <DropdownPicker
            label="Milestone"
            value={formData.milestone_id}
            onSelect={(value) => updateField('milestone_id', value)}
            options={milestones.map(m => ({ label: m.title, value: m.id.toString() }))}
            error={errors.milestone_id}
            required
            disabled={!formData.project_id}
          />
        </View>

        {/* ==================== C. WORKER ASSIGNMENT ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Worker Assignment" icon="person-outline" />
          
          <DropdownPicker
            label="Assigned Worker"
            value={formData.assigned_worker_id}
            onSelect={(value) => updateField('assigned_worker_id', value)}
            options={workers.map(w => ({ 
              label: `${w.first_name} ${w.last_name}`, 
              value: w.id.toString() 
            }))}
            error={errors.assigned_worker_id}
            required
          />
        </View>

        {/* ==================== D. TIMELINE ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Timeline" icon="calendar-outline" />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <DatePickerField
                label="Start Date"
                value={formData.start_date}
                onChange={(value) => updateField('start_date', value)}
                error={errors.start_date}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <DatePickerField
                label="Due Date"
                value={formData.due_date}
                onChange={(value) => updateField('due_date', value)}
                error={errors.due_date}
                required
              />
            </View>
          </View>
        </View>

        {/* ==================== E. STATUS & PRIORITY ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Status & Priority" icon="options-outline" />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <DropdownPicker
                label="Status"
                value={formData.status}
                onSelect={(value) => {
                  updateField('status', value);
                  if (value === 'Completed') {
                    updateField('progress', 100);
                  }
                }}
                options={STATUS_OPTIONS}
                error={errors.status}
              />
            </View>
            <View style={styles.halfWidth}>
              <DropdownPicker
                label="Priority"
                value={formData.priority}
                onSelect={(value) => updateField('priority', value)}
                options={PRIORITY_OPTIONS}
                error={errors.priority}
              />
            </View>
          </View>
        </View>

        {/* ==================== F. PROGRESS ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Progress" icon="trending-up-outline" />
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Task Progress</Text>
              <Text style={styles.progressValue}>{Math.round(formData.progress)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={formData.progress}
              onValueChange={(value) => updateField('progress', value)}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={COLORS.primary}
              disabled={formData.status === 'Completed'}
            />
            {errors.progress && <Text style={styles.errorText}>{errors.progress}</Text>}
          </View>
        </View>

        {/* ==================== G. NOTES ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Notes" icon="document-text-outline" />
          
          <FormInput
            label="Additional Notes"
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="Enter any additional notes or instructions"
            multiline
            numberOfLines={4}
            error={errors.notes}
          />
        </View>

        {/* ==================== H. ATTACHMENTS ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Attachments" icon="attach-outline" />
          
          <TouchableOpacity style={styles.attachButton} onPress={handleImagePicker}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
            <Text style={styles.attachButtonText}>Add Photo</Text>
          </TouchableOpacity>

          {attachments.length > 0 && (
            <View style={styles.attachmentsPreview}>
              {attachments.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.attachmentPreview} />
              ))}
            </View>
          )}
        </View>

        {/* ==================== I. SUBMIT BUTTON ==================== */}
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
                  {isEditMode ? 'Update Task' : 'Create Task'}
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
  // Progress Slider
  progressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  // Attachments
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  attachButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  attachmentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  // Submit Button
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