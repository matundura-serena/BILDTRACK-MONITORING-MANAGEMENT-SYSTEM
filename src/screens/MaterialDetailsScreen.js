import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMaterials } from '../context/MaterialContext';
import { COLORS, SIZES, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function MaterialDetailsScreen({ route, navigation }) {
  const { materialId } = route.params;
  const {
    currentMaterial,
    transactions,
    loading,
    loadMaterialById,
    loadTransactions,
  } = useMaterials();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [materialId]);

  const loadData = async () => {
    await loadMaterialById(materialId);
    await loadTransactions(materialId, { limit: 20 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Available': COLORS.success,
      'Low Stock': COLORS.warning,
      'Out of Stock': COLORS.error,
    };
    return statusColors[status] || COLORS.gray;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Available': 'checkmark-circle',
      'Low Stock': 'warning',
      'Out of Stock': 'close-circle',
    };
    return statusIcons[status] || 'help-circle';
  };

  const formatCurrency = (value) => {
    if (!value) return 'KSh 0';
    return `KSh ${parseFloat(value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const transactionConfig = useMemo(() => ({
    'Allocation': { icon: 'arrow-up-circle', color: COLORS.warning },
    'Return': { icon: 'arrow-down-circle', color: COLORS.success },
    'Consumption': { icon: 'checkmark-circle', color: COLORS.primary },
    'Purchase': { icon: 'cart', color: '#10B981' },
    'Adjustment': { icon: 'create', color: '#7C3AED' },
  }), []);

  const getTransactionConfig = (type) => {
    return transactionConfig[type] || { icon: 'help-circle', color: COLORS.gray };
  };

  // Calculate derived values before conditional renders
  const progressPercentage = useMemo(() => {
    if (!currentMaterial?.quantity_total || currentMaterial.quantity_total <= 0) {
      return 0;
    }
    return Math.round((currentMaterial.quantity_available / currentMaterial.quantity_total) * 100);
  }, [currentMaterial?.quantity_available, currentMaterial?.quantity_total]);

  const statusColor = useMemo(() => getStatusColor(currentMaterial?.status), [currentMaterial?.status]);

  if (loading && !currentMaterial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading material details...</Text>
      </View>
    );
  }

  if (!currentMaterial) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cube-outline" size={64} color={COLORS.lightGray} />
        <Text style={styles.errorText}>Material not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{currentMaterial.material_name}</Text>
            <Text style={styles.subtitle}>{currentMaterial.category}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusContainer, { backgroundColor: statusColor + '20' }]}>
          <Ionicons
            name={getStatusIcon(currentMaterial.status)}
            size={20}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {currentMaterial.status}
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Overview</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              <Text style={styles.progressLabel}>Available</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>
                  {Number(currentMaterial.quantity_available || 0).toFixed(2)}
                </Text>
                <Text style={styles.progressStatLabel}>Available</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatValue, { color: COLORS.warning }]}>
                  {Number(currentMaterial.quantity_allocated || 0).toFixed(2)}
                </Text>
                <Text style={styles.progressStatLabel}>Allocated</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>
                  {Number(currentMaterial.quantity_total || 0).toFixed(2)}
                </Text>
                <Text style={styles.progressStatLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quantities Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="cube" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>{currentMaterial.unit}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="cash" size={20} color="#10B981" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Unit Price</Text>
                <Text style={styles.detailValue}>{formatCurrency(currentMaterial.unit_price)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="trending-up" size={20} color="#F59E0B" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Min Stock</Text>
                <Text style={styles.detailValue}>
                  {Number(currentMaterial.minimum_stock || 0).toFixed(2)} {currentMaterial.unit}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="cash" size={20} color="#7C3AED" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Inventory Value</Text>
                <Text style={styles.detailValue}>{formatCurrency(currentMaterial.inventory_value)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Supplier & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier & Location</Text>
          <View style={styles.infoCard}>
            {currentMaterial.supplier && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={18} color={COLORS.gray} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Supplier</Text>
                  <Text style={styles.infoValue}>{currentMaterial.supplier}</Text>
                </View>
              </View>
            )}
            {currentMaterial.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color={COLORS.gray} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{currentMaterial.location}</Text>
                </View>
              </View>
            )}
            {currentMaterial.description && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={18} color={COLORS.gray} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{currentMaterial.description}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="time-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  {(() => {
                    const txConfig = getTransactionConfig(transaction.transaction_type);
                    return (
                      <View style={[styles.transactionIcon, { backgroundColor: txConfig.color + '20' }]}>
                        <Ionicons
                          name={txConfig.icon}
                          size={20}
                          color={txConfig.color}
                        />
                      </View>
                    );
                  })()}
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionType}>{transaction.transaction_type}</Text>
                      <Text style={styles.transactionDate}>{formatDate(transaction.created_at)}</Text>
                    </View>
                    <Text style={styles.transactionNotes} numberOfLines={2}>
                      {transaction.notes || 'No notes'}
                    </Text>
                    {transaction.task_title && (
                      <Text style={styles.transactionTask}>Task: {transaction.task_title}</Text>
                    )}
                  </View>
                  <View style={styles.transactionQuantity}>
                    <Text style={[
                      styles.quantityChange,
                      { color: transaction.quantity_change > 0 ? COLORS.success : transaction.quantity_change < 0 ? COLORS.error : COLORS.gray }
                    ]}>
                      {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Last Updated */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {formatDate(currentMaterial.last_updated)}
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: SIZES.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// RefreshControl is now imported at the top of the file

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
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
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SIZES.md,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SIZES.md,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  progressPercentage: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  detailItem: {
    flex: 1,
    minWidth: (screenWidth - SIZES.padding * 3) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    gap: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginTop: SIZES.md,
  },
  transactionsList: {
    gap: SIZES.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.md,
    gap: SIZES.md,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray,
    fontWeight: '500',
  },
  transactionNotes: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  transactionTask: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionQuantity: {
    alignItems: 'flex-end',
  },
  quantityChange: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
});
