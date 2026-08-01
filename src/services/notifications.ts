import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { authService } from './auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationState = 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'LEIDO';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones de Incidencias',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return undefined;
    }

    try {


      let tokenData;

      try {

        const Constants = await import('expo-constants').then(m => m.default);
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;


        const isValidUUID = projectId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);

        if (isValidUUID) {
          tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        } else {
          if (projectId && !isValidUUID) {
            console.warn('Invalid projectId');
          }

          tokenData = await Notifications.getExpoPushTokenAsync();
        }
      } catch (configError: any) {
        try {
          tokenData = await Notifications.getExpoPushTokenAsync();
        } catch (fallbackError) {
          throw fallbackError;
        }
      }

      token = tokenData.data;


      const user = await authService.getProfile();
      if (user && token) {
        await supabase
          .from('usuarios')
          .update({ push_token: token })
          .eq('id_usuario', user.id);
      }
    } catch (e: any) {
      console.error('Error token:', e?.message || e);
    }
  } else {
    console.warn('Error');
  }

  return token;
}

export async function createNotification(
  userId: number,
  message: string,
  incidentId?: number
): Promise<number | null> {
  try {
    const { data: stateData } = await supabase
      .from('estados_notificacion')
      .select('id_estado_notificacion')
      .eq('nombre_estado', 'PENDIENTE')
      .single();

    if (!stateData) {
      return null;
    }

    const { data, error } = await supabase
      .from('notificacion_push')
      .insert({
        id_usuario: userId,
        id_incidencia: incidentId || null,
        mensaje: message,
        id_estado_envio: stateData.id_estado_notificacion,
      })
      .select('id_notificacion')
      .single();

    if (error) {
      return null;
    }

    return data.id_notificacion;
  } catch (error) {
    return null;
  }
}

export async function updateNotificationState(
  notificationId: number,
  newState: NotificationState
): Promise<boolean> {
  try {
    const { data: stateData } = await supabase
      .from('estados_notificacion')
      .select('id_estado_notificacion')
      .eq('nombre_estado', newState)
      .single();

    if (!stateData) {
      return false;
    }

    const { error } = await supabase
      .from('notificacion_push')
      .update({ id_estado_envio: stateData.id_estado_notificacion })
      .eq('id_notificacion', notificationId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  incidentId?: number
): Promise<boolean> {
  try {

    const notificationId = await createNotification(userId, `${title}: ${body}`, incidentId);
    if (!notificationId) return false;


    const { data: userData } = await supabase
      .from('usuarios')
      .select('push_token')
      .eq('id_usuario', userId)
      .single();

    if (!userData?.push_token) {
      return false;
    }

    const message = {
      to: userData.push_token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        incidentId: incidentId,
        notificationId: notificationId
      },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      await updateNotificationState(notificationId, 'ENVIADO');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  return await updateNotificationState(notificationId, 'LEIDO');
}

export async function getUserNotifications(userId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notificacion_push')
      .select(`
        *,
        estado:estados_notificacion(nombre_estado),
        incidencia:incidencias(codigo_seguimiento)
      `)
      .eq('id_usuario', userId)
      .order('fecha_envio', { ascending: false })
      .limit(50);

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export function addNotificationResponseListener(
  callback: (notification: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const notificationId = response.notification.request.content.data?.notificationId;


    if (notificationId) {
      await markNotificationAsRead(notificationId as number);
    }

    callback(response);
  });
}

export async function createTestNotifications(userId: number, count: number = 3): Promise<void> {
  try {
    const testMessages = [
      'Tu reporte de fuga de agua ha sido recibido y está en revisión',
      'Un técnico ha sido asignado a tu reporte de corte de luz',
      'Tu reporte ha sido marcado como "En Camino". El técnico llegará pronto',
      'Tu reporte de fuga de agua ha sido resuelto satisfactoriamente',
      'Se requiere información adicional sobre tu reporte',
    ];

    for (let i = 0; i < count; i++) {
      const message = testMessages[i % testMessages.length];
      await createNotification(userId, message, undefined);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
