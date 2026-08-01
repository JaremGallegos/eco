import { AnimatedButton, Input } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const verifiedDni = typeof params?.dni === 'string' ? params.dni : '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {

    if (!verifiedDni) {
      Alert.alert('Error', 'No se pudo verificar tu identidad. Intenta nuevamente.');
      router.replace('/auth/login');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const email = `${verifiedDni.trim()}@eco.com`;
      const { data, error } = await supabase.rpc('reset_user_password', {
        user_email: email,
        new_password: newPassword
      });

      if (error) {
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ password_hash: newPassword })
          .eq('dni', verifiedDni);

        if (updateError) {
          throw new Error('No se pudo actualizar la contraseña. Por favor contacta con soporte.');
        }
      }

      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada correctamente',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recuperar Contraseña',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: Typography.weights.bold,
          },
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Ionicons name="key" size={64} color={Colors.primary} />
              <Text style={styles.subtitle}>
                Ingresa tu nueva contraseña
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nueva Contraseña"
                placeholder="Mínimo 6 caracteres"
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textGray} />
                }
                rightIcon={
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textGray}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />

              <Input
                label="Confirmar Nueva Contraseña"
                placeholder="Repite la nueva contraseña"
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textGray} />
                }
                rightIcon={
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textGray}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />

              <AnimatedButton
                title="Cambiar Contraseña"
                loading={loading}
                onPress={handleResetPassword}
                disabled={loading}
                buttonStyle={styles.submitButton}
                icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
                iconContainerStyle={{ marginRight: 8 }}
              />

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.replace('/auth/login')}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  form: {
    width: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.infoDark,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
    fontWeight: Typography.weights.semibold,
  },
});
