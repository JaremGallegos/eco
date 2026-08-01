import { AnimatedButton, Input } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { authService } from '@/src/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const normalize = (s: string) => (s || '').replace(/\D/g, '');

  const handleVerify = async () => {
    if (!dni || dni.length !== 8) {
      Alert.alert('Error', 'Ingresa un DNI válido (8 dígitos)');
      return;
    }

    const normPhone = normalize(phone);
    if (!normPhone || normPhone.length < 7) {
      Alert.alert('Error', 'Ingresa un teléfono válido');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('telefono')
        .eq('dni', dni)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        Alert.alert('No encontrado', 'No existe un usuario con ese DNI');
        return;
      }

      const storedPhone = normalize(data.telefono || '');


      const lastInput = normPhone.slice(-9);
      const lastStored = storedPhone.slice(-9);

      if (!lastStored || lastInput !== lastStored) {
        Alert.alert('Error', 'El teléfono no coincide con nuestros registros');
        return;
      }


      await authService.sendPasswordResetEmail(dni);


      router.replace(`/auth/forgot-password?fromVerify=1&dni=${dni}` as any);
    } catch (err: any) {
      console.error('Verify error', err);
      Alert.alert('Error', err.message || 'Error al verificar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verificar identidad',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: Typography.weights.bold },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Ionicons name="person" size={64} color={Colors.primary} />
              <Text style={styles.subtitle}>Para recuperar tu contraseña necesitamos verificar tu identidad</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="DNI"
                placeholder="Ingresa tu DNI (8 dígitos)"
                leftIcon={<Ionicons name="card-outline" size={20} color={Colors.textGray} />}
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
                maxLength={8}
                autoCapitalize="none"
              />

              <Input
                label="Teléfono"
                placeholder="Ingresa tu número móvil"
                leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textGray} />}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={15}
                autoCapitalize="none"
              />

              <AnimatedButton
                title="Verificar y Enviar email"
                loading={loading}
                onPress={handleVerify}
                disabled={loading}
                buttonStyle={styles.submitButton}
                icon={<Ionicons name="send" size={18} color="white" />}
                iconContainerStyle={{ marginRight: 8 }}
              />

              <Text style={styles.note}>
                Tras validar tu DNI y teléfono te enviaremos un correo con instrucciones para restablecer tu contraseña.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.md },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.gray600, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg, marginTop: Spacing.md },
  form: { width: '100%' },
  submitButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  note: { marginTop: Spacing.md, color: Colors.gray600, fontSize: Typography.sizes.sm, textAlign: 'center' },
});
