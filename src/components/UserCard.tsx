'use client';

import { User } from '@/types';
import Image from 'next/image';
import { MapPin, MessageCircle, Ban, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addToFavorites, removeFromFavorites, blockUser, isUserFavorite } from '@/utils/userActions';

interface UserCardProps {
  user: User;
  distance?: number;
  onFavorite: (userId: string) => void;
  onBlock: (userId: string) => void;
  onChat: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserCard = ({ user, distance, onFavorite, onBlock, onChat, onViewProfile }: UserCardProps) => {
  const { user: currentUser, firebaseUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar si el usuario es favorito al cargar el componente
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (firebaseUser) {
        try {
          const favoriteStatus = await isUserFavorite(firebaseUser, user.uid);
          setIsFavorite(favoriteStatus);
        } catch (error) {
          console.error('Error verificando estado de favorito:', error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [firebaseUser, user.uid]);

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action();
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!firebaseUser || isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(firebaseUser, user.uid);
        setIsFavorite(false);
      } else {
        await addToFavorites(firebaseUser, user.uid);
        setIsFavorite(true);
      }
      onFavorite(user.uid); // Llamar callback para actualizar UI padre
    } catch (error) {
      console.error('Error al manejar favorito:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar favorito');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!firebaseUser || isProcessing) return;
    
    const confirmBlock = window.confirm(`¿Estás seguro de que quieres bloquear a ${user.nombre}?`);
    if (!confirmBlock) return;
    
    setIsProcessing(true);
    try {
      await blockUser(firebaseUser, user.uid);
      onBlock(user.uid); // Llamar callback para actualizar UI padre
    } catch (error) {
      console.error('Error al bloquear usuario:', error);
      alert(error instanceof Error ? error.message : 'Error al bloquear usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-105"
      onClick={() => onViewProfile(user.uid)}
      onKeyPress={(e) => handleKeyPress(e, () => onViewProfile(user.uid))}
      tabIndex={0}
      role="button"
    >
      <div className="relative w-full h-48">
        <Image
          src={user.fotoPerfil}
          alt={`Foto de perfil de ${user.nombre}`}
          layout="fill"
          objectFit="cover"
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;base64,${btoa(
              `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#a855f7"/>
                <text x="100" y="120" text-anchor="middle" fill="white" font-size="40" font-weight="bold">
                  ${user.nombre.charAt(0).toUpperCase()}
                </text>
              </svg>`
            )}`;
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{user.nombre}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleFavoriteClick}
              disabled={isProcessing}
              className={`p-1 transition-colors ${
                isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isFavorite ? "Remover de favoritos" : "Agregar a favoritos"}
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, () => handleFavoriteClick(e as any))}
            >
              <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleBlockClick}
              disabled={isProcessing}
              className={`p-1 text-gray-400 hover:text-red-500 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Bloquear usuario"
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, () => handleBlockClick(e as any))}
            >
              <Ban className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          <p>{distance ? `${Math.round(distance)} km` : 'Distancia no disponible'}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat(user.uid);
          }}
          className="mt-4 w-full py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          aria-label="Iniciar chat"
          tabIndex={0}
          onKeyPress={(e) => {
            e.stopPropagation();
            handleKeyPress(e, () => onChat(user.uid));
          }}
        >
          <MessageCircle className="inline-block mr-2" />
          Chatear
        </button>
      </div>
    </div>
  );
};

export default UserCard;