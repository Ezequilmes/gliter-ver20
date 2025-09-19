import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { User } from 'firebase/auth';

/**
 * Función para subir fotos de usuario a Firebase Storage y actualizar Firestore
 * @param file - Archivo de imagen a subir
 * @param user - Usuario autenticado de Firebase
 * @param photoType - Tipo de foto ('profile' | 'gallery')
 * @returns Promise<string> - URL de descarga de la imagen subida
 */
export async function uploadUserPhoto(
  file: File,
  user: User,
  photoType: 'profile' | 'gallery' = 'gallery'
): Promise<string> {
  try {
    // Validaciones
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    if (!user || !user.uid) {
      throw new Error('Usuario no autenticado');
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (10MB máximo para galería, 5MB para perfil)
    const maxSize = photoType === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = photoType === 'profile' ? 5 : 10;
      throw new Error(`La imagen debe ser menor a ${maxSizeMB}MB`);
    }

    // Verificar token de autenticación
    await user.getIdToken(true);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${photoType}_${timestamp}.${fileExtension}`;

    // Determinar ruta de Storage según el tipo
    let storagePath: string;
    if (photoType === 'profile') {
      storagePath = `users/${user.uid}/profile/${fileName}`;
    } else {
      storagePath = `users/${user.uid}/gallery/${fileName}`;
    }

    // Crear referencia de Storage
    const imageRef = ref(storage, storagePath);

    // Metadata para el archivo
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        photoType: photoType,
        fileSize: file.size.toString()
      }
    };

    console.log(`Subiendo ${photoType} a:`, storagePath);

    // Subir archivo a Storage
    const uploadResult = await uploadBytes(imageRef, file, metadata);
    console.log('Subida completada:', uploadResult.metadata.fullPath);

    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(imageRef);
    console.log('URL de descarga obtenida:', downloadURL);

    // Actualizar Firestore según el tipo de foto
    if (photoType === 'profile') {
      // Para foto de perfil, actualizar campos específicos
      await setDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
        fotoPerfil: downloadURL,
        hasProfileImage: true,
        lastImageUpdate: new Date(),
        profileImageMetadata: {
          size: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
          storagePath: storagePath
        }
      }, { merge: true });

      // Actualizar perfil público
      await setDoc(doc(db, 'publicProfiles', user.uid), {
        photoURL: downloadURL,
        hasProfileImage: true,
        updatedAt: new Date()
      }, { merge: true });

    } else {
      // Para fotos de galería, agregar al array de fotos
      const photoData = {
        url: downloadURL,
        uploadedAt: new Date(),
        storagePath: storagePath,
        metadata: {
          size: file.size,
          contentType: file.type,
          originalName: file.name
        }
      };

      // Usar arrayUnion para agregar la nueva foto al array
      await setDoc(doc(db, 'users', user.uid), {
        photos: arrayUnion(photoData),
        lastPhotoUpdate: new Date()
      }, { merge: true });

      // También actualizar en la subcolección de fotos para mejor organización
      await setDoc(doc(db, 'users', user.uid, 'photos', timestamp.toString()), {
        url: downloadURL,
        uploadedAt: new Date(),
        storagePath: storagePath,
        metadata: photoData.metadata
      }, { merge: true });
    }

    console.log(`${photoType === 'profile' ? 'Foto de perfil' : 'Foto de galería'} subida exitosamente`);
    return downloadURL;

  } catch (error) {
    console.error('Error en uploadUserPhoto:', error);
    
    // Manejo específico de errores de Firebase
    const firebaseError = error as any;
    if (firebaseError.code === 'storage/unauthorized') {
      throw new Error('No tienes permisos para subir imágenes. Verifica tu autenticación.');
    } else if (firebaseError.code === 'storage/unauthenticated') {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    } else if (firebaseError.code === 'storage/quota-exceeded') {
      throw new Error('Cuota de almacenamiento excedida.');
    } else if (firebaseError.code === 'storage/invalid-format') {
      throw new Error('Formato de imagen no válido.');
    } else if (firebaseError.code === 'storage/object-not-found') {
      throw new Error('Archivo no encontrado.');
    } else {
      throw new Error(firebaseError.message || 'Error desconocido al subir la imagen');
    }
  }
}

/**
 * Función auxiliar para validar archivos de imagen
 * @param file - Archivo a validar
 * @param maxSizeMB - Tamaño máximo en MB
 * @returns boolean - true si es válido
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No se proporcionó ningún archivo' };
  }

  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'El archivo debe ser una imagen' };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: `La imagen debe ser menor a ${maxSizeMB}MB` };
  }

  // Validar tipos de imagen permitidos
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de imagen no permitido. Usa JPG, PNG o WebP.' };
  }

  return { isValid: true };
}

/**
 * Función para obtener el progreso de subida (para implementación futura)
 * @param file - Archivo a subir
 * @param user - Usuario autenticado
 * @param onProgress - Callback para el progreso
 * @returns Promise<string> - URL de descarga
 */
export async function uploadUserPhotoWithProgress(
  file: File,
  user: User,
  photoType: 'profile' | 'gallery' = 'gallery',
  onProgress?: (progress: number) => void
): Promise<string> {
  // Esta función se puede implementar usando uploadBytesResumable
  // Por ahora, usa la función principal
  if (onProgress) {
    onProgress(0);
  }
  
  const result = await uploadUserPhoto(file, user, photoType);
  
  if (onProgress) {
    onProgress(100);
  }
  
  return result;
}