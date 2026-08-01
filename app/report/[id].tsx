
import { ServiceIcon, SeverityBadge } from '@/components/badges';
import { DateInfo, LocationInfo, MediaGallery } from '@/components/common';
import { IncidentTimeline } from '@/components/IncidentTimeline';
import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { navigateToEscalation, navigateToFeedback, navigateToHistory } from '@/src/navigation';
import { getStatusColor, getStatusIcon } from '@/src/utils/styles';
import { useDetailVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incident, progress, loading, error, hasBeenRated } = useDetailVM(id ? parseInt(id, 10) : null);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (incident) {
      progressWidth.value = withTiming(progress, {
        duration: 800,
      });
    }
  }, [progress, incident]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FadeInView delay={0}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        </FadeInView>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FadeInView delay={0}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={Colors.secondary} />
            <Text style={styles.errorText}>
              {error || 'Reporte no encontrado'}
            </Text>
            <AnimatedButton
              title="Volver al Historial"
              buttonStyle={styles.backButton}
              onPress={() => navigateToHistory()}
            />
          </View>
        </FadeInView>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(incident.status);
  const statusIcon = getStatusIcon(incident.status);


  const canEscalate = () => {
    const isSolved = incident.status.toLowerCase().includes('solucionado');
    if (isSolved) return false;

    const reportDate = new Date(incident.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reportDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));


    const deadlineExceeded = diffHours >= 24;


    const isTSAPEligible = true;

    return deadlineExceeded && isTSAPEligible;
  };



  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView delay={0}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Ionicons name="document-text" size={28} color={Colors.primary} />
              <Text style={[styles.title, { fontSize: 28 }]}>
                Detalle del Reporte
              </Text>
            </View>
            <View style={styles.trackingContainer}>
              <Ionicons name="barcode" size={18} color={Colors.textGray} />
              <Text style={styles.trackingCode}>{incident.trackingCode}</Text>
            </View>
          </View>
        </FadeInView>


        <FadeInView delay={100}>
          <AnimatedCard containerStyle={styles.statusCard} delay={100}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIconContainer,
                  { backgroundColor: statusColor + '20' },
                ]}
              >
                <Ionicons name={statusIcon as any} size={28} color={statusColor} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Estado</Text>
                <Text
                  style={[styles.statusText, { color: statusColor, fontSize: 20 }]}
                >
                  {incident.status}
                </Text>
              </View>
            </View>
            {incident && (
              <>
                <View style={styles.divider} />
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progreso</Text>
                    <Text style={styles.progressPercentage}>
                      {progress}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        { backgroundColor: statusColor },
                        animatedProgressStyle,
                      ]}
                    />
                  </View>
                </View>
              </>
            )}
          </AnimatedCard>
        </FadeInView>


        <FadeInView delay={200}>
          <AnimatedCard containerStyle={styles.infoCard} delay={200}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Tipo de incidencia</Text>
            </View>
            <View style={styles.divider} />


            <View style={styles.serviceContainer}>
              <ServiceIcon serviceType={incident.serviceType} size="md" />
            </View>


            {incident.failureType && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailsContainer}>
                  <View style={styles.failureTypeRow}>
                    <Ionicons name="alert-circle" size={20} color={Colors.primary} />
                    <View style={styles.failureTypeInfo}>
                      <Text style={styles.failureTypeLabel}>Tipo de Falla</Text>
                      <Text style={styles.failureTypeName}>{incident.failureType.name}</Text>
                    </View>
                  </View>
                  <View style={styles.severityRow}>
                    <Ionicons name="speedometer" size={20} color={Colors.textGray} />
                    <View style={styles.severityInfo}>
                      <Text style={styles.severityLabel}>Severidad:</Text>
                      <SeverityBadge severity={incident.failureType.severity} style={styles.severityBadge} />
                    </View>
                  </View>
                </View>
              </>
            )}


            {incident.sector && (
              <>
                <View style={styles.divider} />
                <View style={styles.sectorRow}>
                  <Ionicons name="business" size={18} color={Colors.primary} />
                  <View style={styles.sectorTextContainer}>
                    <Text style={styles.sectorLabel}>Sector:</Text>
                    <Text style={styles.sectorName}>{incident.sector.name}</Text>
                    {incident.sector.company && (
                      <Text style={styles.sectorCompany}>Empresa: {incident.sector.company}</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </AnimatedCard>
        </FadeInView>


        <FadeInView delay={300}>
          <AnimatedCard containerStyle={styles.infoCard} delay={300}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Ubicación</Text>
            </View>
            <View style={styles.divider} />
            <LocationInfo
              location={{
                ...incident.location,
                address: incident.location.address || undefined
              }}
              showCoords={true}
            />
          </AnimatedCard>
        </FadeInView>


        {incident.media.length > 0 && (
          <FadeInView delay={400}>
            <AnimatedCard containerStyle={styles.infoCard} delay={400}>
              <View style={styles.cardHeader}>
                <Ionicons name="images" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Evidencia</Text>
              </View>
              <View style={styles.divider} />
              <MediaGallery media={incident.media} columns={3} delay={450} />
            </AnimatedCard>
          </FadeInView>
        )}


        <FadeInView delay={500}>
          <AnimatedCard containerStyle={styles.infoCard} delay={500}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Fechas</Text>
            </View>
            <View style={styles.divider} />
            <DateInfo createdAt={incident.createdAt} updatedAt={incident.createdAt} />
          </AnimatedCard>
        </FadeInView>


        {incident.timeline && incident.timeline.length > 0 && (
          <FadeInView delay={550}>
            <AnimatedCard containerStyle={styles.infoCard} delay={550}>
              <IncidentTimeline events={incident.timeline} />
            </AnimatedCard>
          </FadeInView>
        )}


        <FadeInView delay={600}>
          <View style={styles.actionsContainer}>

            {incident.status.toLowerCase().includes('solucionado') && !hasBeenRated && (
              <>
                <AnimatedCard containerStyle={styles.feedbackPromptCard} delay={600}>
                  <View style={styles.feedbackPromptHeader}>
                    <View style={styles.feedbackPromptIcon}>
                      <Ionicons name="star" size={28} color={Colors.electric} />
                    </View>
                    <View style={styles.feedbackPromptTextContainer}>
                      <Text style={styles.feedbackPromptTitle}>
                        ¡Incidencia Resuelta!
                      </Text>
                      <Text style={styles.feedbackPromptSubtitle}>
                        Tu opinión es importante para mejorar el servicio
                      </Text>
                    </View>
                  </View>
                </AnimatedCard>
                <AnimatedButton
                  title="Calificar Servicio Recibido"
                  icon={<Ionicons name="star" size={20} color="white" />}
                  iconContainerStyle={{ marginRight: 10 }}
                  buttonStyle={styles.feedbackButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigateToFeedback(incident.id);
                  }}
                />
              </>
            )}


            {incident.status.toLowerCase().includes('solucionado') && hasBeenRated && (
              <AnimatedCard containerStyle={styles.ratedCard} delay={600}>
                <View style={styles.ratedHeader}>
                  <View style={styles.ratedIcon}>
                    <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
                  </View>
                  <View style={styles.ratedTextContainer}>
                    <Text style={styles.ratedTitle}>
                      ¡Gracias por tu calificación!
                    </Text>
                    <Text style={styles.ratedSubtitle}>
                      Ya has evaluado este servicio
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            )}


            {!incident.status.toLowerCase().includes('solucionado') &&
              !incident.status.toLowerCase().includes('cerrado') &&
              canEscalate() && (
                <>
                  <AnimatedCard containerStyle={styles.escalationPromptCard} delay={600}>
                    <View style={styles.escalationPromptHeader}>
                      <View style={styles.escalationPromptIcon}>
                        <Ionicons name="alert-circle" size={28} color={Colors.errorDark} />
                      </View>
                      <View style={styles.escalationPromptTextContainer}>
                        <Text style={styles.escalationPromptTitle}>
                          Plazo Legal Vencido
                        </Text>
                        <Text style={styles.escalationPromptSubtitle}>
                          Han transcurrido más de 24 horas sin solución
                        </Text>
                      </View>
                    </View>
                  </AnimatedCard>
                  <AnimatedButton
                    title="Generar Documento de Reclamo"
                    icon={<Ionicons name="document-text" size={20} color="white" />}
                    iconContainerStyle={{ marginRight: 10 }}
                    buttonStyle={styles.escalationButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigateToEscalation(incident.id);
                    }}
                  />
                </>
              )}
          </View>
        </FadeInView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: Typography.sizes.lg,
    color: Colors.secondary,
    textAlign: 'center',
    fontWeight: Typography.weights.semibold,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.primary,
    marginLeft: Spacing.md,
    fontWeight: Typography.weights.bold,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  trackingCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    fontWeight: Typography.weights.bold,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGray,
    marginBottom: 4,
    fontWeight: Typography.weights.medium,
  },
  statusText: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xxl,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginVertical: Spacing.sm,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textDark,
    fontWeight: Typography.weights.semibold,
  },
  progressPercentage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    fontWeight: Typography.weights.bold,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray300,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
  actionsContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feedbackPromptCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.infoBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.electric,
  },
  feedbackPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackPromptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warningAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  feedbackPromptTextContainer: {
    flex: 1,
  },
  feedbackPromptTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.infoDark,
    marginBottom: 4,
  },
  feedbackPromptSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.infoDarker,
    lineHeight: 18,
  },
  escalationPromptCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.errorBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.errorDark,
  },
  escalationPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  escalationPromptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.errorAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  escalationPromptTextContainer: {
    flex: 1,
  },
  escalationPromptTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.errorDarker,
    marginBottom: 4,
  },
  escalationPromptSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.errorDarkest,
    lineHeight: 18,
  },
  feedbackButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  escalationButton: {
    backgroundColor: Colors.errorDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.errorDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ratedCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.successBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  ratedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.successAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ratedTextContainer: {
    flex: 1,
  },
  ratedTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: 4,
  },
  ratedSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.successDark,
    lineHeight: 18,
  },
  serviceContainer: {
    paddingVertical: Spacing.xs,
  },
  detailsContainer: {
    gap: Spacing.md,
  },
  failureTypeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  failureTypeInfo: {
    flex: 1,
  },
  failureTypeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  failureTypeName: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    lineHeight: 20,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  severityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
  },
  severityBadge: {
    marginTop: 0,
  },
  sectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectorTextContainer: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sectorLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  sectorName: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  sectorCompany: {
    fontSize: Typography.sizes.sm,
    color: Colors.textGray,
    fontWeight: Typography.weights.regular,
    marginTop: 2,
  },
});
