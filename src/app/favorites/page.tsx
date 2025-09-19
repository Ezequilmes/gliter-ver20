'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Search, Filter } from 'lucide-react';
import { User } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import UserCard from '@/components/UserCard';
import ProfileModal from '@/components/ProfileModal';

const FavoritesPage = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [favorites, setFavorites] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'online' | 'recent'>('all');

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
      const mockFavorites: User[] = [
        {
          uid: 'fav1',
          nombre: 'Isabella Martinez',
          edad: 24,
          genero: 'Mujer',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'versatil',
          fotoPerfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
          fotosAdicionales: [
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop'
          ],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(),
          email: 'isabella@example.com'
        },
        {
          uid: 'fav2',
          nombre: 'Diego Fernandez',
          edad: 27,
          genero: 'Hombre',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'activo',
          fotoPerfil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
          fotosAdicionales: [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop'
          ],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(Date.now() - 600000), // 10 min ago
          email: 'diego@example.com'
        },
        {
          uid: 'fav3',
          nombre: 'Valentina Lopez',
          edad: 22,
          genero: 'Mujer',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'pasivo',
          fotoPerfil: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
          fotosAdicionales: [
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop'
          ],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(Date.now() - 3600000), // 1 hour ago
          email: 'valentina@example.com'
        },
        {
          uid: 'fav4',
          nombre: 'Mateo Silva',
          edad: 26,
          genero: 'Hombre',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'versatil',
          fotoPerfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(Date.now() - 7200000), // 2 hours ago
          email: 'mateo@example.com'
        }
      ];
      
      setFavorites(mockFavorites);
    }
  }, [user]);

  const isUserOnline = (lastOnline: Date) => {
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastOnline.getTime()) / (1000 * 60);
    return diffInMinutes < 5;
  };

  const isUserRecent = (lastOnline: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - lastOnline.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case 'online':
        return isUserOnline(favorite.lastOnline);
      case 'recent':
        return isUserRecent(favorite.lastOnline);
      default:
        return true;
    }
  });

  const handleRemoveFavorite = (userId: string) => {
    setFavorites(prev => prev.filter(fav => fav.uid !== userId));
  };

  const handleBlock = (userId: string) => {
    setFavorites(prev => prev.filter(fav => fav.uid !== userId));
  };

  const handleChat = (userId: string) => {
    router.push(`/chat/chat_${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    const user = favorites.find(u => u.uid === userId);
    if (user) {
      setSelectedUser(user);
      setShowProfileModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-500" />
      </div>
    );
  }

  if (!user) {
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
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-accent-500" />
                <h1 className="text-xl font-bold text-gray-900">Favoritos</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                {favorites.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controles de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <label htmlFor="buscar-favoritos" className="sr-only">Buscar en favoritos</label>
            <input
              id="buscar-favoritos"
              type="text"
              placeholder="Buscar en favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'online', label: 'En línea' },
                { key: 'recent', label: 'Activos hoy' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterBy(filter.key as 'all' | 'online' | 'recent')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterBy === filter.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de favoritos */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' 
                ? 'No se encontraron favoritos' 
                : 'No tienes favoritos aún'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterBy !== 'all'
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Marca como favoritos a las personas que te interesen para encontrarlas fácilmente'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Explorar personas
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-primary-600">
                  {filteredFavorites.length}
                </div>
                <div className="text-sm text-gray-600">
                  {filterBy === 'all' ? 'Total favoritos' : 
                   filterBy === 'online' ? 'En línea ahora' : 'Activos hoy'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">
                  {filteredFavorites.filter(f => isUserOnline(f.lastOnline)).length}
                </div>
                <div className="text-sm text-gray-600">En línea</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredFavorites.filter(f => isUserRecent(f.lastOnline)).length}
                </div>
                <div className="text-sm text-gray-600">Activos hoy</div>
              </div>
            </div>

            {/* Grid de favoritos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((favorite) => (
                <UserCard
                  key={favorite.uid}
                  user={favorite}
                  onFavorite={() => handleRemoveFavorite(favorite.uid)}
                  onBlock={() => handleBlock(favorite.uid)}
                  onChat={() => handleChat(favorite.uid)}
                  onViewProfile={() => handleViewProfile(favorite.uid)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de perfil */}
      {showProfileModal && selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setShowProfileModal(false)}
          onChat={() => handleChat(selectedUser.uid)}
          onFavorite={() => handleRemoveFavorite(selectedUser.uid)}
          onBlock={() => handleBlock(selectedUser.uid)}
        />
      )}
    </div>
  );
};

export default FavoritesPage;