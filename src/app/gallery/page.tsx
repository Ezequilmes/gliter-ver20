'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { GalleryPhotoUploader } from '@/components/PhotoUploader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Download, Eye } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';

interface UserData {
  photos?: string[];
  displayName?: string;
  email?: string;
}

export default function GalleryPage() {
  const { user, firebaseUser } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [firebaseUser]);

  const handlePhotoUploadSuccess = (url: string) => {
    // Actualizar la lista local de fotos
    setUserData(prev => ({
      ...prev,
      photos: [...(prev?.photos || []), url]
    }));
  };

  const handlePhotoUploadError = (error: string) => {
    console.error('Error uploading photo:', error);
  };

  const handleDownloadPhoto = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `photo_${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPhoto = (url: string) => {
    setSelectedPhoto(url);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando galería...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Galería</h1>
            <p className="text-gray-600">
              Sube y gestiona tus fotos. Formatos soportados: JPG, PNG, WebP (máximo 10MB por foto).
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Fotos</h2>
            <GalleryPhotoUploader
              onUploadSuccess={handlePhotoUploadSuccess}
              onUploadError={handlePhotoUploadError}
              className="w-full"
              multiple={true}
            />
          </div>

          {/* Gallery Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mis Fotos</h2>
              <span className="text-sm text-gray-500">
                {userData?.photos?.length || 0} foto(s)
              </span>
            </div>

            {userData?.photos && userData.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userData.photos.map((photoUrl, index) => (
                  <div key={index} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={photoUrl}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button
                          onClick={() => handleViewPhoto(photoUrl)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Ver foto"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPhoto(photoUrl)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Descargar foto"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fotos aún</h3>
                <p className="text-gray-500 mb-4">Sube tus primeras fotos para comenzar tu galería</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal para ver foto completa */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedPhoto}
                alt="Foto ampliada"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}