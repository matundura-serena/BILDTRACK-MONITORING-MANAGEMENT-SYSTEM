import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMilestoneById, getMilestoneTasks, deleteMilestone } from '../services/milestoneService';
import { COLORS, SIZES } from '../constants/theme';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

export default function MilestoneDetailsScreen({ navigation, route }) {
  const { milestoneId } = route.params;
  const [milestone, setMilestone] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMilestoneDetails();
  }, [milestoneId]);

  const fetchMilestoneDetails = async () => {
    try {
      setLoading(true);
      const [milestoneData, tasksData] = await Promise.all([
        getMilestoneById(milestoneId),
        getMilestoneTasks(milestoneId)
      ]);
      setMilestone(milestoneData);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('❌ Error fetching milestone details:', error);
      Alert.alert('Error', 'Failed to load milestone details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteMilestone(milestoneId);
      Alert.alert(
        'Success',
        'Milestone deleted successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error deleting milestone:', error);
      Alert.alert('Error', 'Failed to delete milestone');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Pending': return '#F59E0B';
      case 'On Hold': return '#EF4444';
      case 'Cancelled': return '#6B7280';
      default: return COLORS.gray;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Completed': return '#D1FAE5';
      case 'In Progress': return '#DBEAFE';
      case 'Pending': return '#FEF3C7';
      case 'On Hold': return '#FEE2E2';
      case 'Cancelled': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Pending': return '#F59E0B';
      case 'Blocked': return '#EF4444';
      case 'On Hold': return '#6B7280';
      default: return COLORS.gray;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading milestone details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!milestone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorText}>Milestone not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milestone Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Milestone Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(milestone.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(milestone.status) }]}>
                {milestone.status}
              </Text>
            </View>
          </View>

          {milestone.project_name && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>Project:</Text>
              <Text style={styles.infoValue}>{milestone.project_name}</Text>
            </View>
          )}

          {milestone.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{milestone.description}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{milestone.weight || 0}%</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{milestone.progress || 0}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {milestone.completed_tasks || 0}/{milestone.total_tasks || 0}
              </Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
          </View>

          {milestone.due_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>Due Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(milestone.due_date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}

          {milestone.assigned_worker_name && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>Assigned Worker:</Text>
              <Text style={styles.infoValue}>{milestone.assigned_worker_name}</Text>
            </View>
          )}

          {milestone.completed_at && (
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text style={styles.infoLabel}>Completed:</Text>
              <Text style={styles.infoValue}>
                {new Date(milestone.completed_at).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercentage}>{milestone.progress || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${milestone.progress || 0}%` }]} />
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Tasks</Text>
            <TouchableOpacity 
              style={styles.addTaskButton}
              onPress={() => navigation.navigate('AddTask', { 
                projectId: milestone.project_id,
                milestoneId: milestone.id 
              })}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Ionicons name="clipboard-outline" size={48} color={COLORS.gray} />
              <Text style={styles.noTasksText}>No tasks yet</Text>
              <Text style={styles.noTasksSubtext}>Add tasks to track milestone progress</Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {tasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                >
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <View style={[styles.taskStatusBadge, { backgroundColor: getTaskStatusColor(task.status) + '20' }]}>
                      <Text style={[styles.taskStatusText, { color: getTaskStatusColor(task.status) }]}>
                        {task.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskFooter}>
                    <View style={styles.taskWorker}>
                      <Ionicons name="person-outline" size={14} color={COLORS.gray} />
                      <Text style={styles.taskWorkerText} numberOfLines={1}>
                        {task.worker_name}
                      </Text>
                    </View>
                    <Text style={styles.taskProgress}>{task.progress || 0}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="Edit Milestone"
            onPress={() => navigation.navigate('AddMilestone', { milestoneId: milestone.id })}
            style={styles.editButton}
          />
          <CustomButton
            title="Delete Milestone"
            onPress={handleDelete}
            loading={deleting}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 16,
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
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  tasksSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addTaskText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTasksText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  noTasksSubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginRight: 8,
  },
  taskStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskWorker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  taskWorkerText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  taskProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '700',
  },
});
