
import { AnimatedButton, AnimatedCard } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { navigateToReportDetail } from '@/src/navigation';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Confirmation() {
  const { trackingCode, reportId } = useLocalSearchParams<{
    trackingCode?: string;
    reportId?: string;
  }>();
  const router = useRouter();

  const handleViewDetail = () => {
    if (reportId) {
      const numericId = parseInt(reportId, 10);
      if (!isNaN(numericId)) {
        navigateToReportDetail(numericId);
      } else {
        router.replace('/');
      }
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check-circle" size={80} color={Colors.successDark} />
        </View>

        <Text style={[styles.title, { fontSize: 28 }]}>
          ¡Reporte Enviado!
        </Text>
        <Text style={styles.subtitle}>
          Tu incidencia ha sido reportada exitosamente
        </Text>

        {trackingCode && (
          <AnimatedCard containerStyle={styles.codeCard}>
            <Text style={styles.codeTitle}>Código de Seguimiento</Text>
            <View style={styles.divider} />
            <Text style={styles.trackingCode}>{trackingCode}</Text>
            <Text style={styles.codeHint}>
              Podrás ver el seguimiento de este reporte en la lista de reportes
            </Text>
          </AnimatedCard>
        )}

        <View style={styles.actionsContainer}>
          <AnimatedButton
            title="Ver Detalle del Reporte"
            icon={<Feather name="eye" size={20} color="white" />}
            iconContainerStyle={{ marginRight: 10 }}
            buttonStyle={styles.primaryButton}
            onPress={handleViewDetail}
          />
          <AnimatedButton
            title="Ir al Inicio"
            icon={<Feather name="home" size={20} color={Colors.primary} />}
            iconContainerStyle={{ marginRight: 10 }}
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
            onPress={() => {
              router.dismissAll();
              router.replace('/');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: Typography.weights.medium,
  },
  codeCard: {
    borderRadius: BorderRadius.md,
    width: '100%',
    marginBottom: 30,
  },
  codeTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginBottom: Spacing.sm,
  },
  trackingCode: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: Spacing.sm,
  },
  codeHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  actionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
});

