'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { User, Chat } from '@/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { User as FirebaseUser } from 'firebase/auth';

const ChatListPage = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<{ [key: string]: User }>({});

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

  // Load real chat data from Firebase
  useEffect(() => {
    if (user) {
      // TODO: Implement real chat data loading from Firestore
      // Load user's chats and associated user profiles
      // For now, initialize empty arrays
      setUsers({});
      setChats([]);
    }
  }, [user]);

  const getOtherUserId = (chat: Chat) => {
    return chat.participants.find(id => id !== user?.uid) || '';
  };

  const getOtherUser = (chat: Chat) => {
    const otherUserId = getOtherUserId(chat);
    return users[otherUserId];
  };

  const isUserOnline = (lastOnline: Date) => {
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastOnline.getTime()) / (1000 * 60);
    return diffInMinutes < 5; // Online if active in last 5 minutes
  };

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'hace un momento';
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    return otherUser?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                aria-label="Volver al inicio"
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Mensajes</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                {chats.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="buscar-conversaciones"
              name="q"
              type="text"
              placeholder="Buscar conversaciones..."
              aria-label="Buscar conversaciones"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Lista de chats */}
        <div className="space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones aun'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otro termino de busqueda' 
                  : 'Comienza a hacer match con personas para iniciar conversaciones'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                  Explorar personas
                </button>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat);
              if (!otherUser) return null;

              return (
                <div
                  key={chat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/chat/${chat.id}`);
                    }
                  }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-primary-200"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        <Image
                          src={otherUser.fotoPerfil}
                          alt={otherUser.nombre}
                          width={56}
                          height={56}
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml;base64,${btoa(
                              `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
                                <rect width="56" height="56" fill="#a855f7"/>
                                <text x="28" y="35" text-anchor="middle" fill="white" font-size="20" font-weight="bold">
                                  ${otherUser.nombre.charAt(0).toUpperCase()}
                                </text>
                              </svg>`
                            )}`;
                          }}
                        />
                      </div>
                      {/* Indicador de estado */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                          isUserOnline(otherUser.lastOnline) ? 'bg-green-400' : 'bg-gray-400'
                        }`}
                      />
                    </div>

                    {/* Información del chat */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherUser.nombre}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(chat.lastTimestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {chat.lastMessage}
                        </p>
                        
                        {/* TODO: Implement real unread message count from Firestore */}
                      </div>
                      
                      {/* Rol sexual badge */}
                      {otherUser.rolSexual && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${otherUser.rolSexual === 'activo' ? 'bg-blue-100 text-blue-800' : otherUser.rolSexual === 'pasivo' ? 'bg-pink-100 text-pink-800' : 'bg-purple-100 text-purple-800'}`}>
                            {otherUser.rolSexual}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;