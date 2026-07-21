import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Dimensions, RefreshControl, TextInput 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMilestones, getMilestoneStats } from '../services/milestoneService';
import { COLORS, SIZES } from '../constants/theme';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (SIZES.padding * 2) - 12) / 2;

export default function MilestonesScreen({ navigation }) {
  const [milestones, setMilestones] = useState([]);
  const [filteredMilestones, setFilteredMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [stats, setStats] = useState(null);

  const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  useEffect(() => {
    fetchMilestones();
    fetchStats();
  }, []);

  useEffect(() => {
    filterMilestones();
  }, [searchQuery, selectedStatus, milestones]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const data = await getMilestones();
      setMilestones(data || []);
    } catch (error) {
      console.error('❌ Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getMilestoneStats();
      setStats(data);
    } catch (error) {
      console.error('❌ Error fetching milestone stats:', error);
    }
  };

  const filterMilestones = () => {
    let filtered = milestones;

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    setFilteredMilestones(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMilestones();
    await fetchStats();
    setRefreshing(false);
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

  const renderMilestoneCard = (milestone) => (
    <TouchableOpacity
      key={milestone.id}
      style={styles.milestoneCard}
      onPress={() => navigation.navigate('MilestoneDetails', { milestoneId: milestone.id })}
      activeOpacity={0.7}
    >
      <View style={styles.milestoneHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(milestone.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(milestone.status) }]}>
            {milestone.status}
          </Text>
        </View>
        <Text style={styles.milestoneWeight}>Weight: {milestone.weight}%</Text>
      </View>

      <Text style={styles.milestoneTitle} numberOfLines={2}>
        {milestone.title}
      </Text>
      
      <Text style={styles.projectName} numberOfLines={1}>
        {milestone.project_name}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${milestone.progress || 0}%` }]} />
        </View>
        <Text style={styles.progressText}>{milestone.progress || 0}%</Text>
      </View>

      <View style={styles.milestoneFooter}>
        <View style={styles.taskInfo}>
          <Ionicons name="clipboard-outline" size={14} color={COLORS.gray} />
          <Text style={styles.taskText}>
            {milestone.completed_tasks || 0}/{milestone.total_tasks || 0} Tasks
          </Text>
        </View>
        {milestone.due_date && (
          <View style={styles.dueDateInfo}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dueDateText}>
              {new Date(milestone.due_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Milestones</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMilestone')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search milestones..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
      </View>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
        contentContainerStyle={styles.statusFilterContent}
      >
        {statuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilter,
              selectedStatus === status && styles.statusFilterActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === status && styles.statusFilterTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_milestones || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.completed || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.in_progress || 0}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.overdue || 0}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      )}

      {/* Milestones List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading milestones...</Text>
        </View>
      ) : filteredMilestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>No milestones found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedStatus !== 'All' 
              ? 'Try adjusting your filters' 
              : 'Create your first milestone to get started'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.milestonesGrid}>
            {filteredMilestones.map(renderMilestoneCard)}
          </View>
        </ScrollView>
      )}
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.secondary,
  },
  statusFilterContainer: {
    marginTop: 12,
    maxHeight: 40,
  },
  statusFilterContent: {
    paddingHorizontal: SIZES.padding,
    gap: 8,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  statusFilterTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 30,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  milestoneCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  milestoneWeight: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  projectName: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 36,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});