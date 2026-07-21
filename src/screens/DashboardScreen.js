import React, { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../context/DashboardContext';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { 
  COLORS, 
  SPACING, 
  BORDER_RADIUS, 
  TYPOGRAPHY, 
  SHADOW,
  STATUS 
} from '../constants/theme';
import { Card, StatusBadge, EmptyState } from '../components/ui';

const MODULES = [
  { label: 'Projects', route: 'Projects', icon: 'briefcase-outline', color: COLORS.info, bg: COLORS.infoLight },
  { label: 'Workers', route: 'Workers', icon: 'people-outline', color: COLORS.success, bg: COLORS.successLight },
  { label: 'Tasks', route: 'Tasks', icon: 'clipboard-outline', color: COLORS.warning, bg: COLORS.warningLight },
  { label: 'Attendance', route: 'Attendance', icon: 'calendar-outline', color: '#0EA5E9', bg: '#E0F2FE' },
  { label: 'Milestones', route: 'Milestones', icon: 'flag-outline', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Materials', route: 'Materials', icon: 'cube-outline', color: '#EA580C', bg: '#FFEDD5' },
  { label: 'Analytics', route: 'Analytics', icon: 'stats-chart-outline', color: COLORS.primary, bg: COLORS.primaryLight },
];

const numberValue = (...values) => {
  const found = values.find((value) => typeof value === 'number' && !Number.isNaN(value));
  return found ?? 0;
};

const listCount = (section, ...fallbackKeys) => {
  if (Array.isArray(section?.data)) return section.data.length;
  return numberValue(...fallbackKeys.map((key) => section?.[key]));
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'No date';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const DetailRow = ({ icon, label, value, color = COLORS.primary }) => (
  <View style={styles.detailRow}>
    <View style={[styles.detailIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={17} color={color} />
    </View>
    <View style={styles.detailTextWrap}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const TimelineItem = ({ item, fallbackTitle, dateKey }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineDot} />
    <View style={styles.timelineBody}>
      <Text style={styles.timelineTitle} numberOfLines={2}>
        {item.title || item.name || item.description || fallbackTitle}
      </Text>
      <Text style={styles.timelineMeta}>{formatDate(item[dateKey] || item.due_date || item.updated_at || item.timestamp)}</Text>
    </View>
  </View>
);

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { dashboard, loading, refreshDashboard } = useDashboard();
  const { authenticated, user, role } = useAuth();

  useEffect(() => {
    if (authenticated && !dashboard && !loading) {
      refreshDashboard();
    }
  }, [authenticated, dashboard, loading, refreshDashboard]);

  const summary = useMemo(() => {
    const projects = dashboard?.projects;
    const tasks = dashboard?.tasks;
    const workers = dashboard?.workers;
    const milestones = dashboard?.milestones;
    const attendance = dashboard?.attendance;

    const totalProjects = listCount(projects, 'total_projects', 'totalProjects');
    const activeProjects = numberValue(projects?.active_projects, projects?.activeProjects, totalProjects);
    const completedProjects = numberValue(projects?.completed_projects, projects?.completedProjects);
    const averageProgress = numberValue(projects?.average_progress, projects?.averageProgress);
    const totalTasks = listCount(tasks, 'total_tasks', 'totalTasks');
    const inProgressTasks = numberValue(tasks?.in_progress, tasks?.inProgress, tasks?.in_progress_tasks);
    const completedTasks = numberValue(tasks?.completed, tasks?.completed_tasks, tasks?.completedTasks);
    const totalWorkers = listCount(workers, 'total_workers', 'totalWorkers');
    const activeWorkers = numberValue(workers?.active_workers, workers?.activeWorkers);
    const openMilestones = numberValue(milestones?.in_progress, milestones?.pending);
    const attendanceToday = numberValue(attendance?.present_today, attendance?.checked_in_today, attendance?.total_present);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      averageProgress,
      totalTasks,
      inProgressTasks,
      completedTasks,
      totalWorkers,
      activeWorkers,
      openMilestones,
      attendanceToday,
    };
  }, [dashboard]);

  const recentActivities = dashboard?.recentActivities || dashboard?.recent_activities || [];
  const upcomingDeadlines = dashboard?.upcomingDeadlines || dashboard?.upcoming_deadlines || [];
  const displayName = user?.first_name || user?.name || 'Serena';
  const progress = Math.max(0, Math.min(100, summary.averageProgress));
  const progressTone = progress >= 70 ? 'good' : progress >= 35 ? 'warning' : 'danger';
  const allowedModules = useMemo(() => {
    if (role === USER_ROLES.ADMIN) return MODULES;
    if (role === USER_ROLES.PROJECT_MANAGER) {
      return MODULES.filter((item) => ['Projects', 'Milestones', 'Materials', 'Analytics'].includes(item.route));
    }
    if (role === USER_ROLES.SUPERVISOR) {
      return MODULES.filter((item) => ['Tasks', 'Workers', 'Attendance', 'Analytics', 'Materials'].includes(item.route));
    }
    return [];
  }, [role]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.greetingText}>Hello, {displayName}</Text>
          <Text style={styles.subGreeting}>Your BuildTrack command center</Text>
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
            <View style={styles.badgeDot} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshDashboard}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Card variant="elevated" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Overall Project Portfolio</Text>
              <Text style={styles.heroTitle}>{summary.activeProjects} active projects</Text>
            </View>
            <StatusBadge 
              label={`${progress}% progress`} 
              tone={progressTone}
              size="medium"
            />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.heroDetails}>
            <DetailRow icon="briefcase-outline" label="Portfolio" value={`${summary.totalProjects} total, ${summary.completedProjects} completed`} color={COLORS.info} />
            <DetailRow icon="clipboard-outline" label="Workload" value={`${summary.inProgressTasks} in progress, ${summary.completedTasks} completed`} color={COLORS.warning} />
            <DetailRow icon="people-outline" label="Workforce" value={`${summary.activeWorkers || summary.totalWorkers} active of ${summary.totalWorkers} workers`} color={COLORS.success} />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shortcuts</Text>
            <Text style={styles.sectionSubtitle}>Open project modules quickly</Text>
          </View>
        </View>
        <View style={styles.moduleGrid}>
          {allowedModules.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.moduleCard}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.moduleIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.moduleLabel} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.twoColumn}>
          <Card variant="filled" style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today</Text>
              <Ionicons name="today-outline" size={19} color={COLORS.primary} />
            </View>
            <DetailRow icon="calendar-outline" label="Attendance" value={`${summary.attendanceToday} checked in`} color="#0EA5E9" />
            <DetailRow icon="flag-outline" label="Open milestones" value={`${summary.openMilestones} need attention`} color="#7C3AED" />
          </Card>

          <TouchableOpacity
            style={[styles.infoCard, styles.infoCardTouchable]}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.85}
          >
            <Card variant="filled">
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Analytics</Text>
                <Ionicons name="chevron-forward" size={19} color={COLORS.gray} />
              </View>
              <Text style={styles.cardDescription}>
                Detailed statistics, trends, and performance breakdowns are available on the Analytics page.
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Text style={styles.sectionSubtitle}>Important work approaching soon</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')} activeOpacity={0.75}>
            <Text style={styles.sectionAction}>View Tasks</Text>
          </TouchableOpacity>
        </View>
        <Card variant="outlined" style={styles.panel}>
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.slice(0, 4).map((item, index) => (
              <TimelineItem key={item.id || `${item.title}-${index}`} item={item} fallbackTitle="Upcoming deadline" dateKey="due_date" />
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming deadlines found.</Text>
          )}
        </Card>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>Latest movement across your projects</Text>
          </View>
        </View>
        <Card variant="outlined" style={styles.panel}>
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 4).map((item, index) => (
              <TimelineItem key={item.id || `${item.title}-${index}`} item={item} fallbackTitle="Project activity" dateKey="updated_at" />
            ))
          ) : loading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No recent activity available.</Text>
          )}
        </Card>

        <View style={{ height: SPACING[5] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[3],
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCopy: {
    flex: 1,
    paddingRight: SPACING[3],
  },
  greetingText: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text,
  },
  subGreeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[2],
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.error,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
  },
  scrollBody: {
    padding: SPACING[4],
    paddingBottom: SPACING[6],
  },
  heroCard: {
    marginBottom: SPACING[5],
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING[3],
  },
  heroEyebrow: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING[1],
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING[4],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  heroDetails: {
    marginTop: SPACING[4],
    gap: SPACING[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING[5],
    marginBottom: SPACING[3],
  },
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
  },
  sectionAction: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
    fontWeight: '600',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  moduleCard: {
    width: '31.7%',
    minHeight: 82,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[3],
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.low,
  },
  moduleIcon: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  moduleLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    textAlign: 'center',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  infoCard: {
    flex: 1,
  },
  infoCardTouchable: {
    borderRadius: BORDER_RADIUS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  cardTitle: {
    ...TYPOGRAPHY.h6,
    color: COLORS.text,
  },
  cardDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.body.lineHeight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    minHeight: 38,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING[1],
  },
  panel: {
    marginBottom: SPACING[4],
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: SPACING[3],
  },
  timelineBody: {
    flex: 1,
  },
  timelineTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: TYPOGRAPHY.body.lineHeight,
  },
  timelineMeta: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.body.lineHeight,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    paddingVertical: SPACING[2],
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

