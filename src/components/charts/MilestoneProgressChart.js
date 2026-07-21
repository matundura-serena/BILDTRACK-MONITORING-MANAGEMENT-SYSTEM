import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MilestoneProgressChart = ({ data, title = "Milestone Progress", chartWidth }) => {
  if (!data || !data.chart || !data.chart.labels || !data.chart.datasets || data.chart.datasets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No milestone data available</Text>
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
    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
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
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.total_milestones || 0}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.completed || 0}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.overdue || 0}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
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

export default MilestoneProgressChart;