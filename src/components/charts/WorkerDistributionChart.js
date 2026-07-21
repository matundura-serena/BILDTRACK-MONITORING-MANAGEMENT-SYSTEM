import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const WorkerDistributionChart = ({ data, title = "Worker Distribution", chartWidth }) => {
  if (!data || !data.chart || !data.chart.datasets || data.chart.datasets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No worker distribution data available</Text>
      </View>
    );
  }

  const chartData = data.chart;
  const summary = data.summary;

  const datasetData = chartData.datasets[0]?.data || [0, 0, 0, 0];

  const pieData = [
    {
      name: 'Active Workers',
      population: datasetData[0] || 0,
      color: '#10B981',
      legendFontColor: COLORS.secondary,
      legendFontSize: 12,
    },
    {
      name: 'Contract Workers',
      population: datasetData[1] || 0,
      color: '#7C3AED',
      legendFontColor: COLORS.secondary,
      legendFontSize: 12,
    },
    {
      name: 'On Leave',
      population: datasetData[2] || 0,
      color: '#F59E0B',
      legendFontColor: COLORS.secondary,
      legendFontSize: 12,
    },
    {
      name: 'Inactive',
      population: datasetData[3] || 0,
      color: '#6B7280',
      legendFontColor: COLORS.secondary,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.total_workers || 0}</Text>
            <Text style={styles.summaryLabel}>Total Workers</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.active_permanent + summary.active_contract || 0}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
        </View>
      )}
      <View style={styles.chartContainer}>
      <PieChart
        data={pieData}
        width={chartWidth || width - SIZES.padding * 2 - 32}
        height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      </View>
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
  chartContainer: {
    alignItems: 'center',
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

export default WorkerDistributionChart;