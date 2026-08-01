import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { addNotificationResponseListener, getUserNotifications } from '../services/notifications';

export interface NotificationData {
  id_notificacion: number;
  mensaje: string;
  fecha_envio: string;
  id_incidencia: number | null;
  estado: { nombre_estado: string };
  incidencia?: { codigo_seguimiento: string } | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const user = await authService.getProfile();
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await getUserNotifications(user.id);
      setNotifications(data);


      const unread = data.filter(
        (n: NotificationData) => n.estado.nombre_estado !== 'LEIDO'
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();


    const subscription = addNotificationResponseListener(() => {
      loadNotifications(true);
    });


    const interval = setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    reload: loadNotifications,
  };
}
