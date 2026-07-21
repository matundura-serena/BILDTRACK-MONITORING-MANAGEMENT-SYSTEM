import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const AttendanceTrendChart = ({ data, title = "Attendance Trend (Last 7 Days)", chartWidth }) => {
  if (!data || !data.chart || !data.chart.labels || !data.chart.datasets || data.chart.datasets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No attendance trend data available</Text>
      </View>
    );
  }

  const chartData = data.chart;
  const trend = data.trend;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#10B981',
    },
    propsForLines: {
      strokeWidth: 3,
    },
  };

  const safeChartData = {
    labels: chartData.labels || [],
    datasets: [{
      data: chartData.datasets[0]?.data || [0],
    }]
  };

  const avgAttendance = trend && trend.length > 0
    ? Math.round(trend.reduce((sum, day) => sum + (day.workers_present || 0), 0) / trend.length)
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {trend && trend.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgAttendance}</Text>
            <Text style={styles.summaryLabel}>Avg Present</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{trend[0]?.workers_present || 0}</Text>
            <Text style={styles.summaryLabel}>Today</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{trend.length}</Text>
            <Text style={styles.summaryLabel}>Days Tracked</Text>
          </View>
        </View>
      )}
      <LineChart
        data={safeChartData}
        width={chartWidth || width - SIZES.padding * 2 - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withVerticalLines={false}
        withHorizontalLines={true}
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

export default AttendanceTrendChart;