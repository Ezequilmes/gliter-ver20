'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: NotificationData;
}

type NotificationData = {
  chatId?: string;
  [key: string]: unknown;
};

interface UseNotificationsReturn {
  permission: NotificationPermission;
  token: string | null;
  requestPermission: () => Promise<boolean>;
  sendNotification: (payload: NotificationPayload) => void;
  isSupported: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuthContext();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Verificar soporte para notificaciones
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('Notification' in window && 'serviceWorker' in navigator);
      setPermission(Notification.permission);
    }
  }, []);

  // Obtener token FCM
  useEffect(() => {
    if (!isSupported || !user || permission !== 'granted') return;

    const initializeMessaging = async () => {
      try {
        const messaging = getMessaging();
        
        // Obtener token de registro
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
          setToken(currentToken);
          
          // Guardar token en Firestore
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: currentToken,
            notificationsEnabled: true,
            lastTokenUpdate: new Date()
          });

          console.log('Token FCM obtenido:', currentToken);
        } else {
          console.log('No se pudo obtener el token FCM');
        }
      } catch (error) {
        console.error('Error obteniendo token FCM:', error);
      }
    };

    initializeMessaging();
  }, [isSupported, user, permission]);

  // Enviar notificación local (declarado antes de ser usado en efectos)
  const sendNotification = useCallback((payload: NotificationPayload) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon.svg',
        badge: '/icon.svg',
        tag: 'chat-notification',
        requireInteraction: false,
        silent: false,
        data: payload.data
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Manejar click en notificación
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navegar al chat si es una notificación de mensaje
        if (payload.data?.chatId) {
          window.location.href = `/chat/${payload.data.chatId}`;
        }
        
        notification.close();
      };
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }, [isSupported, permission]);

  // Escuchar mensajes en primer plano
  useEffect(() => {
    if (!isSupported || !user) return;

    const messaging = getMessaging();
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      
      // Mostrar notificación personalizada
      if (payload.notification) {
        sendNotification({
          title: payload.notification.title || 'Nueva notificación',
          body: payload.notification.body || '',
          icon: payload.notification.icon || '/icon.svg',
          data: payload.data
        });
      }
    });

    return () => unsubscribe();
  }, [isSupported, user, sendNotification]);

  // Solicitar permisos de notificación
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('Permisos de notificación concedidos');
        return true;
      } else {
        console.log('Permisos de notificación denegados');
        return false;
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  };

  return {
    permission,
    token,
    requestPermission,
    sendNotification,
    isSupported
  };
};

export default useNotifications;