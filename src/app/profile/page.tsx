'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProfilePhotoUploader } from '@/components/PhotoUploader';
import { refreshUserData } from '@/utils/refreshUserData';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, MapPin, Calendar, User as UserIcon, Save } from 'lucide-react';

// Importar funciones de prueba para debugging
if (typeof window !== 'undefined') {
  import('@/utils/testPhotoUpload').then(module => {
    console.log('🔧 Funciones de prueba de fotos cargadas. Usa window.testPhotoUpload en la consola.');
  });
}


interface ProfileFormData {
  displayName: string;
  bio: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  location: {
    latitude: number;
    longitude: number;
    city?: string;
  } | null;
}

export default function ProfilePage() {
  const { user, firebaseUser, refreshUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: '',
    age: 18,
    gender: 'other',
    interests: [],
    location: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.nombre || '',
        bio: '',
        age: user.edad || 18,
        gender: (user.genero === 'male' || user.genero === 'female') ? user.genero : 'other',
        interests: [],
        location: user.ubicacion ? {
          latitude: user.ubicacion.lat,
          longitude: user.ubicacion.lng
        } : null
      });
    }
  }, [user]);

  const handlePhotoUploadSuccess = async (url: string) => {
    // Refrescar datos del usuario sin recargar la página
    try {
      await refreshUser();
      console.log('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error al refrescar datos después de subir foto:', error);
    }
  };

  const handlePhotoUploadError = (error: string) => {
    console.error('Error uploading photo:', error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      alert('Error: Usuario no autenticado');
      return;
    }

    setLoading(true);
    
    // Datos actualizados del usuario
    const updatedUserData: any = {
      nombre: formData.displayName,
      displayName: formData.displayName,
      bio: formData.bio,
      edad: formData.age,
      genero: formData.gender,
      updatedAt: new Date()
    };
    
    // Solo agregar ubicación si existe y tiene datos válidos
    if (formData.location) {
      updatedUserData.ubicacion = {
        lat: formData.location.latitude,
        lng: formData.location.longitude
      };
      
      // Solo agregar city si no es undefined
      if (formData.location.city !== undefined && formData.location.city !== null) {
        updatedUserData.ubicacion.city = formData.location.city;
      }
    }
    
    // Para publicProfiles
    const publicProfileData = {
      displayName: formData.displayName,
      photoURL: user?.fotoPerfil || '',
      age: formData.age,
      gender: formData.gender,
      location: formData.location,
      updatedAt: new Date(),
      uid: firebaseUser.uid
    };
    
    try {
      // Actualizar documento de usuario con los campos correctos
      await updateDoc(doc(db, 'users', firebaseUser.uid), updatedUserData);
      
      // Actualizar perfil público
      await setDoc(doc(db, 'publicProfiles', firebaseUser.uid), publicProfileData, { merge: true });
      
      // Refrescar datos del usuario sin recargar la página
      await refreshUser();
      alert('Perfil actualizado correctamente');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      const firestoreError = error as any;
      if (firestoreError.code === 'not-found') {
        console.log('Documento no encontrado, creando nuevo...');
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), updatedUserData, { merge: true });
          await setDoc(doc(db, 'publicProfiles', firebaseUser.uid), publicProfileData, { merge: true });
          
          // Refrescar datos del usuario
          await refreshUser();
          alert('Perfil creado correctamente');
        } catch (createError) {
          console.error('Error creating profile:', createError);
          alert('Error al crear el perfil');
        }
      } else if (firestoreError.code === 'permission-denied') {
        alert('Error: No tienes permisos para actualizar el perfil');
      } else {
        alert(`Error al actualizar el perfil: ${firestoreError.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error al obtener la ubicación');
        }
      );
    } else {
      alert('Geolocalización no soportada por este navegador');
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
            
            {/* Foto de perfil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Image
                  src={user?.fotoPerfil || '/default-avatar.png'}
                  alt="Foto de perfil"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-gray-200"
                />
                <div className="absolute bottom-0 right-0">
                   <ProfilePhotoUploader
                     onUploadSuccess={handlePhotoUploadSuccess}
                     onUploadError={handlePhotoUploadError}
                     className="bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
                   />
                 </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="inline w-4 h-4 mr-1" />
                  Nombre
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Biografía */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cuéntanos algo sobre ti..."
                />
              </div>

              {/* Edad y Género */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Edad
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Ubicación
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Obtener ubicación actual
                  </button>
                  {formData.location && (
                    <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                      Ubicación guardada
                    </span>
                  )}
                </div>
              </div>

              {/* Intereses */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Intereses
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                      onClick={() => removeInterest(interest)}
                      onKeyDown={(e) => e.key === 'Enter' && removeInterest(interest)}
                      role="button"
                      tabIndex={0}
                    >
                      {interest} ×
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Agregar interés (presiona Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botón de guardar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}