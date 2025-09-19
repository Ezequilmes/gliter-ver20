'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react';
import { User, Message } from '@/types';
import MessageBubble from './MessageBubble';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  where,
  limit,
  writeBatch,
  getDocs
} from 'firebase/firestore';

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
  onSendMessage: (message: string, type: 'texto' | 'foto', file?: File) => void;
  onClose: () => void;
  chatId: string;
}

interface FirebaseMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: import('firebase/firestore').Timestamp | null | undefined;
  read: boolean;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  otherUser,
  onSendMessage,
  onClose,
  chatId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const userId = currentUser?.uid;

  // Marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async () => {
    if (!userId || !chatId) return;

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }, [userId, chatId]);

  // Cargar mensajes en tiempo real desde Firebase
  useEffect(() => {
    if (!chatId || !currentUser || !otherUser) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebaseMessages: FirebaseMessage[] = [];
      snapshot.forEach((doc) => {
        firebaseMessages.push({
          id: doc.id,
          ...doc.data()
        } as FirebaseMessage);
      });
      
      // Convertir mensajes de Firebase al formato de la app
      const convertedMessages: Message[] = firebaseMessages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        message: msg.text,
        tipo: msg.type === 'image' ? 'foto' : 'texto',
        timestamp: msg.timestamp?.toDate() || new Date(),
        urlFoto: msg.imageUrl
      }));
      
      setMessages(convertedMessages);
      setLoading(false);
      
      // Marcar mensajes como leídos
      markMessagesAsRead();
      
      // Scroll al final
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [chatId, currentUser, otherUser, markMessagesAsRead, scrollToBottom]);

  // Hacer scroll al final cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUser || !otherUser) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text'
      });

      // Actualizar información del chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        participants: [currentUser.uid, otherUser.uid]
      });

      onSendMessage(newMessage, 'texto');
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || sending) return;

    setSending(true);
    try {
      // TODO: Implementar subida de imagen a Firebase Storage
      // Por ahora, solo enviamos un mensaje de texto indicando que se envió una foto
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: 'Foto enviada',
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        timestamp: serverTimestamp(),
        read: false,
        type: 'image',
        imageUrl: URL.createObjectURL(file) // Temporal, debería ser la URL de Storage
      });

      // Actualizar información del chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: 'Foto enviada',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        participants: [currentUser.uid, otherUser.uid]
      });

      onSendMessage('Foto enviada', 'foto', file);
    } catch (error) {
      console.error('Error enviando imagen:', error);
    } finally {
      setSending(false);
    }
  };

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '😍', '🥰', '😘'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={otherUser.fotoPerfil}
                alt={otherUser.nombre}
                width={40}
                height={40}
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                      <rect width="40" height="40" fill="#a855f7"/>
                      <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
                        ${otherUser.nombre.charAt(0).toUpperCase()}
                      </text>
                    </svg>`
                  )}`;
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.nombre}</h3>
            <p className="text-sm text-green-500">En linea</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Inicia la conversación!</h3>
            <p className="text-gray-600">Envía tu primer mensaje para comenzar a chatear</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.uid}
              senderName={message.senderId === currentUser.uid ? currentUser.nombre : otherUser.nombre}
              senderPhoto={message.senderId === currentUser.uid ? currentUser.fotoPerfil : otherUser.fotoPerfil}
            />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Selector de emojis */}
      {showEmojiPicker && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setNewMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input de mensaje */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Escribe un mensaje a ${otherUser.nombre}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
              rows={1}
              style={{
                minHeight: '40px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              title="Enviar foto"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Enviar mensaje"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        <input
          id="chat-file-upload"
          name="file"
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Subir archivo"
        />
      </div>
    </div>
  );
};

export default ChatWindow;