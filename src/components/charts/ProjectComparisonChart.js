import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ProjectComparisonChart = ({ data, title = "Project Progress Comparison", chartWidth }) => {
  if (!data || !data.chart || !data.chart.labels || !data.chart.datasets || data.chart.datasets.length === 0 || !data.projects || data.projects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No project comparison data available</Text>
      </View>
    );
  }

  const chartData = data.chart;
  const projects = data.projects;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
  };

  const safeChartData = {
    labels: chartData.labels || [],
    datasets: [{
      data: chartData.datasets[0]?.data || [0],
    }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={safeChartData}
          width={chartWidth || Math.max(width - SIZES.padding * 2 - 32, projects.length * 100)}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix="%"
          segments={5}
        />
      </ScrollView>
      <View style={styles.projectsList}>
        {projects.slice(0, 6).map((project, index) => (
          <View key={project.id || index} style={styles.projectItem}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>
                {project.project_name}
              </Text>
              <Text style={styles.projectDetails}>
                {project.status} • {project.total_tasks} tasks
              </Text>
            </View>
            <View style={[
              styles.progressBadge,
              { backgroundColor: getProgressColor(project.progress) }
            ]}>
              <Text style={styles.progressText}>{project.progress}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const getProgressColor = (progress) => {
  if (progress === 100) return '#10B981';
  if (progress >= 75) return '#3B82F6';
  if (progress >= 50) return '#F59E0B';
  if (progress >= 25) return '#F97316';
  return '#EF4444';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  projectsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  projectDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default ProjectComparisonChart;