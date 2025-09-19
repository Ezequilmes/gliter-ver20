import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Función para refrescar los datos del usuario desde Firestore
 * @param firebaseUser - Usuario autenticado de Firebase
 * @returns Promise<User | null> - Datos actualizados del usuario
 */
export async function refreshUserData(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    if (!firebaseUser?.uid) {
      throw new Error('Usuario no autenticado');
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const user: User = {
        uid: firebaseUser.uid,
        email: userData.email || firebaseUser.email || '',
        nombre: userData.nombre || '',
        edad: userData.edad || 18,
        genero: userData.genero || '',
        rolSexual: userData.rolSexual || null,
        fotoPerfil: userData.fotoPerfil || userData.photoURL || '',
        fotosAdicionales: userData.fotosAdicionales || [],
        ubicacion: userData.ubicacion || { lat: 0, lng: 0 },
        favoritos: userData.favoritos || [],
        bloqueados: userData.bloqueados || [],
        lastOnline: userData.lastOnline?.toDate() || new Date(),
        photos: userData.photos || [] // Para las fotos de galería
      };
      
      console.log('Datos del usuario refrescados:', user);
      return user;
    } else {
      console.warn('Documento de usuario no encontrado');
      return null;
    }
  } catch (error) {
    console.error('Error al refrescar datos del usuario:', error);
    throw error;
  }
}

/**
 * Hook personalizado para refrescar datos del usuario
 * @param firebaseUser - Usuario autenticado de Firebase
 * @param onUserUpdate - Callback para actualizar el estado del usuario
 * @returns Función para refrescar datos
 */
export function useRefreshUserData(
  firebaseUser: FirebaseUser | null,
  onUserUpdate: (user: User | null) => void
) {
  const refreshUser = async () => {
    if (!firebaseUser) {
      console.warn('No hay usuario autenticado para refrescar');
      return;
    }

    try {
      const updatedUser = await refreshUserData(firebaseUser);
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      // No actualizar el estado si hay error
    }
  };

  return refreshUser;
}