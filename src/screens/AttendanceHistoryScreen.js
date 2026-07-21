import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { COLORS, SIZES, FONTS, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const AttendanceHistoryScreen = ({ navigation }) => {
  const { workerAttendanceHistory, loading, fetchAttendanceHistory } = useAttendance();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  useEffect(() => {
    if (filterProject === 'all') {
      setFilteredHistory(workerAttendanceHistory);
    } else {
      setFilteredHistory(
        workerAttendanceHistory.filter(record => record.project_id === parseInt(filterProject))
      );
    }
  }, [filterProject, workerAttendanceHistory]);

  const loadAttendanceHistory = async () => {
    try {
      await fetchAttendanceHistory(user?.id, {
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance history');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return COLORS.success;
      case 'Late':
        return COLORS.warning;
      case 'Absent':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getUniqueProjects = () => {
    const projects = new Map();
    workerAttendanceHistory.forEach(record => {
      projects.set(record.project_id, {
        id: record.project_id,
        name: record.project_name
      });
    });
    return Array.from(projects.values());
  };

  const uniqueProjects = getUniqueProjects();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
        <Text style={styles.subtitle}>Your past attendance records</Text>
      </View>

      {/* Filter */}
      {uniqueProjects.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.filterLabel}>Filter by Project:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterProject === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterProject('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterProject === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All Projects
                </Text>
              </TouchableOpacity>
              {uniqueProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.filterButton,
                    filterProject === project.id.toString() && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterProject(project.id.toString())}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterProject === project.id.toString() && styles.filterButtonTextActive,
                    ]}
                  >
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Statistics Summary */}
      <View style={styles.section}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredHistory.length}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredHistory.filter(r => r.attendance_status === 'Present').length}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredHistory.filter(r => r.attendance_status === 'Late').length}
            </Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>
      </View>

      {/* Attendance List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {filterProject === 'all' ? 'All Records' : 'Filtered Records'}
        </Text>

        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
            <CustomButton
              title="Scan QR Code"
              onPress={() => navigation.navigate('QRScanner')}
              style={styles.scanButton}
            />
          </View>
        ) : (
          <View style={styles.historyList}>
            {filteredHistory.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.historyCard}
                onPress={() => navigation.navigate('AttendanceDetails', { record })}
              >
                <View style={styles.historyHeader}>
                  <View style={styles.historyHeaderLeft}>
                    <Text style={styles.projectName}>{record.project_name}</Text>
                    <Text style={styles.sessionDate}>{formatDate(record.session_date)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.attendance_status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(record.attendance_status) },
                      ]}
                    >
                      {record.attendance_status}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyDetails}>
                  <View style={styles.historyDetailRow}>
                    <Text style={styles.historyDetailLabel}>Check-in:</Text>
                    <Text style={styles.historyDetailValue}>
                      {record.check_in_time ? formatTime(record.check_in_time) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.historyDetailRow}>
                    <Text style={styles.historyDetailLabel}>Check-out:</Text>
                    <Text style={styles.historyDetailValue}>
                      {record.check_out_time ? formatTime(record.check_out_time) : 'N/A'}
                    </Text>
                  </View>
                </View>

                {record.remarks && (
                  <Text style={styles.remarksText}>Remarks: {record.remarks}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SIZES.xs,
  },
  section: {
    padding: SIZES.md,
  },
  filterLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    minWidth: 200,
  },
  historyList: {
    gap: SIZES.sm,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  historyHeaderLeft: {
    flex: 1,
  },
  projectName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  sessionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  historyDetailRow: {
    flex: 1,
  },
  historyDetailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  historyDetailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  remarksText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default AttendanceHistoryScreen;