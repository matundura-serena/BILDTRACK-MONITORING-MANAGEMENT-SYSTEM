import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../context/ProjectContext';
import { useWorkers } from '../context/WorkerContext';
import { createMilestone } from '../services/milestoneService';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

export default function AddMilestoneScreen({ navigation, route }) {
  const { projects } = useProjects();
  const { workers } = useWorkers();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [status, setStatus] = useState('Pending');

  const statuses = ['Pending', 'In Progress', 'On Hold'];

  useEffect(() => {
    // Check if projectId was passed from navigation
    if (route.params?.projectId) {
      const project = projects.find(p => p.id === route.params.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [route.params?.projectId, projects]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a milestone title');
      return;
    }
    if (!weight || isNaN(weight) || Number(weight) < 0 || Number(weight) > 100) {
      Alert.alert('Error', 'Weight must be between 0 and 100');
      return;
    }

    try {
      setLoading(true);
      
      const milestoneData = {
        title: title.trim(),
        description: description.trim() || null,
        weight: Number(weight),
        due_date: dueDate || null,
        assigned_worker_id: selectedWorker?.id || null,
        status: status
      };

      await createMilestone(selectedProject.id, milestoneData);
      
      Alert.alert(
        'Success',
        'Milestone created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating milestone:', error);
      Alert.alert('Error', 'Failed to create milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProjectDropdown = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Project *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {projects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.optionChip,
                selectedProject?.id === project.id && styles.optionChipActive
              ]}
              onPress={() => setSelectedProject(project)}
            >
              <Text style={[
                styles.optionChipText,
                selectedProject?.id === project.id && styles.optionChipTextActive
              ]}>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderStatusDropdown = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {statuses.map(statusOption => (
            <TouchableOpacity
              key={statusOption}
              style={[
                styles.optionChip,
                status === statusOption && styles.optionChipActive
              ]}
              onPress={() => setStatus(statusOption)}
            >
              <Text style={[
                styles.optionChipText,
                status === statusOption && styles.optionChipTextActive
              ]}>
                {statusOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderWorkerDropdown = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Assigned Worker (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionChip,
              !selectedWorker && styles.optionChipActive
            ]}
            onPress={() => setSelectedWorker(null)}
          >
            <Text style={[
              styles.optionChipText,
              !selectedWorker && styles.optionChipTextActive
            ]}>
              None
            </Text>
          </TouchableOpacity>
          {workers.map(worker => (
            <TouchableOpacity
              key={worker.id}
              style={[
                styles.optionChip,
                selectedWorker?.id === worker.id && styles.optionChipActive
              ]}
              onPress={() => setSelectedWorker(worker)}
            >
              <Text style={[
                styles.optionChipText,
                selectedWorker?.id === worker.id && styles.optionChipTextActive
              ]}>
                {worker.first_name} {worker.last_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Milestone</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProjectDropdown()}

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <CustomInput
            placeholder="Enter milestone title"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <CustomInput
            placeholder="Enter milestone description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight (%) *</Text>
          <CustomInput
            placeholder="0-100"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.hint}>Weight represents the importance of this milestone (0-100)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <CustomInput
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        {renderStatusDropdown()}
        {renderWorkerDropdown()}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Progress will be automatically calculated based on task completion.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Create Milestone"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 15,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
    fontStyle: 'italic',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  optionChipTextActive: {
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 10,
  },
});