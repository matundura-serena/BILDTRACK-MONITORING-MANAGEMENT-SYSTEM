import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkers } from '../context/WorkerContext';
import * as workerAssignmentService from '../services/workerAssignmentService';
import { COLORS, SIZES } from '../constants/theme';

// ==========================================
// 🎨 REUSABLE UI COMPONENTS
// ==========================================

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

// ==========================================
// 📱 MAIN WORKER DETAILS SCREEN
// ==========================================

export default function WorkerDetailsScreen({ route, navigation }) {
  const { worker } = route.params || {};
  const { deleteWorker } = useWorkers();
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Load worker assignments
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await workerAssignmentService.getWorkerAssignments(worker.id, 'Active');
      setAssignments(data);
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  if (!worker) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
        <Text style={styles.errorTitle}>Worker Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The worker information could not be loaded.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const handleEdit = () => {
    navigation.navigate('AddWorker', { workerId: worker.id, worker });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to delete ${worker.first_name} ${worker.last_name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorker(worker.id);
              Alert.alert('Success', 'Worker deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete worker');
            }
          },
        },
      ]
    );
  };

  const handleAssignProject = () => {
    navigation.navigate('AssignWorker', { workerId: worker.id, worker });
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {worker.profile_photo ? (
            <Image source={{ uri: worker.profile_photo }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: getAvatarColor(worker.first_name) }]}>
              <Text style={styles.profileInitials}>
                {getInitials(worker.first_name, worker.last_name)}
              </Text>
            </View>
          )}
          
          <Text style={styles.profileName}>
            {worker.first_name} {worker.last_name}
          </Text>
          <Text style={styles.profileJobTitle}>{worker.job_title || 'No job title'}</Text>
          
          <View style={styles.profileMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={16} color={COLORS.gray} />
              <Text style={styles.metaText}>{worker.department || 'No department'}</Text>
            </View>
            <StatusBadge status={worker.status} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.white} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.assignButton} onPress={handleAssignProject}>
            <Ionicons name="link-outline" size={20} color={COLORS.white} />
            <Text style={styles.assignButtonText}>Assign Project</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <SectionCard title="Personal Information" icon="person-outline">
          <DetailRow
            icon="person"
            label="Full Name"
            value={`${worker.first_name} ${worker.last_name}`}
          />
          <DetailRow
            icon="card-outline"
            label="National ID"
            value={worker.national_id}
          />
          <DetailRow
            icon="male-female-outline"
            label="Gender"
            value={worker.gender}
          />
          <DetailRow
            icon="calendar-outline"
            label="Date of Birth"
            value={formatDate(worker.date_of_birth)}
          />
        </SectionCard>

        {/* Contact Information Section */}
        <SectionCard title="Contact Information" icon="call-outline">
          <DetailRow
            icon="call"
            label="Phone Number"
            value={worker.phone_number}
          />
          <DetailRow
            icon="mail"
            label="Email"
            value={worker.email}
          />
          <DetailRow
            icon="location-outline"
            label="Address"
            value={worker.address}
          />
        </SectionCard>

        {/* Employment Information Section */}
        <SectionCard title="Employment Information" icon="briefcase-outline">
          <DetailRow
            icon="hammer-outline"
            label="Job Title"
            value={worker.job_title}
          />
          <DetailRow
            icon="business"
            label="Department"
            value={worker.department}
          />
          <DetailRow
            icon="time-outline"
            label="Employment Type"
            value={worker.employment_type}
          />
          <DetailRow
            icon="checkmark-circle-outline"
            label="Status"
            value={worker.status}
          />
          <DetailRow
            icon="calendar"
            label="Hire Date"
            value={formatDate(worker.hire_date)}
          />
          <DetailRow
            icon="cash-outline"
            label="Daily Rate"
            value={formatCurrency(worker.daily_rate)}
          />
          <DetailRow
            icon="cash"
            label="Monthly Salary"
            value={formatCurrency(worker.monthly_salary)}
          />
        </SectionCard>

        {/* Emergency Contact Section */}
        <SectionCard title="Emergency Contact" icon="alert-circle-outline">
          <DetailRow
            icon="person"
            label="Contact Name"
            value={worker.emergency_contact_name}
          />
          <DetailRow
            icon="call"
            label="Contact Phone"
            value={worker.emergency_contact_phone}
          />
        </SectionCard>

        {/* Assigned Projects Section */}
        <SectionCard title="Assigned Projects" icon="briefcase-outline">
          {loadingAssignments ? (
            <View style={styles.loadingAssignmentsContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingAssignmentsText}>Loading assignments...</Text>
            </View>
          ) : assignments.length > 0 ? (
            <View style={styles.assignmentsList}>
              {assignments.map((assignment) => (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.assignmentItem}
                  onPress={() => navigation.navigate('ProjectDetails', { projectId: assignment.project_id, project: assignment })}
                >
                  <View style={styles.assignmentIcon}>
                    <Ionicons name="business" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.assignmentDetails}>
                    <Text style={styles.assignmentProjectName}>{assignment.project_name}</Text>
                    <Text style={styles.assignmentRole}>{assignment.role}</Text>
                    <Text style={styles.assignmentDate}>
                      Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noAssignmentsContainer}>
              <Ionicons name="briefcase-outline" size={40} color={COLORS.lightGray} />
              <Text style={styles.noAssignmentsText}>No active project assignments</Text>
              <TouchableOpacity style={styles.assignButton} onPress={handleAssignProject}>
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.assignButtonText}>Assign to Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </SectionCard>

        {/* Documents Section (Placeholder for future implementation) */}
        <SectionCard title="Documents" icon="document-outline">
          <View style={styles.documentsPlaceholder}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.documentsText}>Document uploads coming soon</Text>
            <Text style={styles.documentsSubtext}>
              National ID, Employment Contract, Certifications, and more
            </Text>
          </View>
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitials: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  profileJobTitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray,
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
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  assignButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  deleteButtonText: {
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
  // Status Badge
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
  // Loading Assignments
  loadingAssignmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingAssignmentsText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  // Assignments List
  assignmentsList: {
    gap: 8,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentDetails: {
    flex: 1,
  },
  assignmentProjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  assignmentRole: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  assignmentDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  // No Assignments
  noAssignmentsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noAssignmentsText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 16,
  },
  // Documents Placeholder
  documentsPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  documentsText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  documentsSubtext: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // Error State
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
});