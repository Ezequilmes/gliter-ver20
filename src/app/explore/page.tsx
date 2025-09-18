'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, GeoPoint } from 'firebase/firestore';
import { MapPin, Heart, X, Filter, Users } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';
import useGeolocation, { calculateDistance, formatDistance } from '@/hooks/useGeolocation';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoURL: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  interests: string[];
  gender: string;
  lookingFor: string;
  isOnline: boolean;
  lastSeen: Date;
}



const ExplorePage: React.FC = () => {
  const { user } = useAuthContext();
  const [nearbyUsers, setNearbyUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { location: userLocation, error: locationError, loading: locationLoading, getCurrentLocation } = useGeolocation();
  const [filters, setFilters] = useState({
    maxDistance: 10, // km
    minAge: 18,
    maxAge: 50,
    gender: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);





  // Actualizar ubicación del usuario en Firestore
  const updateUserLocation = useCallback(async () => {
     if (!user || !userLocation) return;
     
     try {
       const userRef = doc(db, 'users', user.uid);
       await updateDoc(userRef, {
         location: new GeoPoint(userLocation.latitude, userLocation.longitude),
         lastLocationUpdate: new Date()
       });
     } catch (error) {
       console.error('Error actualizando ubicación:', error);
     }
  }, [user, userLocation]);

  // Cargar usuarios cercanos
  const loadNearbyUsers = useCallback(async () => {
     if (!user || !userLocation) return;

     try {
       setLoading(true);
       const publicProfilesRef = collection(db, 'publicProfiles');
       
       // Query básico excluyendo al usuario actual
       const q = query(
         publicProfilesRef,
         where('__name__', '!=', user.uid)
       );
       
       const querySnapshot = await getDocs(q);
       const users: UserProfile[] = [];
       
       querySnapshot.forEach((doc) => {
         const userData = doc.data();
         if (userData.location && userData.location.latitude && userData.location.longitude) {
           const distance = calculateDistance(
             userLocation.latitude,
             userLocation.longitude,
             userData.location.latitude,
             userData.location.longitude
           );
           
           // Aplicar filtros
           if (distance <= filters.maxDistance &&
               userData.age >= filters.minAge &&
               userData.age <= filters.maxAge &&
               (filters.gender === 'all' || userData.gender === filters.gender)) {
             
             users.push({
               id: doc.id,
               name: userData.name || 'Usuario',
               age: userData.age || 25,
               bio: userData.bio || '',
               photoURL: userData.photoURL || '/default-avatar.png',
               location: {
                 latitude: userData.location.latitude,
                 longitude: userData.location.longitude
               },
               distance: parseFloat(distance.toFixed(1)),
               interests: userData.interests || [],
               gender: userData.gender || 'no-especificado',
               lookingFor: userData.lookingFor || 'amistad',
               isOnline: userData.isOnline || false,
               lastSeen: userData.lastSeen?.toDate() || new Date()
             });
           }
         }
       });
       
       // Ordenar por distancia
       users.sort((a, b) => (a.distance || 0) - (b.distance || 0));
       setNearbyUsers(users);
     } catch (error) {
       console.error('Error cargando usuarios cercanos:', error);
     } finally {
       setLoading(false);
     }
  }, [user, userLocation, filters.maxDistance, filters.minAge, filters.maxAge, filters.gender]);

  // Removed automatic location request on page load
  // Location will be requested only when user explicitly allows it

  // Recargar cuando cambien los filtros
  useEffect(() => {
     if (userLocation) {
       loadNearbyUsers();
     }
  }, [filters, userLocation, loadNearbyUsers]);

  const handleLike = async (targetUserId: string) => {
    // TODO: Implementar sistema de likes
    console.log('Like enviado a:', targetUserId);
  };

  const handlePass = (targetUserId: string) => {
    setNearbyUsers(prev => prev.filter(u => u.id !== targetUserId));
  };

  if (locationLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Obteniendo tu ubicación...</h2>
            <p className="text-gray-600">Esto nos ayuda a encontrar personas cerca de ti</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (locationError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de ubicación</h2>
            <p className="text-gray-600 mb-4">{locationError?.message}</p>
            <button
              onClick={getCurrentLocation}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userLocation) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <MapPin className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Permitir ubicación</h2>
            <p className="text-gray-600 mb-4">Para encontrar personas cerca de ti, necesitamos acceso a tu ubicación</p>
            <button
              onClick={async () => {
                const location = await getCurrentLocation();
                if (location) {
                  await updateUserLocation();
                  await loadNearbyUsers();
                }
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Permitir ubicación
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-pink-500" />
                <h1 className="text-2xl font-bold text-gray-800">Explorar</h1>
                {userLocation && (
                  <span className="text-sm text-gray-500">
                    {nearbyUsers.length} personas cerca
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white border-b shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia máxima: {filters.maxDistance}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">
                    Edad mínima
                  </label>
                  <input
                    id="minAge"
                    type="number"
                    min="18"
                    max="80"
                    value={filters.minAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">
                    Edad máxima
                  </label>
                  <input
                    id="maxAge"
                    type="number"
                    min="18"
                    max="80"
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <select
                    id="gender"
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="no-binario">No binario</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
              <p className="text-gray-600">Buscando personas cerca de ti...</p>
            </div>
          ) : nearbyUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay personas cerca</h3>
              <p className="text-gray-600 mb-4">Intenta ampliar tu rango de búsqueda o vuelve más tarde</p>
              <button
                onClick={() => setFilters(prev => ({ ...prev, maxDistance: prev.maxDistance + 10 }))}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Ampliar búsqueda a {filters.maxDistance + 10}km
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyUsers.map((profile) => (
                <div key={profile.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Image
                      src={profile.photoURL}
                      alt={profile.name}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {formatDistance(profile.distance || 0)}
                    </div>
                    {profile.isOnline && (
                      <div className="absolute top-4 left-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {profile.name}, {profile.age}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize">
                        {profile.gender}
                      </span>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                    
                    {profile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {profile.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {profile.interests.length > 3 && (
                          <span className="text-xs text-gray-500">+{profile.interests.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePass(profile.id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Pasar</span>
                      </button>
                      <button
                        onClick={() => handleLike(profile.id)}
                        className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Me gusta</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ExplorePage;