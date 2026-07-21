import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';

import { useAttendance } from '../context/AttendanceContext';
import { useProjects } from '../context/ProjectContext';
import CustomButton from '../components/CustomButton';

import {
  COLORS,
  SIZES,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../constants/theme';

const AttendanceScreen = ({ navigation }) => {

  // ==========================================
  // CONTEXT
  // ==========================================

  const {
    currentSession,
    loading,
    error,
    success,
    createSession,
    closeSession,
    deleteSession,
    fetchProjectSession,
  } = useAttendance();

  const {
    projects = [],
    selectedProject,
    setSelectedProject,
  } = useProjects();

  // ==========================================
  // LOCAL STATE
  // ==========================================

  const [selectedProjectId, setSelectedProjectId] = useState(
    selectedProject ? String(selectedProject.id) : ''
  );

  const [checkInStart, setCheckInStart] = useState('');
  const [checkInEnd, setCheckInEnd] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    if (!selectedProject) return;

    setSelectedProjectId(String(selectedProject.id));

    loadActiveSession(selectedProject.id);

  }, [selectedProject]);

  // ==========================================
  // LOAD ACTIVE SESSION
  // ==========================================

  const loadActiveSession = async (projectId) => {
    try {
      await fetchProjectSession(projectId);
    } catch (err) {
      console.log('No active attendance session.');
    }
  };

  // ==========================================
  // CREATE SESSION
  // ==========================================

  const handleCreateSession = async () => {

    if (!selectedProjectId) {
      Alert.alert(
        'Project Required',
        'Please select a project first.'
      );
      return;
    }

    if (!checkInStart || !checkInEnd) {
      Alert.alert(
        'Time Required',
        'Please set both check-in start and end times.'
      );
      return;
    }

    try {

      const sessionData = {
        project_id: Number(selectedProjectId),
        check_in_start: checkInStart,
        check_in_end: checkInEnd,
      };

      console.log('Creating Session:', sessionData);

      const session = await createSession(sessionData);

      Alert.alert(
        'Success',
        'Attendance session created successfully.',
        [
          {
            text: 'View QR Code',
            onPress: () =>
              navigation.navigate('QRDisplay', {
                session,
              }),
          },
          {
            text: 'OK',
          },
        ]
      );

    } catch (err) {

      Alert.alert(
        'Create Session Failed',
        err.message || 'Unable to create session.'
      );

    }

  };

  // ==========================================
  // CLOSE SESSION
  // ==========================================

  const handleCloseSession = () => {

    if (!currentSession) return;

    Alert.alert(
      'Close Session',
      'Close this attendance session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {

            try {

              await closeSession(currentSession.id);

              Alert.alert(
                'Success',
                'Attendance session closed.'
              );

            } catch (err) {

              Alert.alert(
                'Error',
                err.message
              );

            }

          },
        },
      ]
    );

  };

  // ==========================================
  // DELETE SESSION
  // ==========================================

  const handleDeleteSession = () => {

    if (!currentSession) return;

    Alert.alert(
      'Delete Session',
      'Delete this attendance session and all attendance records?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {

            try {

              await deleteSession(currentSession.id);

              Alert.alert(
                'Deleted',
                'Attendance session deleted.'
              );

            } catch (err) {

              Alert.alert(
                'Error',
                err.message
              );

            }

          },
        },
      ]
    );

  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {

    setRefreshing(true);

    if (selectedProjectId) {

      await loadActiveSession(
        Number(selectedProjectId)
      );

    }

    setRefreshing(false);

  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {

    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString();

  };

  // ==========================================
  // JSX STARTS IN PART 2
  // ==========================================

  return (
    <ScrollView
      style={styles.container}
         refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >

      

      

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Attendance Management
        </Text>

        <Text style={styles.subtitle}>
          QR Code Attendance System
        </Text>
      </View>

      {/* ================= ERROR ================= */}

      {!!error && (
        <View style={styles.messageError}>
          <Text style={styles.messageText}>
            {error}
          </Text>
        </View>
      )}

      {!!success && (
        <View style={styles.messageSuccess}>
          <Text style={styles.messageText}>
            {success}
          </Text>
        </View>
      )}

      {/* ================= PROJECTS ================= */}

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Select Project
        </Text>

        <View style={styles.projectGrid}>

          {Array.isArray(projects) &&
          projects.length > 0 ? (

            projects.map((project) => (

              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectCard,
                  selectedProjectId === String(project.id) &&
                    styles.projectCardSelected,
                ]}
                onPress={() => {

                  setSelectedProjectId(
                    String(project.id)
                  );

                  if (
                    typeof setSelectedProject ===
                    'function'
                  ) {
                    setSelectedProject(project);
                  }

                }}
              >

                <Text style={styles.projectName}>
                  {project.name || 'Unnamed Project'}
                </Text>

                <Text style={styles.projectLocation}>
                  {project.location ||
                    'No location'}
                </Text>

              </TouchableOpacity>

            ))

          ) : (

            <Text style={styles.emptyText}>
              No projects available.
            </Text>

          )}

        </View>

      </View>

       {/* ================= ACTIVE SESSION ================= */}

           {/* Active Session */}
      {currentSession ? (
        <View style={styles.section}>
          <View style={styles.activeSessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>Active Session</Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {currentSession.status || 'ACTIVE'}
                </Text>
              </View>
            </View>

            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentSession.session_date)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Session Token</Text>
                <Text style={styles.tokenText}>
                  {currentSession.session_token}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <CustomButton
                title="View QR Code"
                onPress={() =>
                  navigation.navigate('QRDisplay', {
                    session: currentSession,
                  })
                }
                style={styles.qrButton}
              />

              <CustomButton
                title="Attendance List"
                onPress={() =>
                  navigation.navigate('AttendanceDetails', {
                    sessionId: currentSession.id,
                  })
                }
                style={styles.attendanceButton}
              />

              <View style={styles.secondaryButtons}>
                <CustomButton
                  title="Close Session"
                  onPress={handleCloseSession}
                  style={styles.closeButton}
                />

                <CustomButton
                  title="Delete"
                  onPress={handleDeleteSession}
                  style={styles.deleteButton}
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.noSessionCard}>
            <Text style={styles.noSessionTitle}>
              No Active Session
            </Text>

            <Text style={styles.noSessionText}>
              Select a project and create today's attendance session.
            </Text>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                Create Attendance Session
              </Text>

              <Text style={styles.inputLabel}>
                Check-in Start Time (HH:MM)
              </Text>
              <TextInput
                style={styles.timeInput}
                placeholder="08.00"
                value={checkInStart}
                onChangeText={setCheckInStart}
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.inputLabel}>
                Check-in End Time (HH:MM)
              </Text>
              <TextInput
                style={styles.timeInput}
                placeholder="17.00"
                value={checkInEnd}
                onChangeText={setCheckInEnd}
                placeholderTextColor={COLORS.textSecondary}
              />

              <CustomButton
                title="Create Attendance Session"
                onPress={handleCreateSession}
                loading={loading}
                disabled={!selectedProjectId || loading}
                style={styles.createButton}
              />
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          <CustomButton
            title="Scan QR Code"
            onPress={() => navigation.navigate('QRScanner')}
            style={styles.quickActionButton}
          />

          <CustomButton
            title="Attendance History"
            onPress={() =>
              navigation.navigate('AttendanceHistory')
            }
            style={styles.quickActionButton}
          />
        </View>
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
    marginTop: SIZES.xs,
    opacity: 0.9,
  },

  section: {
    padding: SIZES.md,
  },

  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },

  errorText: {
    color: COLORS.error,
    backgroundColor: COLORS.error + '20',
    padding: SIZES.md,
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    borderRadius: BORDER_RADIUS.sm,
  },

  successText: {
    color: COLORS.success,
    backgroundColor: COLORS.success + '20',
    padding: SIZES.md,
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    borderRadius: BORDER_RADIUS.sm,
  },

  /* ---------- Projects ---------- */

  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  projectCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  projectCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '10',
  },

  projectName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },

  projectLocation: {
    marginTop: SIZES.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  /* ---------- Active Session ---------- */

  activeSessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.lg,
    elevation: 3,
  },

  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },

  sessionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },

  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SIZES.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },

  statusText: {
    color: COLORS.success,
    fontWeight: '600',
  },

  sessionDetails: {
    marginVertical: SIZES.sm,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.sm,
  },

  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },

  detailValue: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },

  tokenText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },

  /* ---------- Buttons ---------- */

  actionButtons: {
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },

  qrButton: {
    backgroundColor: COLORS.primary,
  },

  attendanceButton: {
    backgroundColor: COLORS.secondary,
  },

  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.sm,
  },

  closeButton: {
    flex: 1,
    backgroundColor: COLORS.warning,
    marginRight: SIZES.xs,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    marginLeft: SIZES.xs,
  },

  /* ---------- No Session ---------- */

  noSessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.lg,
    elevation: 3,
  },

  noSessionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },

  noSessionText: {
    marginTop: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  formContainer: {
    marginTop: SIZES.lg,
  },

  formTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SIZES.md,
    color: COLORS.text,
  },

  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    marginTop: SIZES.sm,
  },

  timeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SIZES.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  createButton: {
    backgroundColor: COLORS.primary,
    marginTop: SIZES.md,
  },

  /* ---------- Quick Actions ---------- */

  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  quickActionButton: {
    flex: 1,
    marginHorizontal: SIZES.xs,
    backgroundColor: COLORS.secondary,
  },
});
export default AttendanceScreen;
