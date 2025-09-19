'use client';

import React from 'react';
import { Message } from '@/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  senderPhoto: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, senderName, senderPhoto }) => {
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

// Remove bubbleClass and time

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Avatar del usuario (solo para mensajes de otros) */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={senderPhoto}
              alt={senderName}
              width={32}
              height={32}
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml;base64,${btoa(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <rect width="32" height="32" fill="#a855f7"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                      ${senderName.charAt(0).toUpperCase()}
                    </text>
                  </svg>`
                )}`;
              }}
            />
          </div>
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Nombre del remitente (solo para mensajes de otros) */}
        {!isOwn && (
          <p className="text-xs text-gray-500 mb-1 px-3">
            {senderName}
          </p>
        )}

        {/* Burbuja del mensaje */}
        <div
          className={`relative px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}
        >
          {/* Contenido del mensaje */}
          {message.tipo === 'texto' ? (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          ) : (
            <div className="space-y-2">
              {message.urlFoto && (
                <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={message.urlFoto}
                    alt="Imagen enviada"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="128" viewBox="0 0 192 128">
                          <rect width="192" height="128" fill="#f3f4f6"/>
                          <text x="96" y="70" text-anchor="middle" fill="#6b7280" font-size="14">
                            Imagen no disponible
                          </text>
                        </svg>`
                      )}`;
                    }}
                  />
                </div>
              )}
              {message.message && message.message !== 'Foto enviada' && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message}
                </p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </p>

          {/* Indicador de mensaje propio */}
          {isOwn && (
            <div className="flex items-center justify-end mt-1 space-x-1">
              {/* Doble check para "entregado" */}
              <div className="flex">
                <svg
                  className="w-3 h-3 text-primary-100"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  className="w-3 h-3 text-primary-100 -ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Remove PropTypes import and definition
export default MessageBubble;