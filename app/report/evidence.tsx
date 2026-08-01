
import { StepIndicator } from '@/components/common';
import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useReportVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const { width } = Dimensions.get('window');
const MEDIA_SIZE = (width - 60) / 3;

export default function ReportEvidence() {
  const {
    location,
    media,
    loading,
    error,
    addPhotoFromLibrary,
    addPhotoFromCamera,
    removeMedia,
    submitNewReport,
  } = useReportVM();
  const router = useRouter();

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const report = await submitNewReport();
    if (report) {
      router.push({
        pathname: '/report/confirmation',
        params: {
          trackingCode: report.trackingCode,
          reportId: report.id,
        },
      } as any);
    }
  };

  const handleRemoveMedia = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeMedia(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FadeInView delay={0}>
            <View style={styles.header}>
              <StepIndicator totalSteps={2} currentStep={2} />
              <Text style={[styles.title, { fontSize: 28 }]}>
                Agregar Evidencia
              </Text>
              <Text style={styles.subtitle}>
                Sube hasta 3 fotos o 1 video del problema
              </Text>
            </View>
          </FadeInView>


          {media.length > 0 && (
            <FadeInView delay={100}>
              <View style={styles.mediaContainer}>
                {media.map((item: any, index: number) => (
                  <AnimatedMediaItem
                    key={index}
                    uri={item.uri}
                    type={item.type}
                    index={index}
                    onRemove={() => handleRemoveMedia(index)}
                    delay={150 + index * 50}
                  />
                ))}
              </View>
            </FadeInView>
          )}


          {media.length < 3 && !media.some((m: any) => m.type === 'video') && (
            <FadeInView delay={200}>
              <View style={styles.actionsContainer}>
                <AnimatedButton
                  title="Tomar foto/video"
                  icon={<Ionicons name="camera" size={20} color="white" />}
                  iconContainerStyle={{ marginRight: 10 }}
                  buttonStyle={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addPhotoFromCamera();
                  }}
                />
                <AnimatedButton
                  title="Elegir de galería"
                  icon={<Ionicons name="images" size={20} color="white" />}
                  iconContainerStyle={{ marginRight: 10 }}
                  buttonStyle={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addPhotoFromLibrary();
                  }}
                />
              </View>
            </FadeInView>
          )}

          {media.length === 0 && (
            <FadeInView delay={300}>
              <AnimatedCard containerStyle={styles.emptyMediaCard} delay={300}>
                <View style={styles.emptyMediaContent}>
                  <Ionicons name="images-outline" size={64} color={Colors.mediumGray} />
                  <Text style={styles.emptyMediaText}>
                    No hay evidencia agregada
                  </Text>
                  <Text style={styles.emptyMediaHint}>
                    Agrega hasta 3 fotos o 1 video para documentar el incidente
                  </Text>
                </View>
              </AnimatedCard>
            </FadeInView>
          )}

          {!location && (
            <FadeInView delay={400}>
              <AnimatedCard containerStyle={styles.warningCard} delay={400}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning" size={28} color={Colors.warning} />
                  <Text style={styles.warningText}>
                    Falta seleccionar la ubicación. Por favor, regresa al paso anterior.
                  </Text>
                </View>
                <AnimatedButton
                  title="Volver a seleccionar ubicación"
                  icon={<Ionicons name="arrow-back" size={20} color="white" />}
                  iconContainerStyle={{ marginRight: 10 }}
                  buttonStyle={styles.backButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                  }}
                />
              </AnimatedCard>
            </FadeInView>
          )}

          {error && (
            <FadeInView delay={400}>
              <AnimatedCard containerStyle={styles.errorCard} delay={400}>
                <View style={styles.errorContent}>
                  <Ionicons name="alert-circle" size={24} color={Colors.secondary} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </AnimatedCard>
            </FadeInView>
          )}
        </ScrollView>


        <SafeAreaView style={styles.submitContainer} edges={['bottom']}>
          <AnimatedButton
            title={loading ? 'Enviando reporte...' : 'Enviar reporte'}
            icon={
              loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )
            }
            iconContainerStyle={{ marginRight: 10 }}
            buttonStyle={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading || !location || media.length === 0}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


function AnimatedMediaItem({
  uri,
  type,
  index,
  onRemove,
  delay,
}: {
  uri: string;
  type: 'image' | 'video';
  index: number;
  onRemove: () => void;
  delay: number;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = 1;
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.mediaItem}>
        <Image source={{ uri }} style={styles.mediaImage} contentFit="cover" />
        {type === 'video' && (
          <View style={styles.videoIndicator}>
            <Ionicons name="videocam" size={20} color="white" />
          </View>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
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
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  mediaItem: {
    width: MEDIA_SIZE,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.blackAlpha,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.secondaryAlphaMedium,
    borderRadius: BorderRadius.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  emptyMediaCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxxl,
    marginBottom: Spacing.lg,
  },
  emptyMediaContent: {
    alignItems: 'center',
  },
  emptyMediaText: {
    fontSize: Typography.sizes.md,
    color: Colors.gray500,
    marginTop: Spacing.md,
    fontWeight: Typography.weights.semibold,
  },
  emptyMediaHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray400,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: Colors.warningBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  warningText: {
    color: Colors.warningDark,
    fontSize: Typography.sizes.sm,
    marginLeft: Spacing.md,
    flex: 1,
    fontWeight: Typography.weights.semibold,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  errorCard: {
    backgroundColor: Colors.errorBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.secondary,
    fontSize: Typography.sizes.sm,
    marginLeft: Spacing.md,
    flex: 1,
    fontWeight: Typography.weights.semibold,
  },
  submitContainer: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
