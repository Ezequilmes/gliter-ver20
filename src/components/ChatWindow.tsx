'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react';
import { User, Message } from '@/types';
import MessageBubble from './MessageBubble';
import Image from 'next/image';

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
  onSendMessage: (message: string, type: 'texto' | 'foto', file?: File) => void;
  onClose: () => void;
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  otherUser,
  onSendMessage,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock de mensajes
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: otherUser.uid,
        message: `¡Hola! Me gusta tu perfil 😊`,
        tipo: 'texto',
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: '2',
        senderId: currentUser.uid,
        message: '¡Hola! Gracias, el tuyo también está genial',
        tipo: 'texto',
        timestamp: new Date(Date.now() - 3500000)
      },
      {
        id: '3',
        senderId: otherUser.uid,
        message: '¿Te gustaría conocernos mejor?',
        tipo: 'texto',
        timestamp: new Date(Date.now() - 3400000)
      }
    ];
    setMessages(mockMessages);
  }, [currentUser.uid, otherUser.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.uid,
        message: newMessage,
        tipo: 'texto',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      onSendMessage(newMessage, 'texto');
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.uid,
        message: 'Foto enviada',
        tipo: 'foto',
        urlFoto: URL.createObjectURL(file),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      onSendMessage('Foto enviada', 'foto', file);
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
            <p className="text-sm text-green-500">En línea</p>
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
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUser.uid}
            senderName={message.senderId === currentUser.uid ? currentUser.nombre : otherUser.nombre}
          />
        ))}
        
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
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Enviar mensaje"
            >
              <Send className="w-5 h-5" />
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