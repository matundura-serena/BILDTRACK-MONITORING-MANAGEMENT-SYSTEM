import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../context/ProjectContext';
import { useWorkers } from '../context/WorkerContext';
import * as workerAssignmentService from '../services/workerAssignmentService';
import { COLORS, SIZES } from '../constants/theme';

// ==========================================
// 📱 MAIN PROJECT DETAILS SCREEN
// ==========================================

export default function ProjectDetailsScreen({ route, navigation }) {
  const { project } = route.params || {};
  const { getProject, deleteProject, getProjectAssignments, assignWorkerToProject, removeWorkerFromProject } = useProjects();
  const { workers, getWorkers } = useWorkers();
  
  const [projectData, setProjectData] = useState(project || null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [showAssignWorkerModal, setShowAssignWorkerModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Load project details and assignments
  useEffect(() => {
    if (project) {
      setProjectData(project);
      loadAssignments(project.id);
    }
  }, [project]);

  const loadAssignments = async (projectId) => {
    try {
      setLoadingAssignments(true);
      const data = await getProjectAssignments(projectId, 'Active');
      setAssignments(data);
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddProject', { projectId: projectData.id, project: projectData });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete ${projectData.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(projectData.id);
              Alert.alert('Success', 'Project deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleAssignWorker = () => {
    setShowAssignWorkerModal(true);
  };

  const confirmAssignWorker = async () => {
    if (!selectedWorker) {
      Alert.alert('Error', 'Please select a worker');
      return;
    }

    try {
      setLoading(true);
      await assignWorkerToProject(projectData.id, selectedWorker.id, 'General Worker');
      Alert.alert('Success', `Worker assigned to ${projectData.name}`);
      setShowAssignWorkerModal(false);
      setSelectedWorker(null);
      await loadAssignments(projectData.id);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to assign worker');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWorker = async (assignment) => {
    Alert.alert(
      'Remove Worker',
      `Remove ${assignment.worker_name} from this project?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWorkerFromProject(assignment.id);
              Alert.alert('Success', 'Worker removed from project');
              await loadAssignments(projectData.id);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to remove worker');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'Not provided';
    return `KES ${parseFloat(value).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'Pending':
        return '#F59E0B';
      case 'Completed':
        return '#3B82F6';
      case 'Delayed':
        return '#EF4444';
      case 'Cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#EF4444';
      case 'High':
        return '#F59E0B';
      case 'Medium':
        return '#3B82F6';
      case 'Low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (!projectData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header */}
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleSection}>
            <Text style={styles.projectName}>{projectData.name}</Text>
            <View style={styles.projectMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(projectData.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(projectData.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(projectData.status) }]}>
                  {projectData.status}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(projectData.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(projectData.priority) }]}>
                  {projectData.priority}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.assignButton} onPress={handleAssignWorker}>
            <Ionicons name="people-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Assign Worker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Project Progress</Text>
            <Text style={styles.progressValue}>{projectData.progress || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${projectData.progress || 0}%` }]} />
          </View>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{projectData.description || 'No description'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Client</Text>
              <Text style={styles.infoValue}>{projectData.client_name || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{projectData.location || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project Manager</Text>
              <Text style={styles.infoValue}>{projectData.project_manager || 'Not assigned'}</Text>
            </View>
          </View>
        </View>

        {/* Dates & Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline & Budget</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>{formatDate(projectData.start_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Completion</Text>
              <Text style={styles.infoValue}>{formatDate(projectData.expected_completion_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.infoValue}>{formatCurrency(projectData.budget)}</Text>
            </View>
          </View>
        </View>

        {/* Assigned Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Workers</Text>
            <Text style={styles.sectionCount}>({assignments.length})</Text>
          </View>
          
          {loadingAssignments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : assignments.length > 0 ? (
            <View style={styles.assignmentsList}>
              {assignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.assignmentHeader}>
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerName}>{assignment.worker_name}</Text>
                      <Text style={styles.workerRole}>{assignment.role}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveWorker(assignment)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.assignmentDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="call-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.detailText}>{assignment.worker_phone || 'No phone'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="mail-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.detailText}>{assignment.worker_email || 'No email'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.detailText}>
                        Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No workers assigned yet</Text>
              <TouchableOpacity style={styles.assignButton} onPress={handleAssignWorker}>
                <Text style={styles.assignButtonText}>Assign Worker</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Assign Worker Modal */}
      {showAssignWorkerModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Worker</Text>
            
            <ScrollView style={styles.workerList}>
              {workers.map((worker) => (
                <TouchableOpacity
                  key={worker.id}
                  style={[
                    styles.workerItem,
                    selectedWorker?.id === worker.id && styles.workerItemSelected,
                  ]}
                  onPress={() => setSelectedWorker(worker)}
                >
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>
                      {worker.first_name} {worker.last_name}
                    </Text>
                    <Text style={styles.workerJobTitle}>{worker.job_title}</Text>
                    <Text style={styles.workerDepartment}>{worker.department}</Text>
                  </View>
                  {selectedWorker?.id === worker.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAssignWorkerModal(false);
                  setSelectedWorker(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmAssignWorker}
                disabled={!selectedWorker}
              >
                <Text style={styles.confirmButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    padding: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Project Header
  projectHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  projectTitleSection: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 14,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  assignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Progress Section
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  // Section
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '600',
    lineHeight: 20,
  },
  // Assignments
  assignmentsList: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  workerRole: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  assignmentDetails: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
    marginBottom: 16,
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  workerList: {
    maxHeight: 400,
  },
  workerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  workerItemSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  workerJobTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  workerDepartment: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});