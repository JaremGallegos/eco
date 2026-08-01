import { StepIndicator, TypeSelector } from '@/components/common';
import { FailureTypeSelector } from '@/components/FailureTypeSelector';
import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useReportVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateReport() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { location, reportType, setReportType, failureTypeIds, setFailureTypeIds, reset } = useReportVM();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      reset();
    }, [reset])
  );

  useEffect(() => {
    if (type === 'agua' || type === 'luz') {
      setReportType(type);
    }
  }, [type, setReportType]);

  const handleSelectLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/report/location-map' as any);
  };

  const handleTypeSelect = (selectedType: 'agua' | 'luz') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReportType(selectedType);
    setFailureTypeIds([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView delay={0}>
          <View style={styles.header}>
            <StepIndicator totalSteps={2} currentStep={1} />
            <Text style={[styles.title, { fontSize: 28 }]}>
              Tipo y Ubicación
            </Text>
            <Text style={styles.subtitle}>
              Selecciona el tipo de incidencia y su ubicación exacta
            </Text>
          </View>
        </FadeInView>


        <FadeInView delay={100}>
          <AnimatedCard containerStyle={styles.typeCard} delay={100}>
            <View style={styles.typeCardHeader}>
              <Ionicons name="options" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Tipo de incidencia</Text>
            </View>
            <View style={styles.divider} />
            <TypeSelector
              selectedType={reportType}
              onTypeSelect={handleTypeSelect}
            />
          </AnimatedCard>
        </FadeInView>


        {reportType && (
          <FadeInView delay={150}>
            <FailureTypeSelector
              serviceType={reportType === 'agua' ? 'Agua' : 'Electricidad'}
              selectedIds={failureTypeIds}
              onSelect={(ids: number[], names: string[]) => {
                setFailureTypeIds(ids);
                console.log('error:', ids, names);
              }}
              maxSelections={3}
            />
          </FadeInView>
        )}


        <FadeInView delay={200}>
          <AnimatedCard containerStyle={styles.locationCard} delay={200}>
            <View style={styles.locationCardHeader}>
              <Ionicons name="location" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Ubicación del incidente</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.locationDescription}>
              Selecciona en el mapa la ubicación exacta donde ocurre el incidente
            </Text>
            {location ? (
              <FadeInView delay={0}>
                <View style={styles.locationInfo}>
                  <View style={styles.locationHeader}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.successDark} />
                    <Text style={[styles.locationText, { fontSize: 20 }]}>
                      Ubicación seleccionada
                    </Text>
                  </View>
                  {location.district && (
                    <View style={styles.locationDetailRow}>
                      <Ionicons name="location" size={16} color={Colors.primary} />
                      <Text style={styles.locationDetailText}>{location.district}</Text>
                    </View>
                  )}
                  {location.zone && (
                    <View style={styles.locationDetailRow}>
                      <Ionicons name="navigate" size={16} color={Colors.primary} />
                      <Text style={styles.locationDetailText}>{location.zone}</Text>
                    </View>
                  )}
                  {location.postalCode && (
                    <View style={styles.locationDetailRow}>
                      <Ionicons name="pricetag" size={16} color={Colors.primary} />
                      <Text style={styles.locationDetailText}>{location.postalCode}</Text>
                    </View>
                  )}
                  <View style={styles.coordsContainer}>
                    <Text style={styles.coordsText}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </FadeInView>
            ) : (
              <View style={styles.emptyLocation}>
                <Ionicons name="map-outline" size={64} color={Colors.mediumGray} />
                <Text style={styles.emptyLocationText}>
                  No hay ubicación seleccionada
                </Text>
                <Text style={styles.emptyLocationHint}>
                  Toca el botón para seleccionar en el mapa
                </Text>
              </View>
            )}
            <AnimatedButton
              title={location ? 'Cambiar ubicación' : 'Seleccionar en mapa'}
              icon={<Ionicons name="map" size={20} color="white" />}
              iconContainerStyle={{ marginRight: 10 }}
              buttonStyle={styles.mapButton}
              onPress={handleSelectLocation}
            />
          </AnimatedCard>
        </FadeInView>


        {location && (
          <FadeInView delay={300}>
            <AnimatedButton
              title="Continuar al Paso 2"
              icon={<Ionicons name="arrow-forward" size={20} color="white" />}
              iconContainerStyle={{ marginLeft: 10 }}
              iconRight
              buttonStyle={styles.nextButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/report/evidence' as any);
              }}
            />
          </FadeInView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 30,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  title: {
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    lineHeight: 22,
  },
  typeCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  typeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginBottom: Spacing.lg,
  },
  locationCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    marginBottom: Spacing.lg,
    lineHeight: 20,
    fontWeight: Typography.weights.medium,
  },
  locationInfo: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.successBg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationText: {
    color: Colors.success,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.bold,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  locationDetailText: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.semibold,
  },
  coordsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  coordsText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray700,
    fontFamily: 'monospace',
    fontWeight: Typography.weights.medium,
  },
  emptyLocation: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    marginBottom: Spacing.lg,
  },
  emptyLocationText: {
    fontSize: Typography.sizes.md,
    color: Colors.gray500,
    marginTop: Spacing.md,
    fontWeight: Typography.weights.semibold,
  },
  emptyLocationHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },
  mapButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  nextButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
