'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { User } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import ChatWindow from '@/components/ChatWindow';

const ChatPageClient = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
    if (user && chatId) {
      // Mock current user
      const mockCurrentUser: User = {
        uid: user.uid,
        nombre: 'Tu Usuario',
        edad: 25,
        genero: 'Hombre',
        ubicacion: { lat: -34.6037, lng: -58.3816 },
        rolSexual: 'versatil',
        fotoPerfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        fotosAdicionales: [],
        favoritos: [],
        bloqueados: [],
        lastOnline: new Date(),
        email: user.email || 'tu@example.com'
      };

      // Mock other users based on chatId
      const mockUsers: { [key: string]: User } = {
        'chat1': {
          uid: 'user1',
          nombre: 'Ana García',
          edad: 25,
          genero: 'Mujer',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'versatil',
          fotoPerfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(),
          email: 'ana@example.com'
        },
        'chat2': {
          uid: 'user2',
          nombre: 'Carlos Mendez',
          edad: 28,
          genero: 'Hombre',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'activo',
          fotoPerfil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(Date.now() - 300000),
          email: 'carlos@example.com'
        },
        'chat3': {
          uid: 'user3',
          nombre: 'Sofia Rodriguez',
          edad: 23,
          genero: 'Mujer',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: 'pasivo',
          fotoPerfil: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(Date.now() - 3600000),
          email: 'sofia@example.com'
        },
        'default': {
          uid: 'unknown-user',
          nombre: 'Usuario Desconocido',
          edad: 25,
          genero: 'No especificado',
          ubicacion: { lat: -34.6037, lng: -58.3816 },
          rolSexual: null,
          fotoPerfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          fotosAdicionales: [],
          favoritos: [],
          bloqueados: [],
          lastOnline: new Date(),
          email: 'unknown@example.com'
        }
      };

      setCurrentUser(mockCurrentUser);
      setOtherUser(mockUsers[chatId] || mockUsers['default']);
    }
  }, [user, chatId]);

  const handleSendMessage = (message: string, type: 'texto' | 'foto', file?: File) => {
    console.log('Mensaje enviado:', { message, type, file });
    // La implementación real está en ChatWindow
  };

  const handleBackToChats = () => {
    router.push('/chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-500" />
      </div>
    );
  }

  if (!user || !currentUser || !otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chat no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la conversacion
          </p>
          <button
            onClick={() => router.push('/chat')}
            className="btn-primary"
          >
            Volver a mensajes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header móvil */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center p-4">
          <button
            onClick={handleBackToChats}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {otherUser.nombre}
          </h1>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 flex">
        {/* Sidebar de chats (solo desktop) */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </button>
          </div>
          
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mensajes
            </h2>
            
            {/* Lista simplificada de chats */}
            <div className="space-y-2">
              {['chat1', 'chat2', 'chat3'].map((id) => {
                const isActive = id === chatId;
                const names = {
                  'chat1': 'Ana García',
                  'chat2': 'Carlos Mendez',
                  'chat3': 'Sofia Rodriguez'
                } as const;
                
                return (
                  <button
                    key={id}
                    onClick={() => router.push(`/chat/${id}`)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-50 border border-primary-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {names[id as keyof typeof names]}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      Ultimo mensaje...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            currentUser={currentUser}
            otherUser={otherUser}
            chatId={chatId}
            onSendMessage={handleSendMessage}
            onClose={handleBackToChats}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPageClient;