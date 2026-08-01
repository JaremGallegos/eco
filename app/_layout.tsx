import { Colors } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReportProvider } from '@/src/contexts/ReportContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setInitialized(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';
    const currentAuthScreen = segments[1];

    if (!session && !inAuthGroup) {
      router.replace('/auth/login' as any);
      return;
    }

    if (
      currentAuthScreen === 'setup-services' ||
      currentAuthScreen === 'forgot-password' ||
      currentAuthScreen === 'verify-identity'
    ) {
      return;
    }

    if (session && inAuthGroup && (currentAuthScreen === 'login' || currentAuthScreen === 'register')) {
      router.replace('/' as any);
    }
  }, [session, segments, initialized]);

  useEffect(() => {
    if (session?.user) {
      import('@/src/services/notifications').then(({
        registerForPushNotificationsAsync,
        addNotificationResponseListener
      }) => {
        registerForPushNotificationsAsync()

        const subscription = addNotificationResponseListener((response) => {
          const incidentId = response.notification.request.content.data?.incidentId;

          if (incidentId) {
            router.push(`/report/${incidentId}` as any);
          }
        });

        return () => subscription.remove();
      }).catch(err => {
        console.error(err);
      });
    }
  }, [session, router]);

  return (
    <SafeAreaProvider>
      <ReportProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="auth/setup-services" options={{ headerShown: false }} />
            <Stack.Screen name="auth/verify-identity" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen
              name="report/create"
              options={{ title: 'Nuevo Reporte', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="report/location-map"
              options={{ title: 'Seleccionar Ubicación', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="report/evidence"
              options={{ title: 'Agregar Evidencia', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="report/[id]"
              options={{
                title: 'Detalle del Reporte',
                headerBackTitle: 'Historial',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.push('/history')} style={{ paddingRight: 20 }}>
                    <Feather name="arrow-left" size={24} color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="report/confirmation"
              options={{
                title: 'Confirmación',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.replace('/')} style={{ paddingRight: 20 }}>
                    <Feather name="arrow-left" size={24} color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="report/escalation"
              options={{ title: 'Asistencia Legal', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="report/feedback"
              options={{ title: 'Calificar Servicio', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="history"
              options={{
                title: 'Historial',
                headerBackTitle: 'Dashboard',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.push('/')} style={{ paddingRight: 20 }}>
                    <Feather name="arrow-left" size={24} color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="map"
              options={{ title: 'Mapa de Incidencias', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="profile/index"
              options={{ title: 'Mi Perfil', headerBackTitle: 'Atrás' }}
            />
            <Stack.Screen
              name="notifications"
              options={{ title: 'Notificaciones', headerBackTitle: 'Atrás' }}
            />

          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </ReportProvider>
    </SafeAreaProvider>
  );
}
