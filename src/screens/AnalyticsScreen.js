import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

// Components
import DashboardHeader from '../components/analytics/DashboardHeader';
import KPIStatCard from '../components/analytics/KPIStatCard';
import AnalyticsChartCard from '../components/analytics/AnalyticsChartCard';
import ActivityTimeline from '../components/analytics/ActivityTimeline';
import DeadlineCard from '../components/analytics/DeadlineCard';

// Charts
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import ProjectStatusChart from '../components/charts/ProjectStatusChart';
import WorkerDistributionChart from '../components/charts/WorkerDistributionChart';
import TaskDistributionChart from '../components/charts/TaskDistributionChart';
import MilestoneProgressChart from '../components/charts/MilestoneProgressChart';
import WorkerProductivityChart from '../components/charts/WorkerProductivityChart';
import ProjectComparisonChart from '../components/charts/ProjectComparisonChart';
import AttendanceTrendChart from '../components/charts/AttendanceTrendChart';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

export default function AnalyticsScreen() {
  const {
    dashboardData,
    projectStats,
    workerStats,
    taskStats,
    milestoneStats,
    attendanceStats,
    projectProgressByPhase,
    projectStatusChart,
    workerDistribution,
    taskDistribution,
    milestoneChart,
    topWorkers,
    projectComparison,
    attendanceTrend,
    budgetAnalytics,
    loading,
    chartLoading,
    error,

    loadAllCharts,
    refreshAnalytics,
    loadDashboard,
  } = useAnalytics();
  const { authenticated } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data when screen mounts
  useEffect(() => {
    if (authenticated) {
      loadAllCharts();
    }
  }, [authenticated, loadAllCharts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Use activities from dashboardData
  const activities = useMemo(() => {
    return dashboardData?.recentActivities || [];
  }, [dashboardData]);

  // Use deadlines from dashboardData
  const deadlines = useMemo(() => {
    return dashboardData?.upcomingDeadlines || [];
  }, [dashboardData]);

  if (loading && !projectStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading analytics dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Dashboard Header */}
      <DashboardHeader
        title="Analytics"
        subtitle="Business Intelligence Dashboard"
        date={new Date()}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Projects Section */}
      {projectStats && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Projects Overview</Text>
          
          {/* Project Stat Cards */}
          <View style={styles.statsGrid}>
            <KPIStatCard
              icon="briefcase"
              title="Total Projects"
              value={projectStats.total_projects || 0}
              color={COLORS.primary}
              iconBgColor="#EEF2FF"
              delay={100}
            />
            <KPIStatCard
              icon="trending-up"
              title="Avg Progress"
              value={`${projectStats.average_progress || 0}%`}
              color="#10B981"
              iconBgColor="#D1FAE5"
              delay={150}
            />
            <KPIStatCard
              icon="flag"
              title="Milestones"
              value={milestoneStats?.completed || 0}
              subtitle={`${milestoneStats?.total_milestones || 0} total`}
              color="#7C3AED"
              iconBgColor="#EDE9FE"
              delay={200}
            />
          </View>

          {/* Project Charts */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Project Progress by Phase</Text>
            <ProjectProgressChart data={projectProgressByPhase} chartWidth={chartWidth} />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Project Status Distribution</Text>
            <ProjectStatusChart data={projectStatusChart} chartWidth={chartWidth} />
          </View>
        </View>
      )}

      {/* Workers Section */}
      {workerStats && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Workers</Text>
          <Text style={styles.subsectionHeader}>Workers Overview</Text>
          
          {/* Worker Stat Cards */}
          <View style={styles.statsGrid}>
            <KPIStatCard
              icon="checkmark-circle"
              title="Active Workers"
              value={workerStats.active_workers || 0}
              color="#10B981"
              iconBgColor="#D1FAE5"
              delay={250}
            />
          </View>

          {/* Worker Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Worker Distribution</Text>
            <WorkerDistributionChart data={workerDistribution} chartWidth={chartWidth} />
          </View>
        </View>
      )}

      {/* Tasks Section */}
      {taskStats && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Tasks</Text>
          <Text style={styles.subsectionHeader}>Task Overview</Text>
          
          {/* Task Stat Cards */}
          <View style={styles.statsGrid}>
            <KPIStatCard
              icon="list"
              title="Completed Tasks"
              value={taskStats.completed || 0}
              subtitle={`${taskStats.total_tasks || 0} total`}
              color="#3B82F6"
              iconBgColor="#DBEAFE"
              delay={300}
              percentage={taskStats.total_tasks > 0 ? Math.round((taskStats.completed / taskStats.total_tasks) * 100) : 0}
            />
          </View>

          {/* Task Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Task Completion Trend</Text>
            <TaskDistributionChart data={taskDistribution} chartWidth={chartWidth} />
          </View>
        </View>
      )}

      {/* Milestones Section */}
      {milestoneStats && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Milestones</Text>
          <Text style={styles.subsectionHeader}>Milestone Overview</Text>
          
          {/* Milestone Stat Cards */}
          <View style={styles.statsGrid}>
            <KPIStatCard
              icon="flag"
              title="Completed Milestones"
              value={milestoneStats.completed || 0}
              subtitle={`${milestoneStats.total_milestones || 0} total`}
              color="#7C3AED"
              iconBgColor="#EDE9FE"
              delay={350}
            />
          </View>

          {/* Milestone Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Milestone Progress</Text>
            <MilestoneProgressChart data={milestoneChart} chartWidth={chartWidth} />
          </View>
        </View>
      )}

      {/* Attendance Section */}
      {attendanceStats && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Attendance</Text>
          <Text style={styles.subsectionHeader}>Attendance Overview</Text>
          
          {/* Attendance Stat Cards */}
          <View style={styles.statsGrid}>
            <KPIStatCard
              icon="calendar"
              title="Attendance Rate"
              value={`${attendanceStats.attendance_percentage || 0}%`}
              color="#F59E0B"
              iconBgColor="#FEF3C7"
              delay={400}
            />
          </View>

          {/* Attendance Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Attendance Trend (Last 7 Days)</Text>
            <AttendanceTrendChart data={attendanceTrend} chartWidth={chartWidth} />
          </View>
        </View>
      )}

      {/* Additional Charts */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Additional Insights</Text>
        
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Worker Productivity</Text>
          <WorkerProductivityChart data={topWorkers} chartWidth={chartWidth} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Project Comparison</Text>
          <ProjectComparisonChart data={projectComparison} chartWidth={chartWidth} />
        </View>
      </View>

      {/* Activity Timeline */}
      <ActivityTimeline activities={activities} delay={600} />

      {/* Upcoming Deadlines */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Upcoming Deadlines</Text>
        {deadlines.map((deadline, index) => (
          <DeadlineCard
            key={index}
            project={deadline.project}
            dueDate={deadline.dueDate}
            daysRemaining={deadline.daysRemaining}
            priority={deadline.priority}
            delay={700 + index * 100}
          />
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={{ height: SIZES.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.md,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  content: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  statsGrid: {
    flexDirection: 'column',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  statCard: {
    width: '100%',
    marginBottom: SIZES.sm,
  },
  subsectionHeader: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.md,
    marginTop: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: SIZES.sm,
  },
  chartTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SIZES.md,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});