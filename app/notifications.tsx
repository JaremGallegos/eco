import { FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { getUserNotifications, markNotificationAsRead } from '@/src/services';
import { authService } from '@/src/services/auth';
import { createTestNotifications } from '@/src/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id_notificacion: number;
  mensaje: string;
  fecha_envio: string;
  id_incidencia: number | null;
  estado: { nombre_estado: string };
  incidencia?: { codigo_seguimiento: string } | null;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const user = await authService.getProfile();
      if (!user) {
        return;
      }

      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error :', error);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (notification: Notification) => {

    if (notification.estado.nombre_estado !== 'LEIDO') {
      await markNotificationAsRead(notification.id_notificacion);

      loadNotifications(true);
    }


    if (notification.id_incidencia) {
      router.push(`/report/${notification.id_incidencia}` as any);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(true);
  }, [loadNotifications]);

  const handleCreateTestNotifications = useCallback(async () => {
    try {
      const user = await authService.getProfile();
      if (user) {
        await createTestNotifications(user.id, 5);

        setTimeout(() => loadNotifications(true), 1000);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [loadNotifications]);

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'LEIDO':
        return 'checkmark-done';
      case 'ENTREGADO':
        return 'checkmark';
      case 'ENVIADO':
        return 'arrow-forward';
      default:
        return 'time';
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'LEIDO':
        return Colors.gray600;
      case 'ENTREGADO':
        return Colors.primary;
      case 'ENVIADO':
        return Colors.info;
      default:
        return Colors.gray400;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="notifications" size={28} color={Colors.primary} />
          <Text style={styles.title}>Notificaciones</Text>
        </View>
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <FadeInView delay={0}>
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={64} color={Colors.gray400} />
              <Text style={styles.emptyTitle}>No hay notificaciones aún</Text>
              <Text style={styles.emptySubtitle}>
                Te notificaremos cuando haya actualizaciones en tus reportes.
              </Text>
              <Text style={styles.emptyHint}>
                Las notificaciones aparecerán aquí cuando:
              </Text>
              <View style={styles.hintList}>
                <Text style={styles.hintItem}>• Cambien el estado de tus reportes</Text>
                <Text style={styles.hintItem}>• Un técnico sea asignado</Text>
                <Text style={styles.hintItem}>• Tu reporte sea resuelto</Text>
              </View>
            </View>
          </FadeInView>
        ) : (
          notifications.map((notification, index) => {
            const isRead = notification.estado.nombre_estado === 'LEIDO';
            const stateColor = getStateColor(notification.estado.nombre_estado);
            const stateIcon = getStateIcon(notification.estado.nombre_estado);

            return (
              <FadeInView key={notification.id_notificacion} delay={index * 50}>
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    !isRead && styles.notificationCardUnread,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationHeader}>
                    <View
                      style={[
                        styles.stateIndicator,
                        { backgroundColor: stateColor + '20' },
                      ]}
                    >
                      <Ionicons name={stateIcon} size={18} color={stateColor} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text
                        style={[
                          styles.notificationMessage,
                          !isRead && styles.notificationMessageUnread,
                        ]}
                        numberOfLines={3}
                      >
                        {notification.mensaje}
                      </Text>
                      {notification.incidencia && (
                        <View style={styles.incidentBadge}>
                          <Ionicons
                            name="document-text"
                            size={12}
                            color={Colors.primary}
                          />
                          <Text style={styles.incidentCode}>
                            {notification.incidencia.codigo_seguimiento}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.notificationTime}>
                        {new Date(notification.fecha_envio).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>
                </TouchableOpacity>
              </FadeInView>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.round,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  content: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray600,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gray500,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  emptyHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  hintList: {
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
  },
  hintItem: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    lineHeight: 22,
    marginVertical: 2,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    borderColor: Colors.secondary + '20',
    shadowColor: Colors.secondary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stateIndicator: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  notificationMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textDark,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  notificationMessageUnread: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  incidentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
    gap: 6,
  },
  incidentCode: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  notificationTime: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    marginLeft: Spacing.sm,
    marginTop: 2,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
