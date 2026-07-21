import React, { useState, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../context/WorkerContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ==========================================
// 📋 CONSTANTS & OPTIONS
// ==========================================

const DEPARTMENT_OPTIONS = [
  { label: 'All Departments', value: '' },
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
  { label: 'All Types', value: '' },
  { label: 'Permanent', value: 'Permanent' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Intern', value: 'Intern' },
  { label: 'Consultant', value: 'Consultant' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'Active' },
  { label: 'On Leave', value: 'On Leave' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Resigned', value: 'Resigned' },
  { label: 'Terminated', value: 'Terminated' },
];

// ==========================================
// 🎨 REUSABLE UI COMPONENTS
// ==========================================

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'On Leave':
        return '#F59E0B';
      case 'Suspended':
        return '#EF4444';
      case 'Resigned':
        return '#6B7280';
      case 'Terminated':
        return '#DC2626';
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

const WorkerCard = ({ worker, onView, onEdit, onDelete, onAssign }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.workerCard}>
      {/* Profile Photo / Avatar */}
      <View style={styles.cardHeader}>
        {worker.profile_photo ? (
          <Image
            source={{ uri: worker.profile_photo }}
            style={styles.workerAvatar}
          />
        ) : (
          <View style={[styles.workerAvatarPlaceholder, { backgroundColor: getAvatarColor(worker.first_name) }]}>
            <Text style={styles.workerInitials}>
              {getInitials(worker.first_name, worker.last_name)}
            </Text>
          </View>
        )}
        
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>
            {worker.first_name} {worker.last_name}
          </Text>
          <Text style={styles.workerJobTitle}>{worker.job_title || 'No job title'}</Text>
          <View style={styles.workerMeta}>
            <Ionicons name="business-outline" size={14} color={COLORS.gray} />
            <Text style={styles.workerMetaText}>{worker.department || 'No department'}</Text>
          </View>
        </View>

        <StatusBadge status={worker.status} />
      </View>

      {/* Worker Details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>{worker.phone_number || 'No phone'}</Text>
        </View>
        
        {worker.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailText} numberOfLines={1}>
              {worker.email}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>
            Hired: {worker.hire_date ? new Date(worker.hire_date).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onView(worker)}
        >
          <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(worker)}
        >
          <Ionicons name="pencil-outline" size={18} color="#F59E0B" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.assignButton]}
          onPress={() => onAssign(worker)}
        >
          <Ionicons name="link-outline" size={18} color="#10B981" />
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(worker)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
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
// 📱 MAIN WORKERS LIST SCREEN
// ==========================================

export default function WorkersScreen({ navigation }) {
  const { workers, loading, error, getWorkers, deleteWorker } = useWorkers();
  
  // 🔍 SEARCH & FILTER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeoutRef = useRef(null);

  // 🚀 INITIAL LOAD
  useEffect(() => {
    loadWorkers();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 🔄 LOAD WORKERS WITH FILTERS
  const loadWorkers = async (params = {}) => {
    try {
      await getWorkers({
        search: searchQuery || undefined,
        department: departmentFilter || undefined,
        employment_type: employmentTypeFilter || undefined,
        status: statusFilter || undefined,
      });
    } catch (error) {
      console.error('❌ Error loading workers:', error);
    }
  };

  // 🔍 SEARCH HANDLER
  const handleSearch = (text) => {
    setSearchQuery(text);
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadWorkers();
    }, 500);
  };

  // 🔄 PULL TO REFRESH
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkers();
    setRefreshing(false);
  };

  // 🗑️ DELETE HANDLER
  const handleDelete = (worker) => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to delete ${worker.first_name} ${worker.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorker(worker.id);
              Alert.alert('Success', 'Worker deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete worker');
            }
          },
        },
      ]
    );
  };

  // 👁️ VIEW HANDLER
  const handleView = (worker) => {
    navigation.navigate('WorkerDetails', { worker });
  };

  // ✏️ EDIT HANDLER
  const handleEdit = (worker) => {
    navigation.navigate('AddWorker', { workerId: worker.id, worker });
  };

  // 🔗 ASSIGN HANDLER
  const handleAssign = (worker) => {
    navigation.navigate('AssignWorker', { workerId: worker.id, worker });
  };

  // ➕ ADD WORKER
  const handleAddWorker = () => {
    navigation.navigate('AddWorker');
  };

  // 🧹 CLEAR FILTERS
  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setEmploymentTypeFilter('');
    setStatusFilter('');
    loadWorkers();
  };

  // 📊 RENDER EMPTY STATE
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Workers Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || departmentFilter || employmentTypeFilter || statusFilter
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first worker'}
      </Text>
      {!searchQuery && !departmentFilter && !employmentTypeFilter && !statusFilter && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddWorker}>
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Add Worker</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // 📊 RENDER ERROR STATE
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtitle}>
        Failed to load workers. Please check your connection and try again.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadWorkers}>
        <Ionicons name="refresh" size={20} color={COLORS.white} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // 🎴 RENDER WORKER CARD
  const renderWorkerCard = ({ item }) => (
    <WorkerCard
      worker={item}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAssign={handleAssign}
    />
  );

  // 📊 RENDER LIST HEADER
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workers..."
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
          label="Department"
          value={departmentFilter}
          onSelect={setDepartmentFilter}
          options={DEPARTMENT_OPTIONS}
          icon="business-outline"
        />
        
        <FilterDropdown
          label="Employment Type"
          value={employmentTypeFilter}
          onSelect={setEmploymentTypeFilter}
          options={EMPLOYMENT_TYPE_OPTIONS}
          icon="briefcase-outline"
        />
        
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onSelect={setStatusFilter}
          options={STATUS_OPTIONS}
          icon="checkmark-circle-outline"
        />

        {(departmentFilter || employmentTypeFilter || statusFilter) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Ionicons name="funnel-outline" size={18} color={COLORS.primary} />
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {workers.length} {workers.length === 1 ? 'worker' : 'workers'} found
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Workers</Text>
          <Text style={styles.headerSubtitle}>Manage your workforce</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddWorker}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Workers List */}
      {loading && workers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workers...</Text>
        </View>
      ) : error && workers.length === 0 ? (
        renderErrorState()
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id?.toString()}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={workers.length === 0 ? styles.emptyListContent : styles.listContent}
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
  // Worker Card Styles
  workerCard: {
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  workerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerInitials: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
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
  workerJobTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workerMetaText: {
    fontSize: 12,
    color: COLORS.gray,
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
  assignButton: {
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
  assignButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
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
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
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