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

  // Load real user data from Firebase
  useEffect(() => {
    if (user && chatId) {
      // TODO: Implement real user data loading from Firestore
      // For now, set basic user info from Firebase Auth
      const currentUserData: User = {
        uid: user.uid,
        nombre: user.displayName || 'Usuario',
        edad: 25, // This should come from Firestore user profile
        genero: 'No especificado', // This should come from Firestore user profile
        ubicacion: { lat: 0, lng: 0 }, // This should come from Firestore user profile
        rolSexual: null, // This should come from Firestore user profile
        fotoPerfil: user.photoURL || '',
        fotosAdicionales: [],
        favoritos: [],
        bloqueados: [],
        lastOnline: new Date(),
        email: user.email || ''
      };

      setCurrentUser(currentUserData);
      
      // TODO: Load other user data from Firestore based on chatId
      // For now, create a temporary other user to prevent chat loading errors
      const tempOtherUser: User = {
        uid: 'temp-user-' + chatId,
        nombre: 'Usuario Chat',
        edad: 25,
        genero: 'No especificado',
        ubicacion: { lat: 0, lng: 0 },
        rolSexual: null,
        fotoPerfil: '',
        fotosAdicionales: [],
        favoritos: [],
        bloqueados: [],
        lastOnline: new Date(),
        email: 'temp@example.com'
      };
      setOtherUser(tempOtherUser);
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
            
            {/* TODO: Implement real chat list from Firestore */}
            <div className="space-y-2">
              <p className="text-gray-500 text-center py-4">
                No hay chats disponibles
              </p>
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