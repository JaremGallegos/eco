import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/ui/FadeInView';
import { BorderRadius, Colors, Gradients, Shadows, Spacing, Typography } from '@/constants/theme';
import { useNotifications } from '@/src/hooks/useNotifications';
import { authService } from '@/src/services/auth';
import { useDashboardVM } from '@/src/viewmodels/useDashboardVM';

const { height } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { stats, loading, reload } = useDashboardVM();
  const { unreadCount } = useNotifications();
  const [profile, setProfile] = useState<any>(null);
  const pulseScale = useSharedValue(1);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1.5 - pulseScale.value,
  }));

  const loadProfile = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      reload();
      loadProfile();
    }, [reload, loadProfile])
  );

  const handleQuickAction = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  }, []);

  const firstName = useMemo(() => {
    return profile?.full_name?.split(' ')[0] || 'Usuario';
  }, [profile]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={Gradients.primary}
        style={styles.topSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.topContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hola, {firstName}</Text>
              <Text style={styles.subtitle}>Bienvenido a ECO</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/notifications');
                }}
              >
                <Ionicons name="notifications" size={20} color={Colors.primary} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <Ionicons name="person" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.mainStatContainer}>
            <View style={styles.statCircleOuter}>

              <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />

              <View style={styles.statCircleInner}>
                {loading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.mainStatNumber}>{stats?.pendingIncidents || 0}</Text>
                    <Text style={styles.mainStatLabel}>Pendientes</Text>
                  </>
                )}
              </View>
            </View>


            <View style={styles.statsDetailContainer}>

              <View style={styles.typeStatItem}>
                <View style={[styles.typeDot, { backgroundColor: Colors.info }]} />
                <Ionicons name="water" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.typeStatValue}>{stats?.incidentsByType?.AGUA || 0}</Text>
              </View>


              <View style={styles.typeStatItem}>
                <View style={[styles.typeDot, { backgroundColor: Colors.warning }]} />
                <Ionicons name="flash" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.typeStatValue}>{stats?.incidentsByType?.LUZ || 0}</Text>
              </View>
            </View>

          </View>
        </SafeAreaView>
      </LinearGradient>


      <View style={styles.bottomSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomContent}
        >
          <View style={styles.dragIndicator} />

          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>


          <FadeInView delay={100}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleQuickAction(() => router.push('/report/create'))}
              style={styles.mainActionBtn}
            >
              <LinearGradient
                colors={Gradients.secondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainActionGradient}
              >
                <View style={styles.mainActionIcon}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
                <View style={styles.mainActionTextContainer}>
                  <Text style={styles.mainActionTitle}>Nuevo Reporte</Text>
                  <Text style={styles.mainActionSubtitle}>Registrar incidencia</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>


          <View style={styles.actionsGrid}>
            <FadeInView delay={200} style={styles.gridItemContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleQuickAction(() => router.push('/map'))}
                style={styles.gridItem}
              >
                <View style={[styles.gridIcon, { backgroundColor: `rgba(33, 150, 243, 0.1)` }]}>
                  <Ionicons name="map" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.gridLabel}>Mapa de Zonas</Text>
                <Text style={styles.gridSubLabel}>Ver incidencias</Text>
              </TouchableOpacity>
            </FadeInView>

            <FadeInView delay={250} style={styles.gridItemContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleQuickAction(() => router.push('/history'))}
                style={styles.gridItem}
              >
                <View style={[styles.gridIcon, { backgroundColor: `rgba(255, 193, 7, 0.1)` }]}>
                  <Ionicons name="time" size={32} color={Colors.secondary} />
                </View>
                <Text style={styles.gridLabel}>Historial</Text>
                <Text style={styles.gridSubLabel}>Mis reportes</Text>
              </TouchableOpacity>
            </FadeInView>
          </View>


          <FadeInView delay={400}>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.infoText}>
                Mantén tus servicios al día reportando a tiempo.
              </Text>
            </View>
          </FadeInView>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    height: height * 0.45,
    paddingHorizontal: Spacing.lg,
  },
  topContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  greeting: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.light.background,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statCircleOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  statCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 1,
  },
  mainStatNumber: {
    fontSize: 42,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 48,
  },
  mainStatLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray600,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: -Spacing.sm,
  },
  typeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeStatValue: {
    color: Colors.light.background,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    overflow: 'hidden',
  },
  bottomContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  mainActionBtn: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.colored.secondary,
  },
  mainActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  mainActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  mainActionTextContainer: {
    flex: 1,
  },
  mainActionTitle: {
    color: Colors.light.background,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  mainActionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.sizes.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  gridItemContainer: {
    flex: 1,
  },
  gridItem: {
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  gridIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gridLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  gridSubLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 82, 88, 0.08)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    lineHeight: 18,
  },
});