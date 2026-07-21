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
import { useProjects } from '../context/ProjectContext';
import { COLORS, SIZES } from '../constants/theme';
import { exportProjects } from '../services/projectService';

const { width } = Dimensions.get('window');

// ==========================================
// 📋 CONSTANTS & OPTIONS
// ==========================================

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'Active' },
  { label: 'Planning', value: 'Planning' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Delayed', value: 'Delayed' },
];

const PRIORITY_OPTIONS = [
  { label: 'All Priorities', value: '' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

// ==========================================
// 🎨 REUSABLE UI COMPONENTS
// ==========================================

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'Completed':
        return '#3B82F6';
      case 'Planning':
        return '#F59E0B';
      case 'On Hold':
        return '#F59E0B';
      case 'Delayed':
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

const ProjectCard = ({ project, onView, onEdit, onProgress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'Completed':
        return '#3B82F6';
      case 'Planning':
        return '#F59E0B';
      case 'On Hold':
        return '#F59E0B';
      case 'Delayed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.projectCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={styles.badgesRow}>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={[styles.progressPercentage, { color: getStatusColor(project.status) }]}>
            {project.progress || 0}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${project.progress || 0}%`,
                backgroundColor: getStatusColor(project.status),
              },
            ]}
          />
        </View>
      </View>

      {/* Project Details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{project.location || 'No location'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{project.project_manager || 'No manager'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No start date'}
          </Text>
        </View>

        <View style={styles.milestonesRow}>
          <View style={styles.milestoneItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={styles.milestoneText}>
              {project.completed_milestones || 0} Completed
            </Text>
          </View>
          <View style={styles.milestoneItem}>
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text style={styles.milestoneText}>
              {project.remaining_milestones || 0} Remaining
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(project)}
        >
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(project)}
        >
          <Ionicons name="pencil-outline" size={18} color="#F59E0B" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.progressButton]}
          onPress={() => onProgress(project)}
        >
          <Ionicons name="trending-up-outline" size={18} color="#10B981" />
          <Text style={styles.progressButtonText}>Progress</Text>
        </TouchableOpacity>
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
// 📱 MAIN PROJECTS SCREEN
// ==========================================

export default function ProjectsScreen({ navigation }) {
  const { projects, loading, projectStats, getProjects, deleteProject } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (params = {}) => {
    await getProjects({
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimeout);
    const searchTimeout = setTimeout(() => {
      loadProjects();
    }, 500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDelete = (project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
              Alert.alert('Success', 'Project deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleView = (project) => {
    navigation.navigate('ProjectDetails', { projectId: project.id, project });
  };

  const handleEdit = (project) => {
    navigation.navigate('AddProject', { projectId: project.id, project });
  };

  const handleProgress = (project) => {
    navigation.navigate('ProjectDetails', { projectId: project.id, project, showMilestones: true });
  };

  const handleAddProject = () => {
    navigation.navigate('AddProject');
  };

  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    loadProjects();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Projects Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter || priorityFilter
          ? 'Try adjusting your search or filters'
          : 'Get started by creating your first project'}
      </Text>
      {!searchQuery && !statusFilter && !priorityFilter && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddProject}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Create Project</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProjectCard = ({ item }) => (
    <ProjectCard
      project={item}
      onView={handleView}
      onEdit={handleEdit}
      onProgress={handleProgress}
    />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Dashboard Stats */}
      {projectStats && (
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { borderLeftColor: COLORS.primary }]}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {projectStats.total_projects || 0}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#10B981' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {projectStats.active_projects || 0}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#3B82F6' }]}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {projectStats.completed_projects || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statItem, { borderLeftColor: '#EF4444' }]}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {projectStats.delayed_projects || 0}
            </Text>
            <Text style={styles.statLabel}>Delayed</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
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
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSubtitle}>Manage your construction projects</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, styles.exportButton]} 
            onPress={() => handleExport('excel')}
          >
            <Ionicons name="arrow-up" size={20} color={COLORS.success} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Projects List */}
      {loading && projects.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id?.toString()}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={projects.length === 0 ? styles.emptyListContent : styles.listContent}
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
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
    textTransform: 'uppercase',
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
  // Project Card Styles
  projectCard: {
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
  projectName: {
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
  // Progress Section
  progressSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
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
  milestonesRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
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