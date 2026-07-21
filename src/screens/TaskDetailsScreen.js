import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import { useWorkers } from '../context/WorkerContext';
import { COLORS, SIZES } from '../constants/theme';

// ==========================================
// 🎨 REUSABLE UI COMPONENTS
// ==========================================

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10B981';
      case 'In Progress':
        return '#3B82F6';
      case 'Pending':
        return '#F59E0B';
      case 'On Hold':
        return '#F59E0B';
      case 'Blocked':
        return '#6B7280';
      case 'Overdue':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
};

const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return '#DC2626';
      case 'High':
        return '#EF4444';
      case 'Medium':
        return '#F59E0B';
      case 'Low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) + '20' }]}>
      <Text style={[styles.priorityText, { color: getPriorityColor(priority) }]}>
        {priority || 'N/A'}
      </Text>
    </View>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  </View>
);

const SectionCard = ({ title, icon, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// ==========================================
// 📱 MAIN TASK DETAILS SCREEN
// ==========================================

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId, task: initialTask, showProgress } = route.params || {};
  const { getTask, updateTaskProgress, completeTask, deleteTask } = useTasks();
  const { getProject } = useProjects();
  const { getWorker } = useWorkers();

  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [project, setProject] = useState(null);
  const [worker, setWorker] = useState(null);

  // Load task details if not provided
  useEffect(() => {
    if (!initialTask && taskId) {
      loadTask();
    }
  }, [taskId, initialTask]);

  // Load related data
  useEffect(() => {
    if (task) {
      loadRelatedData();
    }
  }, [task]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await getTask(taskId);
      setTask(data);
    } catch (error) {
      console.error('❌ Error loading task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      if (task?.project_id) {
        const proj = await getProject(task.project_id);
        setProject(proj);
      }
      if (task?.assigned_worker_id) {
        const wrk = await getWorker(task.assigned_worker_id);
        setWorker(wrk);
      }
    } catch (error) {
      console.error('❌ Error loading related data:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddTask', { taskId: task.id, task });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleProgressUpdate = async (newProgress) => {
    try {
      setUpdatingProgress(true);
      const updated = await updateTaskProgress(task.id, newProgress);
      setTask(updated);
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleComplete = async () => {
    Alert.alert(
      'Complete Task',
      `Mark "${task.title}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const completed = await completeTask(task.id);
              setTask(completed);
              Alert.alert('Success', 'Task completed successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to complete task');
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

  const calculateDaysRemaining = () => {
    if (!task?.due_date || task.status === 'Completed') return null;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDaysElapsed = () => {
    if (!task?.start_date) return null;
    const today = new Date();
    const startDate = new Date(task.start_date);
    const diffTime = today - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10B981';
      case 'In Progress':
        return '#3B82F6';
      case 'Pending':
        return '#F59E0B';
      case 'On Hold':
        return '#F59E0B';
      case 'Blocked':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const isOverdue = () => {
    if (!task?.due_date || task.status === 'Completed') return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The task information could not be loaded.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const daysRemaining = calculateDaysRemaining();
  const daysElapsed = calculateDaysElapsed();
  const overdue = isOverdue();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerBadges}>
            <StatusBadge status={overdue ? 'Overdue' : task.status} />
            <PriorityBadge priority={task.priority} />
          </View>
        </View>
        <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Header Card */}
        <View style={styles.taskHeaderCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          
          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={[styles.progressPercentage, { color: getProgressColor(task.status) }]}>
                {task.progress || 0}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${task.progress || 0}%`,
                    backgroundColor: getProgressColor(task.status),
                  },
                ]}
              />
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            {daysElapsed !== null && (
              <View style={styles.quickStatItem}>
                <Ionicons name="time" size={24} color="#F59E0B" />
                <Text style={styles.quickStatValue}>{daysElapsed}</Text>
                <Text style={styles.quickStatLabel}>Days Elapsed</Text>
              </View>
            )}
            {daysRemaining !== null && (
              <View style={styles.quickStatItem}>
                <Ionicons name="calendar" size={24} color={overdue ? '#EF4444' : COLORS.primary} />
                <Text style={[styles.quickStatValue, overdue && styles.overdueText]}>
                  {daysRemaining}
                </Text>
                <Text style={styles.quickStatLabel}>Days Left</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {task.status !== 'Completed' && (
            <>
              <TouchableOpacity style={styles.progressButton} onPress={handleComplete}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.progressButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* General Information Section */}
        <SectionCard title="General Information" icon="information-circle-outline">
          <DetailRow
            icon="business"
            label="Project"
            value={project?.name || task.project_name}
          />
          <DetailRow
            icon="flag"
            label="Milestone"
            value={task.milestone_title}
          />
          <DetailRow
            icon="person"
            label="Assigned Worker"
            value={worker ? `${worker.first_name} ${worker.last_name}` : task.worker_name}
          />
          <DetailRow
            icon="pricetag"
            label="Priority"
            value={task.priority}
          />
          <DetailRow
            icon="checkmark-circle"
            label="Status"
            value={task.status}
          />
          {task.description && (
            <View style={styles.descriptionRow}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          )}
        </SectionCard>

        {/* Timeline Section */}
        <SectionCard title="Timeline" icon="calendar-outline">
          <DetailRow
            icon="create-outline"
            label="Created Date"
            value={formatDate(task.created_at)}
          />
          <DetailRow
            icon="play-circle-outline"
            label="Start Date"
            value={formatDate(task.start_date)}
          />
          <DetailRow
            icon="calendar"
            label="Due Date"
            value={formatDate(task.due_date)}
          />
          {task.completed_at && (
            <DetailRow
              icon="checkmark-done"
              label="Completion Date"
              value={formatDate(task.completed_at)}
            />
          )}
        </SectionCard>

        {/* Progress Update Section */}
        {showProgress && task.status !== 'Completed' && (
          <SectionCard title="Update Progress" icon="trending-up-outline">
            <View style={styles.progressUpdateContainer}>
              <View style={styles.progressUpdateHeader}>
                <Text style={styles.progressUpdateLabel}>Current Progress</Text>
                <Text style={styles.progressUpdateValue}>{task.progress || 0}%</Text>
              </View>
              <View style={styles.progressButtons}>
                {[25, 50, 75, 100].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.progressButton,
                      task.progress === value && styles.progressButtonActive,
                    ]}
                    onPress={() => handleProgressUpdate(value)}
                    disabled={updatingProgress}
                  >
                    <Text
                      style={[
                        styles.progressButtonText,
                        task.progress === value && styles.progressButtonTextActive,
                      ]}
                    >
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {updatingProgress && (
                <View style={styles.updatingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.updatingText}>Updating...</Text>
                </View>
              )}
            </View>
          </SectionCard>
        )}

        {/* Notes Section */}
        {task.notes && (
          <SectionCard title="Notes" icon="document-text-outline">
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{task.notes}</Text>
            </View>
          </SectionCard>
        )}

        {/* Attachments Section */}
        {task.attachment_url && (
          <SectionCard title="Attachments" icon="attach-outline">
            <View style={styles.attachmentsContainer}>
              <Image source={{ uri: task.attachment_url }} style={styles.attachmentImage} />
            </View>
          </SectionCard>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
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
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 4,
  },
  content: {
    padding: SIZES.padding,
  },
  // Task Header Card
  taskHeaderCard: {
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
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 20,
  },
  // Progress Section
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  overdueText: {
    color: '#EF4444',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  progressButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  progressButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Section Card
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  sectionContent: {
    padding: 16,
  },
  // Detail Row
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '600',
    lineHeight: 20,
  },
  // Description
  descriptionRow: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Priority Badge
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Progress Update
  progressUpdateContainer: {
    gap: 16,
  },
  progressUpdateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressUpdateLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  progressUpdateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  progressButtonTextActive: {
    color: COLORS.white,
  },
  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  updatingText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Notes
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  // Attachments
  attachmentsContainer: {
    alignItems: 'center',
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
});