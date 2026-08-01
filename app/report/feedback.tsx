import { RatingStars } from '@/components/common';
import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { navigateToHistory } from '@/src/navigation';
import { useFeedbackVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const { rating, setRating, comment, setComment, loading, error, success, submit } = useFeedbackVM(reportId || '');

  useEffect(() => {
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        navigateToHistory();
      }, 1500);
    }
  }, [success]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await submit();
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <FadeInView delay={0}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Calificar Servicio</Text>
                <Text style={styles.headerSubtitle}>
                  Tu opinión nos ayuda a mejorar el servicio
                </Text>
              </View>
            </FadeInView>

            <FadeInView delay={100}>
              <AnimatedCard containerStyle={styles.card} delay={100}>
                <View style={styles.iconContainer}>
                  <Ionicons name="heart" size={40} color={Colors.secondary} />
                </View>
                <Text style={styles.cardTitle}>¿Cómo fue tu experiencia?</Text>
                <Text style={styles.cardSubtitle}>
                  Tu opinión nos ayuda a mejorar el servicio de agua y luz en tu comunidad.
                </Text>

                <RatingStars
                  rating={rating}
                  onRatingChange={(newRating) => {
                    Haptics.selectionAsync();
                    setRating(newRating);
                  }}
                  size={40}
                  filledColor={Colors.electric}
                  emptyColor={Colors.gray300}
                />

                <Text style={styles.ratingLabel}>
                  {rating === 0 ? 'Selecciona una calificación' :
                    rating === 5 ? '¡Excelente!' :
                      rating === 4 ? 'Muy bueno' :
                        rating === 3 ? 'Regular' :
                          rating === 2 ? 'Malo' : 'Pésimo'}
                </Text>
              </AnimatedCard>
            </FadeInView>

            <FadeInView delay={200} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Comentarios (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Cuéntanos más detalles..."
                placeholderTextColor={Colors.darkGray}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </FadeInView>

            <FadeInView delay={300} style={styles.footer}>
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={Colors.secondary} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {success && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.successDark} />
                  <Text style={styles.successText}>¡Calificación enviada!</Text>
                </View>
              )}
              <AnimatedButton
                title={loading ? "Enviando..." : "Enviar Calificación"}
                onPress={handleSubmit}
                disabled={rating === 0 || loading || success}
                loading={loading}
                buttonStyle={styles.submitButton}
                icon={<Ionicons name="send" size={20} color="white" />}
                iconContainerStyle={{ marginRight: 8 }}
              />
            </FadeInView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
    lineHeight: 20,
  },
  card: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  ratingLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.secondary,
    minHeight: 24,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.light.text,
    minHeight: 120,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    marginTop: Spacing.lg,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    color: Colors.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successText: {
    flex: 1,
    color: Colors.success,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
