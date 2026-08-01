import { AnimatedButton, Input } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useForm } from '@/src/hooks';
import { authService } from '@/src/services/auth';
import { reniecService } from '@/src/services/reniec';
import { isValidDNI, isValidPhone } from '@/src/utils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RegisterForm {
  nombres: string;
  apellidos: string;
  telefono: string;
  dni: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [validandoReniec, setValidandoReniec] = useState(false);
  const [dniValidado, setDniValidado] = useState(false);

  const form = useForm<RegisterForm>({
    initialValues: {
      nombres: '',
      apellidos: '',
      telefono: '',
      dni: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof RegisterForm, string>> = {};

      if (!values.nombres.trim()) {
        errors.nombres = 'Nombres es requerido';
      }

      if (!values.apellidos.trim()) {
        errors.apellidos = 'Apellidos es requerido';
      }

      if (!values.telefono) {
        errors.telefono = 'Teléfono es requerido';
      } else if (!isValidPhone(values.telefono)) {
        errors.telefono = 'Teléfono inválido (9 dígitos)';
      }

      if (!values.dni) {
        errors.dni = 'DNI es requerido';
      } else if (!isValidDNI(values.dni)) {
        errors.dni = 'DNI inválido (8 dígitos)';
      }

      if (!values.password) {
        errors.password = 'Contraseña es requerida';
      } else if (values.password.length < 6) {
        errors.password = 'Mínimo 6 caracteres';
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        if (!dniValidado) {
          Alert.alert(
            'Verificación Requerida',
            'Debes verificar tu DNI antes de registrarte. Presiona el botón con el escudo para validar tus datos.',
            [{ text: 'Entendido' }]
          );
          return;
        }
        await authService.signUpWithDni(
          values.dni,
          values.password,
          values.nombres,
          values.apellidos,
          values.telefono
        );

        setTimeout(() => {
          router.push('/auth/setup-services');
        }, 100);
      } catch (error: any) {
        setValidandoReniec(false);
        Alert.alert('Error de registro', error.message || 'No se pudo crear la cuenta');
      }
    },
  });

  const handleValidarReniec = async () => {
    if (!form.values.dni || !isValidDNI(form.values.dni)) {
      Alert.alert('Error', 'Ingresa un DNI válido');
      return;
    }

    if (!form.values.nombres.trim() || !form.values.apellidos.trim()) {
      Alert.alert('Error', 'Ingresa tus nombres y apellidos');
      return;
    }

    try {
      setValidandoReniec(true);
      const validacion = await reniecService.validarDatosConRENIEC(
        form.values.dni,
        form.values.nombres,
        form.values.apellidos
      );
      setValidandoReniec(false);

      if (validacion.isValid) {
        setDniValidado(true);
        Alert.alert(
          '✓ Verificado',
          'Tus datos coinciden con RENIEC',
          [{ text: 'Continuar' }]
        );
      } else {
        setDniValidado(false);
        Alert.alert('Validación', 'Los datos del DNI no coinciden');
      }
    } catch (error: any) {
      setValidandoReniec(false);
      setDniValidado(false);
      Alert.alert('Error', error.message || 'No se pudo verificar con RENIEC');
    }
  };

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la comunidad ECO</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Nombres"
              leftIcon={<Ionicons name="person-outline" size={24} color={Colors.gray500} />}
              value={form.values.nombres}
              onChangeText={form.handleChange('nombres')}
              onBlur={form.handleBlur('nombres')}
              autoCapitalize="words"
              errorMessage={form.touched.nombres ? form.errors.nombres : undefined}
            />

            <Input
              placeholder="Apellidos"
              leftIcon={<Ionicons name="person-outline" size={24} color={Colors.gray500} />}
              value={form.values.apellidos}
              onChangeText={form.handleChange('apellidos')}
              onBlur={form.handleBlur('apellidos')}
              autoCapitalize="words"
              errorMessage={form.touched.apellidos ? form.errors.apellidos : undefined}
            />

            <Input
              placeholder="Teléfono"
              leftIcon={<Ionicons name="call-outline" size={24} color={Colors.gray500} />}
              value={form.values.telefono}
              onChangeText={form.handleChange('telefono')}
              onBlur={form.handleBlur('telefono')}
              keyboardType="phone-pad"
              maxLength={9}
              errorMessage={form.touched.telefono ? form.errors.telefono : undefined}
            />

            <View style={styles.dniContainer}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="DNI"
                  leftIcon={<Ionicons name="card-outline" size={24} color={Colors.gray500} />}
                  rightIcon={
                    dniValidado ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    ) : undefined
                  }
                  value={form.values.dni}
                  onChangeText={(text) => {
                    form.handleChange('dni')(text);
                    setDniValidado(false);
                  }}
                  onBlur={form.handleBlur('dni')}
                  keyboardType="numeric"
                  maxLength={8}
                  errorMessage={form.touched.dni ? form.errors.dni : undefined}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.validarButton,
                  (!form.values.dni || !form.values.nombres || !form.values.apellidos || validandoReniec) &&
                  styles.validarButtonDisabled
                ]}
                onPress={handleValidarReniec}
                disabled={!form.values.dni || !form.values.nombres || !form.values.apellidos || validandoReniec}
              >
                {validandoReniec ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
            {dniValidado && (
              <View style={styles.verificadoContainer}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.verificadoText}>
                  Verificado con RENIEC
                </Text>
              </View>
            )}

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
              errorMessage={form.touched.password ? form.errors.password : undefined}
            />

            <Input
              placeholder="Confirmar Contraseña"
              leftIcon={<Ionicons name="lock-closed-outline" size={24} color={Colors.gray500} />}
              value={form.values.confirmPassword}
              onChangeText={form.handleChange('confirmPassword')}
              onBlur={form.handleBlur('confirmPassword')}
              secureTextEntry={!showPassword}
              errorMessage={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                Después del registro, podrás configurar tus servicios de luz y agua
              </Text>
            </View>

            <AnimatedButton
              title={validandoReniec ? "Validando RENIEC..." : "Registrarse"}
              variant="secondary"
              loading={form.isSubmitting || validandoReniec}
              onPress={form.handleSubmit}
              disabled={form.isSubmitting || validandoReniec || !dniValidado}
            />
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
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  subtitle: {
    color: Colors.gray600,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.xs,
  },
  form: {
    width: '100%',
  },
  dniContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  validarButton: {
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  validarButtonDisabled: {
    backgroundColor: Colors.gray400,
    opacity: 0.6,
  },
  verificadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  verificadoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    fontWeight: Typography.weights.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.info + '15',
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.gray700,
    lineHeight: 20,
  },
});
