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

const AttendanceDetailsScreen = ({ route, navigation }) => {
  const { sessionId, record } = route.params || {};
  const { attendanceRecords, loading, fetchAttendanceBySession, checkOut } = useAttendance();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [displayRecords, setDisplayRecords] = useState([]);

  useEffect(() => {
    if (sessionId) {
      loadSessionAttendance(sessionId);
    } else if (record) {
      setDisplayRecords([record]);
    }
  }, [sessionId, record]);

  const loadSessionAttendance = async (id) => {
    try {
      const records = await fetchAttendanceBySession(id);
      setDisplayRecords(records);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance details');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (sessionId) {
      await loadSessionAttendance(sessionId);
    }
    setRefreshing(false);
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await checkOut(attendanceId);
      Alert.alert('Success', 'Check-out recorded successfully');
      if (sessionId) {
        await loadSessionAttendance(sessionId);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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
        return COLORS.secondary;
    }
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  // Calculate statistics
  const totalPresent = displayRecords.filter(r => r.attendance_status === 'Present').length;
  const totalLate = displayRecords.filter(r => r.attendance_status === 'Late').length;
  const totalAbsent = displayRecords.filter(r => r.attendance_status === 'Absent').length;
  const totalCheckedOut = displayRecords.filter(r => r.check_out_time).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Details</Text>
        <Text style={styles.subtitle}>
          {sessionId ? 'Session Attendance Records' : 'Attendance Record'}
        </Text>
      </View>

      {/* Statistics */}
      {displayRecords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{displayRecords.length}</Text>
              <Text style={styles.statLabel}>Total Workers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {totalPresent}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {totalLate}
              </Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.error }]}>
                {totalAbsent}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCheckedOut}/{displayRecords.length}</Text>
            <Text style={styles.statLabel}>Checked Out</Text>
          </View>
        </View>
      )}

      {/* Session Info */}
      {displayRecords.length > 0 && displayRecords[0].session_date && (
        <View style={styles.section}>
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoTitle}>Session Information</Text>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Date:</Text>
              <Text style={styles.sessionInfoValue}>
                {formatDate(displayRecords[0].session_date)}
              </Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Text style={styles.sessionInfoLabel}>Project:</Text>
              <Text style={styles.sessionInfoValue}>
                {displayRecords[0].project_name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Attendance Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Attendance Records ({displayRecords.length})
        </Text>

        {displayRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {displayRecords.map((attendanceRecord) => (
              <View key={attendanceRecord.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordHeaderLeft}>
                    <Text style={styles.workerName}>
                      {attendanceRecord.worker_name || 'Worker #' + attendanceRecord.worker_id}
                    </Text>
                    {attendanceRecord.job_title && (
                      <Text style={styles.jobTitle}>{attendanceRecord.job_title}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(attendanceRecord.attendance_status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(attendanceRecord.attendance_status) },
                      ]}
                    >
                      {attendanceRecord.attendance_status}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordDetails}>
                  <View style={styles.recordDetailRow}>
                    <View style={styles.recordDetailItem}>
                      <Text style={styles.recordDetailLabel}>Check-in</Text>
                      <Text style={styles.recordDetailValue}>
                        {attendanceRecord.check_in_time
                          ? formatTime(attendanceRecord.check_in_time)
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.recordDetailItem}>
                      <Text style={styles.recordDetailLabel}>Check-out</Text>
                      <Text style={styles.recordDetailValue}>
                        {attendanceRecord.check_out_time
                          ? formatTime(attendanceRecord.check_out_time)
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.recordDetailItem}>
                      <Text style={styles.recordDetailLabel}>Duration</Text>
                      <Text style={styles.recordDetailValue}>
                        {calculateDuration(
                          attendanceRecord.check_in_time,
                          attendanceRecord.check_out_time
                        )}
                      </Text>
                    </View>
                  </View>

                  {attendanceRecord.remarks && (
                    <View style={styles.remarksContainer}>
                      <Text style={styles.remarksLabel}>Remarks:</Text>
                      <Text style={styles.remarksText}>{attendanceRecord.remarks}</Text>
                    </View>
                  )}

                  {/* Check-out button for workers who haven't checked out */}
                  {attendanceRecord.worker_id === user?.worker_id &&
                    !attendanceRecord.check_out_time && (
                      <CustomButton
                        title="Check Out"
                        onPress={() => handleCheckOut(attendanceRecord.id)}
                        style={styles.checkOutButton}
                      />
                    )}
                </View>
              </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    color: COLORS.secondary,
    marginTop: SIZES.xs,
  },
  sessionInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionInfoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionInfoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  sessionInfoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
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
    color: COLORS.secondary,
    textAlign: 'center',
  },
  recordsList: {
    gap: SIZES.sm,
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  recordHeaderLeft: {
    flex: 1,
  },
  workerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  jobTitle: {
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
  recordDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.sm,
  },
  recordDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  recordDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  recordDetailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  recordDetailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  remarksContainer: {
    marginTop: SIZES.sm,
    padding: SIZES.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  remarksLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  remarksText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  checkOutButton: {
    backgroundColor: COLORS.secondary,
    marginTop: SIZES.md,
  },
});

export default AttendanceDetailsScreen;
