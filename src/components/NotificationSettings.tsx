'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NotificationSettingsProps {
  className?: string;
}

interface UserNotificationSettings {
  notificationsEnabled: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  matchNotifications: boolean;
  soundEnabled: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const { user } = useAuthContext();
  const { permission, requestPermission, isSupported } = useNotifications();
  const [settings, setSettings] = useState<UserNotificationSettings>({
    notificationsEnabled: false,
    messageNotifications: true,
    likeNotifications: true,
    matchNotifications: true,
    soundEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar configuración del usuario
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSettings({
            notificationsEnabled: userData.notificationsEnabled || false,
            messageNotifications: userData.messageNotifications !== false,
            likeNotifications: userData.likeNotifications !== false,
            matchNotifications: userData.matchNotifications !== false,
            soundEnabled: userData.soundEnabled !== false
          });
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Guardar configuración
  const saveSettings = async (newSettings: Partial<UserNotificationSettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      await updateDoc(doc(db, 'users', user.uid), {
        ...updatedSettings,
        lastSettingsUpdate: new Date()
      });
      
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error guardando configuración:', error);
    } finally {
      setSaving(false);
    }
  };

  // Activar notificaciones
  const enableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await saveSettings({ notificationsEnabled: true });
    }
  };

  // Desactivar notificaciones
  const disableNotifications = async () => {
    await saveSettings({ notificationsEnabled: false });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <BellOff className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Las notificaciones no están soportadas en este navegador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
      </div>

      {/* Estado principal de notificaciones */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
            <p className="text-sm text-gray-600">
              {permission === 'granted' 
                ? 'Recibe notificaciones en tiempo real'
                : 'Activa las notificaciones para no perderte mensajes'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {permission === 'granted' ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Activadas</span>
              </div>
            ) : (
              <button
                onClick={enableNotifications}
                disabled={saving}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Activando...' : 'Activar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Configuraciones detalladas */}
      {permission === 'granted' && settings.notificationsEnabled && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 mb-3">Tipos de notificaciones</h4>
          
          {/* Mensajes */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">Mensajes nuevos</span>
              <p className="text-sm text-gray-600">Cuando recibas un mensaje</p>
            </div>
            <button
              onClick={() => saveSettings({ messageNotifications: !settings.messageNotifications })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.messageNotifications ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.messageNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Likes */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">Nuevos likes</span>
              <p className="text-sm text-gray-600">Cuando alguien te dé like</p>
            </div>
            <button
              onClick={() => saveSettings({ likeNotifications: !settings.likeNotifications })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.likeNotifications ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.likeNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Matches */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">Nuevos matches</span>
              <p className="text-sm text-gray-600">Cuando tengas un match</p>
            </div>
            <button
              onClick={() => saveSettings({ matchNotifications: !settings.matchNotifications })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.matchNotifications ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.matchNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sonido */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">Sonido</span>
              <p className="text-sm text-gray-600">Reproducir sonido con las notificaciones</p>
            </div>
            <button
              onClick={() => saveSettings({ soundEnabled: !settings.soundEnabled })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Botón para desactivar */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={disableNotifications}
              disabled={saving}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Desactivar todas las notificaciones</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;