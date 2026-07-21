import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import { useWorkers } from '../context/WorkerContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 📋 CONSTANTS & OPTIONS
// ==========================================

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Blocked', value: 'Blocked' },
  { label: 'On Hold', value: 'On Hold' },
];

const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
];

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

const TaskCard = ({ task, onView, onEdit, onProgress, onComplete }) => {
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

  const isOverdue = () => {
    if (!task.due_date || task.status === 'Completed') return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  };

  return (
    <View style={styles.taskCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.badgesRow}>
            <StatusBadge status={isOverdue() ? 'Overdue' : task.status} />
            <PriorityBadge priority={task.priority} />
          </View>
        </View>
      </View>

      {/* Task Details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{task.project_name || 'No project'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{task.milestone_title || 'No milestone'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{task.worker_name || 'Unassigned'}</Text>
        </View>

        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dateText}>
              Start: {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="alarm-outline" size={14} color={isOverdue() ? '#EF4444' : COLORS.gray} />
            <Text style={[styles.dateText, isOverdue() && styles.overdueText]}>
              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressPercentage, { color: getStatusColor(task.status) }]}>
              {task.progress || 0}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${task.progress || 0}%`,
                  backgroundColor: getStatusColor(task.status),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(task)}
        >
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="pencil-outline" size={18} color="#F59E0B" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        {task.status !== 'Completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.progressButton]}
            onPress={() => onProgress(task)}
          >
            <Ionicons name="trending-up-outline" size={18} color="#10B981" />
            <Text style={styles.progressButtonText}>Progress</Text>
          </TouchableOpacity>
        )}

        {task.status !== 'Completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onComplete(task)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const FilterDropdown = ({ label, value, onSelect, options, icon }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name={icon} size={18} color={COLORS.gray} />
        <Text style={styles.filterButtonText} numberOfLines={1}>
          {value || label}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
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
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ==========================================
// 📱 MAIN TASKS SCREEN
// ==========================================

export default function TasksScreen({ navigation }) {
  const { tasks, loading, taskStats, getTasks, deleteTask } = useTasks();
  const { projects } = useProjects();
  const { workers } = useWorkers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (params = {}) => {
    try {
      await getTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimeout);
    const searchTimeout = setTimeout(() => {
      loadTasks();
    }, 500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleDelete = (task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleView = (task) => {
    navigation.navigate('TaskDetails', { taskId: task.id, task });
  };

  const handleEdit = (task) => {
    navigation.navigate('AddTask', { taskId: task.id, task });
  };

  const handleProgress = (task) => {
    navigation.navigate('TaskDetails', { taskId: task.id, task, showProgress: true });
  };

  const handleComplete = async (task) => {
    Alert.alert(
      'Complete Task',
      `Mark "${task.title}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await useTasks().completeTask(task.id);
              Alert.alert('Success', 'Task completed successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to complete task');
            }
          },
        },
      ]
    );
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    loadTasks();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Tasks Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter || priorityFilter
          ? 'Try adjusting your search or filters'
          : 'Get started by creating your first task'}
      </Text>
      {!searchQuery && !statusFilter && !priorityFilter && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddTask}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Create Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTaskCard = ({ item }) => (
    <TaskCard
      task={item}
      onView={handleView}
      onEdit={handleEdit}
      onProgress={handleProgress}
      onComplete={handleComplete}
    />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Dashboard Stats */}
      {taskStats && (
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { borderLeftColor: COLORS.primary }]}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {taskStats.total || 0}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#F59E0B' }]}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {taskStats.pending || 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#3B82F6' }]}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {taskStats.in_progress || 0}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#10B981' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {taskStats.completed || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {taskStats && (taskStats.overdue > 0 || taskStats.high_priority > 0) && (
        <View style={styles.alertRow}>
          {taskStats.overdue > 0 && (
            <View style={[styles.alertItem, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={[styles.alertText, { color: '#EF4444' }]}>
                {taskStats.overdue} Overdue
              </Text>
            </View>
          )}
          {taskStats.high_priority > 0 && (
            <View style={[styles.alertItem, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={[styles.alertText, { color: '#F59E0B' }]}>
                {taskStats.high_priority} High Priority
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onSelect={setStatusFilter}
          options={STATUS_OPTIONS}
          icon="checkmark-circle-outline"
        />
        
        <FilterDropdown
          label="Priority"
          value={priorityFilter}
          onSelect={setPriorityFilter}
          options={PRIORITY_OPTIONS}
          icon="flag-outline"
        />

        {(statusFilter || priorityFilter) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Ionicons name="funnel-outline" size={18} color={COLORS.primary} />
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>Manage construction tasks</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id?.toString()}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={tasks.length === 0 ? styles.emptyListContent : styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  exportButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  listContent: {
    padding: SIZES.padding,
  },
  emptyListContent: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 16,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  // Alert Row
  alertRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  alertItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
  },
  // Filter Styles
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterContainer: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 6,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    justifyContent: 'center',
  },
  clearFiltersText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Results Count
  resultsCount: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  resultsCountText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Task Card Styles
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  // Priority Badge
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Card Body
  cardBody: {
    padding: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.gray,
    flex: 1,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  // Progress Section
  progressSection: {
    marginTop: 12,
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
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Card Actions
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  viewButton: {
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  progressButton: {
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  progressButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  // Loading State
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
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // Modal Styles
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
});