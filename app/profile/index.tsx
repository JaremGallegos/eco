import { AnimatedButton, Input } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { authService } from '@/src/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  nombres?: string;
  apellidos?: string;
  phone?: string;
  dni?: string;
  full_name?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profile, setProfile] = useState<UserProfile | null>(null);


  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (data) {

        let loadedNombres = data.nombres || '';
        let loadedApellidos = data.apellidos || '';

        if (!loadedNombres && !loadedApellidos && data.full_name) {
          const parts = data.full_name.split(' ');
          loadedNombres = parts[0] || '';
          loadedApellidos = parts.slice(1).join(' ') || '';
        }

        setProfile({
          ...data,
          nombres: loadedNombres,
          apellidos: loadedApellidos
        });
        setNombres(loadedNombres);
        setApellidos(loadedApellidos);
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        nombres,
        apellidos,
        phone,
      });

      const updatedFullName = `${nombres} ${apellidos}`;

      setProfile(prev => prev ? ({
        ...prev,
        nombres,
        apellidos,
        phone,
        full_name: updatedFullName
      }) : null);

      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
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

    setSaving(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={60} color={Colors.white} />
            </View>
            <Text
              style={[styles.name, { fontSize: 18, fontWeight: 'bold' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {profile?.full_name || `${nombres} ${apellidos}` || 'Usuario'}
            </Text>
            <Text style={styles.dni}>DNI: {profile?.dni || '---'}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: 20, fontWeight: 'bold' }]}>
                Datos Personales
              </Text>
              <TouchableOpacity onPress={() => {
                setIsEditing(!isEditing);
              }}>
                <Ionicons
                  name={isEditing ? 'close' : 'create-outline'}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View style={styles.form}>
                <Input
                  label="Nombres"
                  value={nombres}
                  onChangeText={setNombres}
                  leftIcon={
                    <Ionicons name="person-outline" size={20} color={Colors.textGray} />
                  }
                />
                <Input
                  label="Apellidos"
                  value={apellidos}
                  onChangeText={setApellidos}
                  leftIcon={
                    <Ionicons name="person-outline" size={20} color={Colors.textGray} />
                  }
                />
                <Input
                  label="Teléfono"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={
                    <Ionicons name="call-outline" size={20} color={Colors.textGray} />
                  }
                />
                <AnimatedButton
                  title="Guardar Cambios"
                  loading={saving}
                  onPress={handleSave}
                  buttonStyle={styles.saveButton}
                />
              </View>
            ) : (
              <View>
                <View style={styles.listItem}>
                  <Ionicons name="person-outline" size={24} color={Colors.textGray} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Nombres</Text>
                    <Text style={styles.listItemSubtitle}>
                      {profile?.nombres || nombres || 'No especificado'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.listItem}>
                  <Ionicons name="person-outline" size={24} color={Colors.textGray} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Apellidos</Text>
                    <Text style={styles.listItemSubtitle}>
                      {profile?.apellidos || apellidos || 'No especificado'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.listItem}>
                  <Ionicons name="call-outline" size={24} color={Colors.textGray} />
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Teléfono</Text>
                    <Text style={styles.listItemSubtitle}>
                      {profile?.phone || 'No especificado'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 20, fontWeight: 'bold', marginBottom: Spacing.md }]}>
              Servicios Públicos
            </Text>
            <TouchableOpacity
              style={styles.servicesButton}
              onPress={() => router.push('/auth/setup-services')}
            >
              <View style={styles.servicesButtonContent}>
                <View style={styles.servicesIconContainer}>
                  <Ionicons name="flash" size={20} color={Colors.warning} />
                  <Ionicons name="water" size={20} color={Colors.info} style={{ marginLeft: -8 }} />
                </View>
                <View style={styles.servicesTextContainer}>
                  <Text style={styles.servicesButtonTitle}>Gestionar Servicios</Text>
                  <Text style={styles.servicesButtonSubtitle}>
                    Configura tus empresas de luz y agua
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.gray400} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: 20, fontWeight: 'bold' }]}>
                Cambiar Contraseña
              </Text>
              <Ionicons
                name="key-outline"
                size={24}
                color={Colors.primary}
              />
            </View>

            <View style={styles.form}>
              <Input
                label="Contraseña Actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textGray} />
                }
              />
              <Input
                label="Nueva Contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textGray} />
                }
              />
              <Input
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textGray} />
                }
              />
              <AnimatedButton
                title="Actualizar Contraseña"
                loading={saving}
                onPress={handleChangePassword}
                buttonStyle={styles.saveButton}
              />
            </View>
          </View>

          <View style={styles.section}>
            <AnimatedButton
              title="Cerrar Sesión"
              onPress={handleLogout}
              buttonStyle={styles.logoutButton}
              titleStyle={styles.logoutButtonText}
              icon={
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={Colors.secondary}
                  style={{ marginRight: 10 }}
                />
              }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.light.background,
    marginBottom: Spacing.lg,
  },
  name: {
    marginTop: Spacing.md,
    color: Colors.primary,
  },
  dni: {
    color: Colors.gray600,
    marginTop: 5,
  },
  section: {
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
  },
  form: {
    marginTop: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.secondary,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  logoutButtonText: {
    color: Colors.secondary,
    fontWeight: Typography.weights.bold,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  listItemContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  listItemTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.light.text,
    fontWeight: Typography.weights.semibold,
  },
  listItemSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginLeft: 40,
  },
  servicesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  servicesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  servicesIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  servicesTextContainer: {
    flex: 1,
  },
  servicesButtonTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray800,
    marginBottom: 2,
  },
  servicesButtonSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
  },
});