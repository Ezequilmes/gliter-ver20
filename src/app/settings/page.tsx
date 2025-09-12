'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Heart, 
  Ban, 
  LogOut,
  Camera,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { User as UserType } from '@/types';
import Image from 'next/image';

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    edad: 18,
    genero: '',
    rolSexual: '' as 'pasivo' | 'activo' | 'versátil' | ''
  });
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    nearbyUsers: false
  });
  const [privacy, setPrivacy] = useState({
    showAge: true,
    showLocation: true,
    showOnlineStatus: true,
    showRole: true
  });
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push('/auth');
      }
    });
    return unsubscribe;
  }, [router]);

  // Mock data para demo
  useEffect(() => {
    if (user) {
      const mockProfile: UserType = {
        uid: user.uid,
        nombre: 'Tu Usuario',
        edad: 25,
        genero: 'Hombre',
        ubicacion: { lat: -34.6037, lng: -58.3816 },
        rolSexual: 'versátil',
        fotoPerfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        fotosAdicionales: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop'
        ],
        favoritos: [],
        bloqueados: ['blocked1', 'blocked2'],
        lastOnline: new Date(),
        email: user.email || 'tu@example.com'
      };

      const mockBlockedUsers: UserType[] = [
        {
          uid: 'blocked1',
          nombre: 'Usuario Bloqueado 1',
          edad: 30,
          genero: 'Hombre',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: null,
          fotoPerfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(),
          email: 'blocked1@example.com'
        },
        {
          uid: 'blocked2',
          nombre: 'Usuario Bloqueado 2',
          edad: 28,
          genero: 'Mujer',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'pasivo',
          fotoPerfil: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(),
          email: 'blocked2@example.com'
        }
      ];

      setUserProfile(mockProfile);
      setEditForm({
        nombre: mockProfile.nombre,
        edad: mockProfile.edad,
        genero: mockProfile.genero,
        rolSexual: (mockProfile.rolSexual === null ? '' : mockProfile.rolSexual) as 'pasivo' | 'activo' | 'versátil' | '',
      });
      setBlockedUsers(mockBlockedUsers);
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        ...editForm,
        rolSexual: editForm.rolSexual === '' ? null : editForm.rolSexual
      };
      setUserProfile(updatedProfile);
      setIsEditing(false);
      console.log('Perfil actualizado:', updatedProfile);
    }
  };

  const handleUnblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.uid !== userId));
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        bloqueados: userProfile.bloqueados.filter(id => id !== userId)
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Perfil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Mi Perfil
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>

          <div className="flex items-start space-x-6">
            {/* Foto de perfil */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={userProfile.fotoPerfil}
                  alt={userProfile.nombre}
                  width={96}
                  height={96}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;base64,${btoa(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
                        <rect width="96" height="96" fill="#a855f7"/>
                        <text x="48" y="60" text-anchor="middle" fill="white" font-size="32" font-weight="bold">
                          ${userProfile.nombre.charAt(0).toUpperCase()}
                        </text>
                      </svg>`
                    )}`;
                  }}
                />
              </div>
              <button className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Información del perfil */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad
                      </label>
                      <input
                        type="number"
                        value={editForm.edad}
                        onChange={(e) => setEditForm({...editForm, edad: parseInt(e.target.value)})}
                        min="18"
                        max="100"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género
                      </label>
                      <select
                        value={editForm.genero}
                        onChange={(e) => setEditForm({...editForm, genero: e.target.value})}
                        className="input-field"
                      >
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="No binario">No binario</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol Sexual
                    </label>
                    <select
                      value={editForm.rolSexual}
                      onChange={(e) => setEditForm({...editForm, rolSexual: e.target.value as any})}
                      className="input-field"
                    >
                      <option value="">No especificar</option>
                      <option value="activo">Activo</option>
                      <option value="pasivo">Pasivo</option>
                      <option value="versátil">Versátil</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar cambios</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">{userProfile.nombre}</h3>
                  <p className="text-gray-600">{userProfile.edad} años • {userProfile.genero}</p>
                  <p className="text-gray-600">{userProfile.email}</p>
                  {userProfile.rolSexual && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      userProfile.rolSexual === 'activo' ? 'bg-blue-100 text-blue-800' :
                      userProfile.rolSexual === 'pasivo' ? 'bg-pink-100 text-pink-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {userProfile.rolSexual}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <Bell className="w-5 h-5 mr-2" />
            Notificaciones
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'newMatches', label: 'Nuevos matches', desc: 'Recibir notificaciones cuando alguien te dé like' },
              { key: 'messages', label: 'Mensajes', desc: 'Notificaciones de nuevos mensajes' },
              { key: 'likes', label: 'Likes recibidos', desc: 'Cuando alguien marca tu perfil como favorito' },
              { key: 'nearbyUsers', label: 'Usuarios cercanos', desc: 'Notificar cuando hay nuevos usuarios cerca' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <Shield className="w-5 h-5 mr-2" />
            Privacidad
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'showAge', label: 'Mostrar edad', desc: 'Otros usuarios pueden ver tu edad' },
              { key: 'showLocation', label: 'Mostrar ubicación', desc: 'Permitir que otros vean tu distancia aproximada' },
              { key: 'showOnlineStatus', label: 'Estado en línea', desc: 'Mostrar cuando estás activo' },
              { key: 'showRole', label: 'Mostrar rol sexual', desc: 'Otros usuarios pueden ver tu rol sexual' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy[item.key as keyof typeof privacy]}
                    onChange={(e) => setPrivacy({
                      ...privacy,
                      [item.key]: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Usuarios bloqueados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <Ban className="w-5 h-5 mr-2" />
            Usuarios Bloqueados ({blockedUsers.length})
          </h2>
          
          {blockedUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No has bloqueado a ningún usuario
            </p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div key={blockedUser.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={blockedUser.fotoPerfil}
                        alt={blockedUser.nombre}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{blockedUser.nombre}</h4>
                      <p className="text-sm text-gray-500">{blockedUser.edad} años</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(blockedUser.uid)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cerrar sesión */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;