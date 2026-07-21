import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../context/WorkerContext';
import { useProjects } from '../context/ProjectContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 📱 MAIN ASSIGN WORKER SCREEN
// ==========================================

export default function AssignWorkerScreen({ route, navigation }) {
  const { projectId, project } = route.params || {};
  const { workers, loading: workersLoading, getWorkers } = useWorkers();
  const { 
    getProject,
    getAssignedWorkers, 
    getAvailableWorkers, 
    assignWorkersToProject, 
    removeWorkerFromProject,
    loading: projectsLoading 
  } = useProjects();

  const [projectData, setProjectData] = useState(project || null);
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [saving, setSaving] = useState(false);

  // 🚀 LOAD DATA
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load project details if not provided
      if (!projectData && projectId) {
        const project = await getProject(projectId);
        setProjectData(project);
      }

      // Load workers list
      await getWorkers();

      // Load assigned and available workers
      if (projectId) {
        await Promise.all([
          loadAssignedWorkers(projectId),
          loadAvailableWorkers(projectId)
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedWorkers = async (projectId) => {
    try {
      const workers = await getAssignedWorkers(projectId);
      setAssignedWorkers(Array.isArray(workers) ? workers : []);
    } catch (error) {
      console.error('❌ Error loading assigned workers:', error);
      setAssignedWorkers([]);
    }
  };

  const loadAvailableWorkers = async (projectId) => {
    try {
      const workers = await getAvailableWorkers(projectId);
      setAvailableWorkers(Array.isArray(workers) ? workers : []);
    } catch (error) {
      console.error('❌ Error loading available workers:', error);
      setAvailableWorkers([]);
    }
  };

  // ✅ ASSIGN SELECTED WORKERS
  const handleAssignWorkers = async () => {
    if (!projectId || selectedWorkers.length === 0) {
      Alert.alert('Error', 'Please select at least one worker');
      return;
    }

    Alert.alert(
      'Assign Workers',
      `Assign ${selectedWorkers.length} worker(s) to ${projectData?.name || 'this project'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            try {
              setSaving(true);
              const result = await assignWorkersToProject(projectId, selectedWorkers);
              
              Alert.alert(
                'Success', 
                result.message || `Successfully assigned ${selectedWorkers.length} worker(s)`
              );
              
              // Clear selection
              setSelectedWorkers([]);
              
              // Refresh lists
              await Promise.all([
                loadAssignedWorkers(projectId),
                loadAvailableWorkers(projectId)
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to assign workers');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // ❌ REMOVE WORKER
  const handleRemoveWorker = (worker) => {
    Alert.alert(
      'Remove Worker',
      `Remove ${worker.first_name} ${worker.last_name} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await removeWorkerFromProject(worker.id);
              
              Alert.alert('Success', 'Worker removed from project');
              
              // Refresh lists
              await Promise.all([
                loadAssignedWorkers(projectId),
                loadAvailableWorkers(projectId)
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to remove worker');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // 🔄 TOGGLE WORKER SELECTION
  const toggleWorkerSelection = (workerId) => {
    setSelectedWorkers(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        return [...prev, workerId];
      }
    });
  };

  // 📊 RENDER ASSIGNED WORKER
  const renderAssignedWorker = ({ item }) => (
    <View style={styles.workerCard}>
      <View style={styles.workerInfo}>
        <View style={styles.workerAvatar}>
          <Text style={styles.workerAvatarText}>
            {item.first_name[0]}{item.last_name[0]}
          </Text>
        </View>
        <View style={styles.workerDetails}>
          <Text style={styles.workerName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.workerJobTitle}>{item.job_title}</Text>
          <Text style={styles.workerDepartment}>{item.department}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveWorker(item)}
        disabled={saving}
      >
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  // 📊 RENDER AVAILABLE WORKER
  const renderAvailableWorker = ({ item }) => {
    const isSelected = selectedWorkers.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.workerCard, isSelected && styles.workerCardSelected]}
        onPress={() => toggleWorkerSelection(item.id)}
        disabled={saving}
      >
        <View style={styles.workerInfo}>
          <View style={[styles.workerAvatar, isSelected && styles.workerAvatarSelected]}>
            <Text style={[styles.workerAvatarText, isSelected && styles.workerAvatarTextSelected]}>
              {item.first_name[0]}{item.last_name[0]}
            </Text>
          </View>
          <View style={styles.workerDetails}>
            <Text style={styles.workerName}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={styles.workerJobTitle}>{item.job_title}</Text>
            <Text style={styles.workerDepartment}>{item.department}</Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assign Workers</Text>
          <Text style={styles.headerSubtitle}>
            {projectData?.name || 'Project'}
          </Text>
        </View>
        {selectedWorkers.length > 0 && (
          <TouchableOpacity 
            style={styles.assignButton} 
            onPress={handleAssignWorkers}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
            <Text style={styles.assignButtonText}>
              Assign ({selectedWorkers.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Assigned Workers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Assigned Workers</Text>
          <Text style={styles.sectionCount}>({assignedWorkers.length})</Text>
        </View>
        
        {assignedWorkers.length > 0 ? (
          <FlatList
            data={assignedWorkers}
            renderItem={renderAssignedWorker}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No workers assigned yet</Text>
          </View>
        )}
      </View>

      {/* Available Workers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Available Workers</Text>
          <Text style={styles.sectionCount}>({availableWorkers.length})</Text>
        </View>

        {workersLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : availableWorkers.length > 0 ? (
          <FlatList
            data={availableWorkers}
            renderItem={renderAvailableWorker}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No available workers</Text>
          </View>
        )}
      </View>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  workerCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#EEF2FF',
  },
  workerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerAvatarSelected: {
    backgroundColor: COLORS.primary,
  },
  workerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  workerAvatarTextSelected: {
    color: COLORS.white,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  workerJobTitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
  },
  workerDepartment: {
    fontSize: 12,
    color: COLORS.gray,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  savingText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});