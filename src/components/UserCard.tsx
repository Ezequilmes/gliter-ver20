'use client';

import { User } from '@/types';
import Image from 'next/image';
import { MapPin, MessageCircle, Ban, Star } from 'lucide-react';

interface UserCardProps {
  user: User;
  distance?: number;
  onFavorite: (userId: string) => void;
  onBlock: (userId: string) => void;
  onChat: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserCard = ({ user, distance, onFavorite, onBlock, onChat, onViewProfile }: UserCardProps) => {
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action();
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
              onClick={() => onFavorite(user.uid)}
              className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
              aria-label="Agregar a favoritos"
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, () => onFavorite(user.uid))}
            >
              <Star className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              onClick={() => onBlock(user.uid)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Bloquear usuario"
              tabIndex={0}
              onKeyPress={(e) => handleKeyPress(e, () => onBlock(user.uid))}
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
          onClick={() => onChat(user.uid)}
          className="mt-4 w-full py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          aria-label="Iniciar chat"
          tabIndex={0}
          onKeyPress={(e) => handleKeyPress(e, () => onChat(user.uid))}
        >
          <MessageCircle className="inline-block mr-2" />
          Chatear
        </button>
      </div>
    </div>
  );
};

export default UserCard;