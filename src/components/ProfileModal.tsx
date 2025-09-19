'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Ban } from 'lucide-react';
import { User } from '@/types';
import Image from 'next/image';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onChat: () => void;
  onFavorite: () => void;
  onBlock: () => void;
}

const ProfileModal = ({ user, onClose, onChat, onFavorite, onBlock }: ProfileModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  const allImages = [user.fotoPerfil, ...user.fotosAdicionales].filter(Boolean);

  const nextImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'activo':
        return 'bg-blue-100 text-blue-800';
      case 'pasivo':
        return 'bg-pink-100 text-pink-800';
      case 'versatil':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {user.nombre}, {user.edad}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrusel de imágenes */}
        <div className="relative">
          <div className="aspect-square relative overflow-hidden">
            {allImages.length > 0 && allImages[currentImageIndex] && !imageError[currentImageIndex] ? (
              <Image
                src={allImages[currentImageIndex]}
                alt={`Foto ${currentImageIndex + 1} de ${user.nombre}`}
                fill
                className="object-cover"
                onError={() => handleImageError(currentImageIndex)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                <span className="text-primary-600 text-6xl font-bold">
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Controles del carrusel */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Información del perfil */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {user.nombre}
              </h3>
              <p className="text-gray-600">
                {user.edad} años • {user.genero}
              </p>
            </div>
            
            {user.rolSexual && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.rolSexual)}`}>
                {user.rolSexual}
              </span>
            )}
          </div>

          {/* Bio mínima */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              Hola! Soy {user.nombre} y tengo {user.edad} años. 
              {user.rolSexual && ` Soy ${user.rolSexual}.`}
              {' '}Me encanta conocer gente nueva y hacer conexiones auténticas.
            </p>
          </div>

          {/* Última conexión */}
          <div className="mb-6 text-sm text-gray-500">
            Última vez activo: {user.lastOnline.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onChat();
                onClose();
              }}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chatear</span>
            </button>
            
            <button
              onClick={() => {
                onFavorite();
                onClose();
              }}
              className="btn-secondary flex items-center justify-center px-4"
              title="Agregar a favoritos"
            >
              <Heart className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                onBlock();
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              title="Bloquear usuario"
            >
              <Ban className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;