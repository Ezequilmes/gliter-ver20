'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Ban, 
  LogOut,
  Camera,
  Edit3,
  Save,
  X,
  CreditCard,
  Coins,
  Settings as SettingsIcon
} from 'lucide-react';

import { User as UserType } from '@/types';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';

import CreditStore from '@/components/CreditStore';
import ProtectedRoute from '@/components/ProtectedRoute';

const SettingsPage = () => {
  const { user } = useAuthContext();
  const { credits } = useCredits();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'credits' | 'privacy' | 'blocked' | 'account'>('profile');
  const [showCreditStore, setShowCreditStore] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    edad: 18,
    genero: '',
    rolSexual: '' as 'pasivo' | 'activo' | 'versatil' | ''
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
    if (!user) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);



  // Mock data para demo
  useEffect(() => {
    if (user) {
      const mockProfile: UserType = {
        uid: user.uid,
        nombre: 'Tu Usuario',
        edad: 25,
        genero: 'Hombre',
        ubicacion: { lat: -34.6037, lng: -58.3816 },
        rolSexual: 'versatil',
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
        rolSexual: (mockProfile.rolSexual === null ? '' : mockProfile.rolSexual) as 'pasivo' | 'activo' | 'versatil' | '',
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
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuracion...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Configuracion</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Coins className="w-4 h-4" />
                  <span>{credits?.balance || 0} créditos</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userProfile?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex space-x-8 overflow-x-auto">
              {([
                { id: 'profile', label: 'Perfil', icon: User },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'credits', label: 'Créditos', icon: CreditCard },
                { id: 'privacy', label: 'Privacidad', icon: Shield },
                { id: 'blocked', label: 'Bloqueados', icon: Ban },
                { id: 'account', label: 'Cuenta', icon: SettingsIcon }
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                    {userProfile?.fotoPerfil ? (
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
                                ${userProfile?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                              </text>
                            </svg>`
                          )}`;
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {userProfile?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Informacion del perfil */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          id="nombre"
                          type="text"
                          value={editForm.nombre}
                          onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
                            Edad
                          </label>
                          <input
                            id="edad"
                            type="number"
                            value={editForm.edad}
                            onChange={(e) => setEditForm({...editForm, edad: parseInt(e.target.value)})}
                            min="18"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
                            Genero
                          </label>
                          <select
                            id="genero"
                            value={editForm.genero}
                            onChange={(e) => setEditForm({...editForm, genero: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="Hombre">Hombre</option>
                            <option value="Mujer">Mujer</option>
                            <option value="No binario">No binario</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="rolSexual" className="block text-sm font-medium text-gray-700 mb-1">
                          Rol Sexual
                        </label>
                        <select
                          id="rolSexual"
                          value={editForm.rolSexual}
                          onChange={(e) => setEditForm({...editForm, rolSexual: e.target.value as 'pasivo' | 'activo' | 'versatil' | ''})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">No especificar</option>
                          <option value="activo">Activo</option>
                          <option value="pasivo">Pasivo</option>
                          <option value="versatil">Versatil</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleSaveProfile}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar cambios</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">{userProfile?.nombre || 'Usuario'}</h3>
                      <p className="text-gray-600">{userProfile?.edad || 0} anos • {userProfile?.genero || 'No especificado'}</p>
                      <p className="text-gray-600">{userProfile?.email || user?.email || 'No especificado'}</p>
                      {userProfile?.rolSexual && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            userProfile.rolSexual === 'activo'
                              ? 'bg-blue-100 text-blue-800'
                              : userProfile.rolSexual === 'pasivo'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {userProfile.rolSexual}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                <Bell className="w-5 h-5 mr-2" />
                Notificaciones
              </h2>
              
              <div className="space-y-4">
                {[
                  { key: 'newMatches', label: 'Nuevos matches', desc: 'Recibir notificaciones cuando alguien te de like' },
                  { key: 'messages', label: 'Mensajes', desc: 'Notificaciones de nuevos mensajes' },
                  { key: 'likes', label: 'Likes recibidos', desc: 'Cuando alguien marca tu perfil como favorito' },
                  { key: 'nearbyUsers', label: 'Usuarios cercanos', desc: 'Notificar cuando hay nuevos usuarios cerca' }
                ].map((item) => {
                  const inputId = `notif-${String(item.key)}`;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          id={inputId}
                          type="checkbox"
                          aria-label={item.label}
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={inputId}
                          className="relative inline-flex items-center cursor-pointer"
                        >
                          <span className="sr-only">{item.label}</span>
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Mis Créditos
                </h2>
                <button
                  onClick={() => setShowCreditStore(true)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Comprar Créditos
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Coins className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{credits?.balance || 0} Créditos</h3>
                <p className="text-gray-600 mb-6">Usa tus créditos para funciones premium</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Super Like</h4>
                    <p className="text-sm text-gray-600 mb-2">1 crédito</p>
                    <p className="text-xs text-gray-500">Destaca tu like</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Boost</h4>
                    <p className="text-sm text-gray-600 mb-2">5 créditos</p>
                    <p className="text-xs text-gray-500">Aparece primero por 30 min</p>
                  </div>
                </div>
              </div>
              
              {showCreditStore && (
                <CreditStore
                  onClose={() => setShowCreditStore(false)}
                />
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                <Shield className="w-5 h-5 mr-2" />
                Privacidad
              </h2>
              
              <div className="space-y-4">
                {[
                  { key: 'showAge', label: 'Mostrar edad', desc: 'Otros usuarios pueden ver tu edad' },
                  { key: 'showLocation', label: 'Mostrar ubicacion', desc: 'Permitir que otros vean tu distancia aproximada' },
                  { key: 'showOnlineStatus', label: 'Estado en linea', desc: 'Mostrar cuando estas activo' },
                  { key: 'showRole', label: 'Mostrar rol sexual', desc: 'Otros usuarios pueden ver tu rol sexual' }
                ].map((item) => {
                  const inputId = `privacy-${String(item.key)}`;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          id={inputId}
                          type="checkbox"
                          aria-label={item.label}
                          checked={privacy[item.key as keyof typeof privacy]}
                          onChange={(e) =>
                            setPrivacy({
                              ...privacy,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer">
                          <span className="sr-only">{item.label}</span>
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                <Ban className="w-5 h-5 mr-2" />
                Usuarios Bloqueados ({blockedUsers.length})
              </h2>
              
              {blockedUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No has bloqueado a ningun usuario
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
                          <p className="text-sm text-gray-500">{blockedUser.edad} anos</p>
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
          )}

          {activeTab === 'account' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Configuracion de Cuenta
              </h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Informacion de la cuenta</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Miembro desde</span>
                      <span className="text-sm font-medium text-gray-900">Enero 2024</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">Acciones de cuenta</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium text-gray-900">Cambiar contraseña</span>
                      <p className="text-xs text-gray-500 mt-1">Actualiza tu contraseña de acceso</p>
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium text-gray-900">Descargar mis datos</span>
                      <p className="text-xs text-gray-500 mt-1">Obtén una copia de tu información</p>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-red-600 mb-4">Zona de peligro</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <span className="text-sm font-medium text-red-700">Eliminar cuenta</span>
                      <p className="text-xs text-red-600 mt-1">Esta acción no se puede deshacer</p>
                    </button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesion</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;