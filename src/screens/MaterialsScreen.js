import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMaterials } from '../context/MaterialContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function MaterialsScreen({ navigation }) {
  const {
    materials,
    statistics,
    filterOptions,
    loading,
    error,
    loadMaterials,
    refreshMaterials,
    clearError,
  } = useMaterials();

  const { authenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load data on mount
  useEffect(() => {
    if (authenticated) {
      loadMaterialsData();
    }
  }, [authenticated]);

  // Load materials with current filters
  const loadMaterialsData = async () => {
    const filters = {
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      sort: sortBy,
      order: sortOrder,
    };
    await loadMaterials(filters);
  };

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMaterials();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMaterialsData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Filter materials client-side for quick filters
  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          material.material_name?.toLowerCase().includes(query) ||
          material.category?.toLowerCase().includes(query) ||
          material.supplier?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [materials, searchQuery]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return COLORS.success;
      case 'Low Stock':
        return COLORS.warning;
      case 'Out of Stock':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return 'checkmark-circle';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (material) => {
    const available = material.quantity_available || (material.quantity_total - material.quantity_allocated);
    if (!material.quantity_total || material.quantity_total === 0) return 0;
    return Math.round((available / material.quantity_total) * 100);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return 'KSh 0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'KSh 0';
    return `KSh ${numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Navigate to Bulk Material Entry
  const handleBulkEntry = () => {
    navigation.navigate('BulkMaterialEntry');
  };

  // Loading state
  if (loading && !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading materials inventory...</Text>
        </View>
      </View>
    );
  }

  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      {/* Title Section */}
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.headerTitle}>Materials</Text>
          <Text style={styles.headerSubtitle}>Manage inventory, suppliers and stock levels</Text>
        </View>
        <TouchableOpacity style={styles.importButton} onPress={handleBulkEntry}>
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.importButtonText}>Add Materials</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchCard}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {/* Category Filter */}
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory && styles.filterChipActive]}
          onPress={() => setSelectedCategory('')}
        >
          <Ionicons name="cube-outline" size={14} color={selectedCategory ? COLORS.white : COLORS.gray} />
          <Text style={[styles.filterChipText, selectedCategory && styles.filterChipTextActive]}>
            All Categories
          </Text>
        </TouchableOpacity>

        {filterOptions?.categories?.slice(0, 5).map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
          >
            <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Status Filters */}
        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'Low Stock' && styles.filterChipWarning]}
          onPress={() => setSelectedStatus(selectedStatus === 'Low Stock' ? '' : 'Low Stock')}
        >
          <Ionicons name="warning" size={14} color={selectedStatus === 'Low Stock' ? COLORS.white : COLORS.warning} />
          <Text style={[styles.filterChipText, selectedStatus === 'Low Stock' && styles.filterChipTextActive]}>
            Low Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedStatus === 'Out of Stock' && styles.filterChipDanger]}
          onPress={() => setSelectedStatus(selectedStatus === 'Out of Stock' ? '' : 'Out of Stock')}
        >
          <Ionicons name="close-circle" size={14} color={selectedStatus === 'Out of Stock' ? COLORS.white : COLORS.error} />
          <Text style={[styles.filterChipText, selectedStatus === 'Out of Stock' && styles.filterChipTextActive]}>
            Out of Stock
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortOptions}>
            {[
              { key: 'id', label: 'Recent' },
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'quantity', label: 'Quantity' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortChip, sortBy === option.key && styles.sortChipActive]}
                onPress={() => setSortBy(option.key)}
              >
                <Text style={[styles.sortChipText, sortBy === option.key && styles.sortChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Ionicons
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>
          {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} found
        </Text>
      </View>
    </View>
  );

  // Render material card
  const renderMaterialCard = ({ item }) => {
    const progressPercentage = getProgressPercentage(item);
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        style={styles.materialCard}
        onPress={() => navigation.navigate('MaterialDetails', { materialId: item.id })}
        activeOpacity={0.7}
      >
        {/* Left Border Indicator */}
        <View style={[styles.leftBorder, { backgroundColor: statusColor }]} />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.materialName}>{item.material_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Ionicons name={statusIcon} size={14} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.categoryRow}>
              <Ionicons name="cube-outline" size={12} color={COLORS.gray} />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
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
            <Text style={styles.progressText}>{progressPercentage}% Available</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>
                  {Number(item.quantity_available)?.toFixed(2)} / {Number(item.quantity_total)?.toFixed(2)} {item.unit}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="cash-outline" size={16} color={COLORS.success} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Value</Text>
                <Text style={styles.detailValue}>{formatCurrency(item.inventory_value)}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          {item.supplier && (
            <View style={styles.cardFooter}>
              <Ionicons name="business-outline" size={14} color={COLORS.gray} />
              <Text style={styles.footerText} numberOfLines={1}>
                {item.supplier}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={80} color={COLORS.lightGray} />
      </View>
      <Text style={styles.emptyTitle}>No Materials Available</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedCategory || selectedStatus
          ? 'Try adjusting your search criteria'
          : 'Add materials to get started'}
      </Text>
      {!searchQuery && !selectedCategory && !selectedStatus && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleBulkEntry}>
          <Ionicons name="add-circle" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Add Materials</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredMaterials}
        renderItem={renderMaterialCard}
        keyExtractor={(item) => item.id?.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredMaterials.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SIZES.xl * 2,
  },
  emptyListContent: {
    flex: 1,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.xl * 2,
    alignItems: 'center',
    gap: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Header Container
  headerContainer: {
    padding: SIZES.padding,
    gap: SIZES.md,
  },
  // Title Section
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl + 4,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm + 4,
    paddingHorizontal: SIZES.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SIZES.xs,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  importButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Search Card
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  // Filter Chips
  filterContainer: {
    marginBottom: SIZES.sm,
  },
  filterContent: {
    gap: SIZES.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 36,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipWarning: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  filterChipDanger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  // Sort Options
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  sortLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '600',
  },
  sortOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  sortChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 32,
    justifyContent: 'center',
  },
  sortChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: COLORS.white,
  },
  sortOrderButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Results Count
  resultsCountContainer: {
    paddingHorizontal: 4,
    marginBottom: SIZES.sm,
  },
  resultsCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Material Card
  materialCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  leftBorder: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: SIZES.md,
  },
  cardHeader: {
    marginBottom: SIZES.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.xs,
  },
  materialName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: SIZES.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
  },
  // Progress Bar
  progressContainer: {
    marginBottom: SIZES.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray,
    fontWeight: '600',
  },
  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.sm,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontWeight: '500',
    flex: 1,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xl * 2,
    paddingHorizontal: SIZES.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderRadius: BORDER_RADIUS.md,
    gap: SIZES.sm,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});