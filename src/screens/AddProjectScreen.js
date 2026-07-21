import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useProjects } from '../context/ProjectContext';
import { COLORS } from '../constants/theme';

// Standardized project payload
const STANDARD_PAYLOAD = {
  name: '',
  description: '',
  status: 'Pending',
  location: '',
  priority: 'Medium',
  progress: 0,
  start_date: null,
  expected_completion_date: null,
  client_name: '',
  project_manager: ''
};

export default function AddProjectScreen({ navigation, route }) {
  const { addProject, updateProject } = useProjects();
  const isEditMode = route.params?.projectId != null;
  const existingProject = route.params?.project || null;
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (isEditMode && existingProject) {
      return {
        name: existingProject.name || '',
        description: existingProject.description || '',
        status: existingProject.status || 'Planning',
        location: existingProject.location || '',
        priority: existingProject.priority || 'Medium',
        progress: existingProject.progress ?? 0,
        start_date: existingProject.start_date || null,
        expected_completion_date: existingProject.expected_completion_date || null,
        client_name: existingProject.client_name || '',
        project_manager: existingProject.project_manager || ''
      };
    }
    return { ...STANDARD_PAYLOAD };
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Project name is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Project location is required');
      return false;
    }
    if (!formData.start_date) {
      Alert.alert('Validation Error', 'Start date is required');
      return false;
    }
    if (!formData.expected_completion_date) {
      Alert.alert('Validation Error', 'Expected completion date is required');
      return false;
    }
    if (formData.progress < 0 || formData.progress > 100) {
      Alert.alert('Validation Error', 'Progress must be between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        location: formData.location.trim(),
        priority: formData.priority,
        progress: Number(formData.progress),
        start_date: formData.start_date?.trim() || null,
        expected_completion_date: formData.expected_completion_date?.trim() || null,
        client_name: formData.client_name.trim() || null,
        project_manager: formData.project_manager.trim() || null
      };

      if (isEditMode && existingProject) {
        await updateProject(existingProject.id, payload);
        Alert.alert('Success', 'Project updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await addProject(payload);
        Alert.alert('Success', 'Project created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Project Information */}
        <Text style={styles.sectionHeader}>Project Information</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Project Name *" 
          value={formData.name} 
          onChangeText={(text) => updateField('name', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Status" 
          value={formData.status} 
          onChangeText={(text) => updateField('status', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Description" 
          value={formData.description} 
          onChangeText={(text) => updateField('description', text)} 
          multiline 
          numberOfLines={3} 
          placeholderTextColor="#8E8E93" 
        />

        {/* Location & Priority */}
        <Text style={styles.sectionHeader}>Location & Priority</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Project Location *" 
          value={formData.location} 
          onChangeText={(text) => updateField('location', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Priority (Low, Medium, High, Critical)" 
          value={formData.priority} 
          onChangeText={(text) => updateField('priority', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Progress (0-100)" 
          value={formData.progress.toString()} 
          onChangeText={(text) => updateField('progress', text)} 
          placeholderTextColor="#8E8E93" 
          keyboardType="numeric"
        />

        {/* Timeline */}
        <Text style={styles.sectionHeader}>Timeline</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Start Date (YYYY-MM-DD) *" 
          value={formData.start_date || ''} 
          onChangeText={(text) => updateField('start_date', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Expected Completion Date (YYYY-MM-DD) *" 
          value={formData.expected_completion_date || ''} 
          onChangeText={(text) => updateField('expected_completion_date', text)} 
          placeholderTextColor="#8E8E93" 
        />

        {/* Client & Manager */}
        <Text style={styles.sectionHeader}>Client & Manager</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Client Name" 
          value={formData.client_name} 
          onChangeText={(text) => updateField('client_name', text)} 
          placeholderTextColor="#8E8E93" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Project Manager" 
          value={formData.project_manager} 
          onChangeText={(text) => updateField('project_manager', text)} 
          placeholderTextColor="#8E8E93" 
        />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={submitting}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: COLORS.primary || '#FF6B00' }]} 
            onPress={handleSubmit} 
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.createButtonText}>
                {isEditMode ? 'Update Project' : 'Create Project'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { padding: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginTop: 16, marginBottom: 10 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 12, fontSize: 15, color: '#1C1C1E', marginBottom: 12 },
  textArea: { height: 70, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingBottom: 20 },
  cancelButton: { flex: 1, paddingVertical: 14, alignItems: 'center', marginRight: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  cancelButtonText: { color: '#FF3B30', fontWeight: '600', fontSize: 15 },
  createButton: { flex: 2, paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  createButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});