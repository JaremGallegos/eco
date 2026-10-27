import { AnimatedCard, FadeInView, SearchBar, ServiceBadge, StatusBadge } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { navigateToReportDetail } from '@/src/navigation';
import { useHistoryVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function History() {
  const { incidents, loading, error } = useHistoryVM();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'agua' | 'luz'>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = incident.trackingCode.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' ||
        (filterType === 'agua' && incident.serviceType === 'AGUA') ||
        (filterType === 'luz' && incident.serviceType === 'LUZ');
      return matchesSearch && matchesType;
    });
  }, [incidents, search, filterType]);

  const renderReport = ({ item, index }: { item: any; index: number }) => (
    <AnimatedReportCard
      item={item}
      index={index}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FadeInView delay={0}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        </FadeInView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FadeInView delay={0}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </FadeInView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FadeInView delay={0}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="document-text" size={32} color={Colors.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.title, { fontSize: 24 }]}>
                Mis Reportes
              </Text>
              <Text style={styles.subtitle}>
                {filteredIncidents.length} {filteredIncidents.length === 1 ? 'reporte encontrado' : 'reportes encontrados'}
              </Text>
            </View>
          </View>

          <SearchBar
            placeholder="Buscar por código..."
            onChangeText={setSearch}
            value={search}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            round
            showLoading={false}
          />

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterBtn, filterType === 'all' && styles.filterBtnActive]}
              onPress={() => setFilterType('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>Todos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterBtn, filterType === 'agua' && styles.filterBtnWater]}
              onPress={() => setFilterType('agua')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="water"
                size={16}
                color={filterType === 'agua' ? '#fff' : '#2196F3'}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.filterText,
                { color: filterType === 'agua' ? '#fff' : '#2196F3' }
              ]}>Agua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterBtn, filterType === 'luz' && styles.filterBtnElectric]}
              onPress={() => setFilterType('luz')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flash"
                size={16}
                color={filterType === 'luz' ? '#fff' : '#FFC107'}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.filterText,
                { color: filterType === 'luz' ? '#fff' : '#FFC107' }
              ]}>Luz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeInView>
      {filteredIncidents.length === 0 ? (
        <FadeInView delay={100}>
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color={Colors.gray300} />
            <Text style={styles.emptyText}>No se encontraron reportes</Text>
            <Text style={styles.emptySubtext}>
              Intenta con otros filtros o búsqueda
            </Text>
          </View>
        </FadeInView>
      ) : (
        <FlatList
          data={filteredIncidents}
          renderItem={renderReport}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function AnimatedReportCard({
  item,
  index,
}: {
  item: any;
  index: number;
}) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 50;
    setTimeout(() => {
      opacity.value = 1;
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateToReportDetail(item.id);
        }}
        activeOpacity={0.7}
      >
        <AnimatedCard
          containerStyle={styles.reportCard}
          delay={index * 50}
        >
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <View style={styles.trackingRow}>
                <Ionicons name="barcode" size={18} color={Colors.primary} />
                <Text style={styles.trackingCode}>{item.trackingCode}</Text>
              </View>
              <ServiceBadge serviceType={item.serviceType} size="sm" showIcon />
            </View>
            <StatusBadge status={item.status} size="sm" showIcon />
          </View>
          <View style={styles.divider} />
          <View style={styles.reportFooter}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={14} color={Colors.gray600} />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray300} />
          </View>
        </AnimatedCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  title: {
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Typography.sizes.xl,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    fontWeight: Typography.weights.bold,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  reportCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  reportInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trackingCode: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginVertical: Spacing.sm,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginTop: Spacing.sm,
  },
  searchInputContainer: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    height: 44,
  },
  searchInput: {
    fontSize: Typography.sizes.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
    gap: Spacing.xs,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBtnWater: {
    backgroundColor: Colors.water,
    borderColor: Colors.water,
  },
  filterBtnElectric: {
    backgroundColor: Colors.electric,
    borderColor: Colors.electric,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray600,
  },
  filterTextActive: {
    color: Colors.light.background,
  },
});
