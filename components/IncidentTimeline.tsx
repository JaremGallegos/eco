
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { TimelineEvent } from '@/src/models/AppIncident';
import { getStatusColor, getStatusIcon } from '@/src/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export function IncidentTimeline({ events }: IncidentTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={40} color={Colors.mediumGray} />
        <Text style={styles.emptyText}>No hay historial disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time" size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Historial de Cambios</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.timelineContainer}>
        {events.map((event, index) => {

          const newStatus = event.estado_nuevo?.nombre_estado || event.newStatus;
          const previousStatus = event.estado_anterior?.nombre_estado || event.previousStatus;
          const timestamp = event.fecha_cambio || event.timestamp;
          const comment = event.comentario_interno || event.comment;
          const responsibleUser = event.usuario
            ? `${event.usuario.nombres} ${event.usuario.apellidos}`
            : event.responsibleUser;
          const eventId = event.id_log || event.id;

          const statusColor = getStatusColor(newStatus);
          const statusIcon = getStatusIcon(newStatus);
          const isLast = index === events.length - 1;

          return (
            <View key={eventId} style={styles.eventContainer}>
              <View style={styles.timelineIndicator}>
                <View style={[styles.iconContainer, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
                  <Ionicons name={statusIcon as any} size={18} color={statusColor} />
                </View>
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: statusColor + '30' }]} />}
              </View>

              <View style={[styles.eventContent, isLast && styles.eventContentLast]}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {newStatus}
                  </Text>
                  <Text style={styles.timeText}>
                    {new Date(timestamp).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {previousStatus && (
                  <Text style={styles.transitionText}>
                    Cambió de: <Text style={styles.previousStatus}>{previousStatus}</Text>
                  </Text>
                )}

                {responsibleUser && (
                  <View style={styles.userContainer}>
                    <Ionicons name="person" size={14} color={Colors.textGray} />
                    <Text style={styles.userText}>{responsibleUser}</Text>
                  </View>
                )}

                {comment && (
                  <View style={styles.commentContainer}>
                    <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.textGray} />
                    <Text style={styles.commentText}>{comment}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginVertical: Spacing.sm,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.darkGray,
    fontWeight: Typography.weights.medium,
  },
  eventContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  timelineIndicator: {
    width: 40,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: Colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.gray300,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 20,
  },
  eventContentLast: {
    paddingBottom: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
  },
  transitionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    marginBottom: 6,
  },
  previousStatus: {
    fontWeight: Typography.weights.semibold,
    color: Colors.darkGray,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  userText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    fontWeight: Typography.weights.semibold,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightBackground,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    marginTop: 6,
    gap: 6,
  },
  commentText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
    lineHeight: 18,
  },
});
