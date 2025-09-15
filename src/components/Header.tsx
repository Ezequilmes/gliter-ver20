'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Search, Settings, User, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Logo from '@/components/Logo';

const Header = () => {
  const router = useRouter();
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 shadow-sm border-b border-white/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-90 transition-opacity" title="Inicio">
            <Logo size="md" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="search"
                name="q"
                aria-label="Buscar personas"
                autoComplete="off"
                type="text"
                placeholder="Buscar personas..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-white/50 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {!loadingAuth && firebaseUser ? (
              // Usuario autenticado - mostrar navegación completa
              <>
                <button
                  onClick={() => router.push('/favorites')}
                  className="p-2 text-gray-700 hover:text-accent-600 hover:bg-accent-50 rounded-full transition-colors"
                  title="Favoritos"
                >
                  <Heart className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => router.push('/chat')}
                  className="p-2 text-gray-700 hover:text-accent-600 hover:bg-accent-50 rounded-full transition-colors relative"
                  title="Mensajes"
                >
                  <MessageCircle className="w-5 h-5" />
                  {/* Badge de notificación */}
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-gray-700 hover:text-accent-600 hover:bg-accent-50 rounded-full transition-colors"
                    title="Perfil"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 rounded-lg shadow-xl border border-gray-100 py-1 z-50 backdrop-blur">
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configuración
                      </button>
                      <button
                        onClick={() => {
                          router.push('/profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !loadingAuth ? (
              // Usuario no autenticado - mostrar botones de login/registro
              <>
                <button
                  onClick={() => router.push('/auth')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                  title="Iniciar Sesión"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/auth');
                    // Podrías agregar un parámetro para indicar que es registro
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 rounded-lg transition-colors shadow-sm"
                  title="Registrarse"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Registrarse</span>
                </button>
              </>
            ) : (
              // Cargando autenticación
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;