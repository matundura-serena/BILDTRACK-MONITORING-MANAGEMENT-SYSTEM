import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const WorkerProductivityChart = ({ data, title = "Top 10 Workers by Productivity", chartWidth }) => {
  if (!data || !data.chart || !data.chart.labels || !data.chart.datasets || data.chart.datasets.length === 0 || !data.workers || data.workers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No worker productivity data available</Text>
      </View>
    );
  }

  const chartData = data.chart;
  const workers = data.workers;

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
          width={chartWidth || Math.max(width - SIZES.padding * 2 - 32, workers.length * 80)}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={true}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
          segments={5}
        />
      </ScrollView>
      <View style={styles.workersList}>
        {workers.slice(0, 5).map((worker, index) => (
          <View key={worker.id || index} style={styles.workerItem}>
            <View style={styles.workerRank}>
              <Text style={styles.workerRankText}>#{index + 1}</Text>
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName} numberOfLines={1}>
                {worker.worker_name}
              </Text>
              <Text style={styles.workerDetails}>
                {worker.tasks_completed} tasks • {worker.productivity_score}% productivity
              </Text>
            </View>
          </View>
        ))}
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
  chart: {
    borderRadius: 16,
  },
  workersList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  workerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  workerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerRankText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  workerDetails: {
    fontSize: 12,
    color: COLORS.gray,
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

export default WorkerProductivityChart;