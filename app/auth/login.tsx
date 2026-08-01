import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useForm } from '@/src/hooks';
import { supabase } from '@/src/lib/supabase';
import { authService } from '@/src/services/auth';

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [dniModal, setDniModal] = useState('');
  const [phoneModal, setPhoneModal] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);

  const form = useForm<LoginForm>({
    initialValues: {
      identifier: '',
      password: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginForm, string>> = {};

      if (!values.identifier) {
        errors.identifier = 'DNI o teléfono es requerido';
      } else {

        const isDNI = /^\d{8}$/.test(values.identifier);
        const isPhone = /^9\d{8}$/.test(values.identifier);

        if (!isDNI && !isPhone) {
          errors.identifier = 'Ingresa un DNI válido (8 dígitos) o teléfono (9 dígitos)';
        }
      }

      if (!values.password) {
        errors.password = 'Contraseña es requerida';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await authService.signInWithIdentifier(values.identifier, values.password);
        router.replace('/');
      } catch (error: any) {
        Alert.alert('Error de inicio de sesión', error.message || 'Credenciales inválidas');
      }
    },
  });

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/android-icon-foreground.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>ECO</Text>
            <Text style={styles.subtitle}>Reporte y Gestión de Servicios</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="DNI o Teléfono"
              leftIcon={<Ionicons name="person-outline" size={24} color={Colors.gray500} />}
              value={form.values.identifier}
              onChangeText={form.handleChange('identifier')}
              onBlur={form.handleBlur('identifier')}
              keyboardType="numeric"
              maxLength={9}
              autoCapitalize="none"
              errorMessage={form.touched.identifier ? form.errors.identifier : undefined}
            />

            <Input
              placeholder="Contraseña"
              leftIcon={<Ionicons name="lock-closed-outline" size={24} color={Colors.gray500} />}
              rightIcon={
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={Colors.gray500}
                  onPress={handleTogglePassword}
                />
              }
              value={form.values.password}
              onChangeText={form.handleChange('password')}
              onBlur={form.handleBlur('password')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              errorMessage={form.touched.password ? form.errors.password : undefined}
            />

            <AnimatedButton
              title="Iniciar Sesión"
              variant="primary"
              loading={form.isSubmitting}
              onPress={form.handleSubmit}
              disabled={form.isSubmitting}
            />

            <View style={styles.forgotPassword}>
              <Text
                style={styles.forgotPasswordText}
                onPress={() => setShowVerifyModal(true)}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </View>

            <Modal
              visible={showVerifyModal}
              animationType="fade"
              transparent
              onRequestClose={() => setShowVerifyModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Verificar identidad</Text>
                    <TouchableOpacity onPress={() => setShowVerifyModal(false)}>
                      <Text style={styles.modalClose}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalSubtitle}>Ingresa tu DNI y teléfono para verificar tu identidad</Text>

                  <Input
                    label="DNI"
                    placeholder="Ingresa tu DNI (8 dígitos)"
                    leftIcon={<Ionicons name="card-outline" size={20} color={Colors.textGray} />}
                    value={dniModal}
                    onChangeText={setDniModal}
                    keyboardType="numeric"
                    maxLength={8}
                    autoCapitalize="none"
                  />

                  <Input
                    label="Teléfono"
                    placeholder="Ingresa tu número móvil"
                    leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textGray} />}
                    value={phoneModal}
                    onChangeText={setPhoneModal}
                    keyboardType="phone-pad"
                    maxLength={15}
                    autoCapitalize="none"
                  />

                  <AnimatedButton
                    title="Verificar Identidad"
                    loading={loadingVerify}
                    onPress={async () => {
                      const normalize = (s: string) => (s || '').replace(/\D/g, '');

                      if (!dniModal || dniModal.length !== 8) {
                        Alert.alert('Error', 'Ingresa un DNI válido (8 dígitos)');
                        return;
                      }

                      const normPhone = normalize(phoneModal);
                      if (!normPhone || normPhone.length < 7) {
                        Alert.alert('Error', 'Ingresa un teléfono válido');
                        return;
                      }

                      setLoadingVerify(true);
                      try {
                        const { data, error } = await supabase
                          .from('usuarios')
                          .select('telefono, dni')
                          .eq('dni', dniModal)
                          .maybeSingle();

                        if (error) {
                          throw error;
                        }

                        if (!data) {
                          Alert.alert('No encontrado', 'No existe un usuario con ese DNI');
                          setLoadingVerify(false);
                          return;
                        }

                        const storedPhone = normalize(data.telefono || '');
                        const lastInput = normPhone.slice(-9);
                        const lastStored = storedPhone.slice(-9);

                        if (!lastStored || lastInput !== lastStored) {
                          Alert.alert('Error', 'El teléfono no coincide con nuestros registros');
                          setLoadingVerify(false);
                          return;
                        }

                        setShowVerifyModal(false);
                        router.push(`/auth/forgot-password?verified=1&dni=${dniModal}` as any);
                        setDniModal('');
                        setPhoneModal('');
                      } catch (err: any) {
                        Alert.alert('Error', err.message || 'Error al verificar usuario');
                      } finally {
                        setLoadingVerify(false);
                      }
                    }}
                    disabled={loadingVerify}
                    buttonStyle={styles.verifyButton}
                  />
                </View>
              </View>
            </Modal>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <Link href="/auth/register" asChild>
                <Text style={styles.link}>Regístrate aquí</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: Typography.sizes.huge,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: Colors.gray600,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: Colors.gray600,
    fontSize: Typography.sizes.md,
  },
  link: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  modalClose: {
    color: Colors.gray600,
    fontSize: Typography.sizes.sm,
  },
  modalSubtitle: {
    color: Colors.gray600,
    marginBottom: Spacing.md,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
});
