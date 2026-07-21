import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ProjectStatusChart = ({ data, title = "Project Status Distribution", chartWidth }) => {
  if (!data || !data.chart || !data.chart.labels || !data.chart.datasets || data.chart.datasets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No project status data available</Text>
      </View>
    );
  }

  const chartData = data.chart;
  const summary = data.summary;

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
    barPercentage: 0.7,
  };

  const statusColors = {
    'Active': '#10B981',
    'Pending': '#F59E0B',
    'Completed': '#3B82F6',
    'Delayed': '#EF4444',
    'Cancelled': '#6B7280',
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
      {summary && summary.length > 0 && (
        <View style={styles.legendContainer}>
          {summary.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: statusColors[item.status] || '#6B7280' }]} />
              <Text style={styles.legendText}>
                {item.status}: {item.count}
              </Text>
            </View>
          ))}
        </View>
      )}
      <BarChart
        data={safeChartData}
        width={chartWidth || width - SIZES.padding * 2 - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars={true}
        fromZero={true}
        yAxisLabel=""
        yAxisSuffix=""
        segments={5}
      />
    </View>
  );
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  chart: {
    borderRadius: 16,
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

export default ProjectStatusChart;