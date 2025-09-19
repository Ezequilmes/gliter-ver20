'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { uploadUserPhoto, validateImageFile } from '@/utils/uploadUserPhoto';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploaderProps {
  photoType: 'profile' | 'gallery';
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
}

export default function PhotoUploader({
  photoType,
  onUploadSuccess,
  onUploadError,
  className = '',
  multiple = false
}: PhotoUploaderProps) {
  const { firebaseUser } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (!firebaseUser) {
      const error = 'Usuario no autenticado. Por favor, inicia sesión nuevamente.';
      onUploadError?.(error);
      console.error('PhotoUploader: User not authenticated');
      return;
    }

    // Si no es múltiple, solo procesar el primer archivo
    const filesToProcess = multiple ? Array.from(files) : [files[0]];

    setUploading(true);

    try {
      const uploadPromises = filesToProcess.map(async (file, index) => {
        const fileId = `${file.name}_${index}`;
        
        // Validar archivo
        const maxSize = photoType === 'profile' ? 5 : 10;
        const validation = validateImageFile(file, maxSize);
        
        if (!validation.isValid) {
          throw new Error(`Archivo "${file.name}": ${validation.error}`);
        }

        // Simular progreso (en una implementación real usarías uploadBytesResumable)
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        try {
          // Subir archivo
          const downloadURL = await uploadUserPhoto(file, firebaseUser, photoType);
          
          // Actualizar progreso a 100%
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          return { success: true, url: downloadURL, fileName: file.name };
        } catch (error) {
          setUploadProgress(prev => ({ ...prev, [fileId]: -1 })); // -1 indica error
          
          // Mejorar mensajes de error específicos de Firebase
          let errorMessage = `Error al subir "${file.name}": `;
          
          if (error instanceof Error) {
            const errorCode = (error as any).code;
            switch (errorCode) {
              case 'storage/unauthorized':
                errorMessage += 'No tienes permisos para subir archivos. Verifica tu autenticación.';
                break;
              case 'storage/canceled':
                errorMessage += 'La subida fue cancelada.';
                break;
              case 'storage/unknown':
                errorMessage += 'Error desconocido del servidor. Intenta nuevamente.';
                break;
              case 'storage/object-not-found':
                errorMessage += 'No se pudo encontrar el archivo en el servidor.';
                break;
              case 'storage/bucket-not-found':
                errorMessage += 'Configuración de almacenamiento incorrecta.';
                break;
              case 'storage/project-not-found':
                errorMessage += 'Proyecto de Firebase no encontrado.';
                break;
              case 'storage/quota-exceeded':
                errorMessage += 'Se ha excedido la cuota de almacenamiento.';
                break;
              case 'storage/unauthenticated':
                errorMessage += 'Usuario no autenticado. Inicia sesión nuevamente.';
                break;
              case 'storage/retry-limit-exceeded':
                errorMessage += 'Se agotaron los intentos de subida. Intenta más tarde.';
                break;
              case 'storage/invalid-checksum':
                errorMessage += 'El archivo se corrompió durante la subida. Intenta nuevamente.';
                break;
              default:
                errorMessage += error.message || 'Error desconocido';
            }
          } else {
            errorMessage += 'Error desconocido';
          }
          
          throw new Error(errorMessage);
        }
      });

      // Esperar a que todas las subidas terminen
      const results = await Promise.allSettled(uploadPromises);
      
      // Procesar resultados
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      if (successful.length > 0) {
        const successfulUploads = successful.map(result => 
          (result as PromiseFulfilledResult<any>).value
        );
        
        if (photoType === 'profile') {
          console.log('Profile photo uploaded successfully:', successfulUploads[0].url);
          onUploadSuccess?.(successfulUploads[0].url);
        } else {
          console.log(`${successful.length} gallery photo(s) uploaded successfully`);
          successfulUploads.forEach(upload => onUploadSuccess?.(upload.url));
        }
      }

      if (failed.length > 0) {
        const errorMessages = failed.map(result => 
          (result as PromiseRejectedResult).reason.message
        );
        const errorMessage = `Errores en ${failed.length} archivo(s):\n${errorMessages.join('\n')}`;
        console.error('PhotoUploader: Upload errors:', errorMessages);
        onUploadError?.(errorMessage);
      }

    } catch (error) {
      let errorMessage = 'Error desconocido al procesar archivos';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('PhotoUploader: Critical error during upload process:', error);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Limpiar el input
      event.target.value = '';
    }
  };

  const getButtonText = () => {
    if (uploading) {
      return photoType === 'profile' ? 'Subiendo perfil...' : 'Subiendo fotos...';
    }
    return photoType === 'profile' ? 'Cambiar foto de perfil' : 'Agregar fotos';
  };

  const getAcceptedTypes = () => {
    return 'image/jpeg,image/jpg,image/png,image/webp';
  };

  return (
    <div className={`photo-uploader ${className}`}>
      <div className="relative">
        <input
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileSelect}
          disabled={uploading || !firebaseUser}
          multiple={multiple && photoType === 'gallery'}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id={`photo-upload-${photoType}`}
        />
        
        <label
          htmlFor={`photo-upload-${photoType}`}
          className={`
            flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed
            transition-all duration-200 cursor-pointer
            ${
              uploading || !firebaseUser
                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100'
            }
          `}
        >
          {photoType === 'profile' ? (
            <Camera className="w-5 h-5" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {getButtonText()}
          </span>
        </label>
      </div>

      {/* Mostrar progreso de subida */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-3 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => {
            const fileName = fileId.split('_')[0];
            return (
              <div key={fileId} className="flex items-center gap-2 text-xs">
                <span className="flex-1 truncate">{fileName}</span>
                {progress === -1 ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-gray-500 min-w-[3rem]">{progress}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Información de ayuda */}
      <div className="mt-2 text-xs text-gray-500">
        {photoType === 'profile' ? (
          <p>Formatos: JPG, PNG, WebP. Máximo 5MB.</p>
        ) : (
          <p>Formatos: JPG, PNG, WebP. Máximo 10MB por foto. {multiple ? 'Múltiples archivos permitidos.' : ''}</p>
        )}
      </div>
    </div>
  );
}

// Componente específico para foto de perfil
export function ProfilePhotoUploader({ 
  onUploadSuccess, 
  onUploadError, 
  className 
}: Omit<PhotoUploaderProps, 'photoType' | 'multiple'>) {
  return (
    <PhotoUploader
      photoType="profile"
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      className={className}
      multiple={false}
    />
  );
}

// Componente específico para galería de fotos
export function GalleryPhotoUploader({ 
  onUploadSuccess, 
  onUploadError, 
  className,
  multiple = true
}: Omit<PhotoUploaderProps, 'photoType'>) {
  return (
    <PhotoUploader
      photoType="gallery"
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      className={className}
      multiple={multiple}
    />
  );
}