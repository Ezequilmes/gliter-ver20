import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

/**
 * Agregar un usuario a favoritos
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a agregar a favoritos
 */
export async function addToFavorites(currentUser: User, targetUserId: string): Promise<void> {
  if (!currentUser || !currentUser.uid) {
    throw new Error('Usuario no autenticado');
  }

  if (currentUser.uid === targetUserId) {
    throw new Error('No puedes agregarte a ti mismo como favorito');
  }

  try {
    // Actualizar la lista de favoritos del usuario actual
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      favoritos: arrayUnion(targetUserId),
      lastUpdated: new Date()
    });

    // También actualizar en publicProfiles si existe
    const publicProfileRef = doc(db, 'publicProfiles', currentUser.uid);
    const publicProfileDoc = await getDoc(publicProfileRef);
    
    if (publicProfileDoc.exists()) {
      await updateDoc(publicProfileRef, {
        favoritos: arrayUnion(targetUserId),
        lastUpdated: new Date()
      });
    }

    console.log(`Usuario ${targetUserId} agregado a favoritos`);
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
    throw new Error('No se pudo agregar a favoritos. Inténtalo de nuevo.');
  }
}

/**
 * Remover un usuario de favoritos
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a remover de favoritos
 */
export async function removeFromFavorites(currentUser: User, targetUserId: string): Promise<void> {
  if (!currentUser || !currentUser.uid) {
    throw new Error('Usuario no autenticado');
  }

  try {
    // Actualizar la lista de favoritos del usuario actual
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      favoritos: arrayRemove(targetUserId),
      lastUpdated: new Date()
    });

    // También actualizar en publicProfiles si existe
    const publicProfileRef = doc(db, 'publicProfiles', currentUser.uid);
    const publicProfileDoc = await getDoc(publicProfileRef);
    
    if (publicProfileDoc.exists()) {
      await updateDoc(publicProfileRef, {
        favoritos: arrayRemove(targetUserId),
        lastUpdated: new Date()
      });
    }

    console.log(`Usuario ${targetUserId} removido de favoritos`);
  } catch (error) {
    console.error('Error al remover de favoritos:', error);
    throw new Error('No se pudo remover de favoritos. Inténtalo de nuevo.');
  }
}

/**
 * Bloquear un usuario
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a bloquear
 */
export async function blockUser(currentUser: User, targetUserId: string): Promise<void> {
  if (!currentUser || !currentUser.uid) {
    throw new Error('Usuario no autenticado');
  }

  if (currentUser.uid === targetUserId) {
    throw new Error('No puedes bloquearte a ti mismo');
  }

  try {
    // Actualizar la lista de bloqueados del usuario actual
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      bloqueados: arrayUnion(targetUserId),
      favoritos: arrayRemove(targetUserId), // Remover de favoritos si estaba
      lastUpdated: new Date()
    });

    // También actualizar en publicProfiles si existe
    const publicProfileRef = doc(db, 'publicProfiles', currentUser.uid);
    const publicProfileDoc = await getDoc(publicProfileRef);
    
    if (publicProfileDoc.exists()) {
      await updateDoc(publicProfileRef, {
        bloqueados: arrayUnion(targetUserId),
        favoritos: arrayRemove(targetUserId), // Remover de favoritos si estaba
        lastUpdated: new Date()
      });
    }

    console.log(`Usuario ${targetUserId} bloqueado`);
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    throw new Error('No se pudo bloquear al usuario. Inténtalo de nuevo.');
  }
}

/**
 * Desbloquear un usuario
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a desbloquear
 */
export async function unblockUser(currentUser: User, targetUserId: string): Promise<void> {
  if (!currentUser || !currentUser.uid) {
    throw new Error('Usuario no autenticado');
  }

  try {
    // Actualizar la lista de bloqueados del usuario actual
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      bloqueados: arrayRemove(targetUserId),
      lastUpdated: new Date()
    });

    // También actualizar en publicProfiles si existe
    const publicProfileRef = doc(db, 'publicProfiles', currentUser.uid);
    const publicProfileDoc = await getDoc(publicProfileRef);
    
    if (publicProfileDoc.exists()) {
      await updateDoc(publicProfileRef, {
        bloqueados: arrayRemove(targetUserId),
        lastUpdated: new Date()
      });
    }

    console.log(`Usuario ${targetUserId} desbloqueado`);
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    throw new Error('No se pudo desbloquear al usuario. Inténtalo de nuevo.');
  }
}

/**
 * Verificar si un usuario está en favoritos
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a verificar
 * @returns Promise<boolean> - true si está en favoritos
 */
export async function isUserFavorite(currentUser: User, targetUserId: string): Promise<boolean> {
  if (!currentUser || !currentUser.uid) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favoritos = userData.favoritos || [];
      return favoritos.includes(targetUserId);
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return false;
  }
}

/**
 * Verificar si un usuario está bloqueado
 * @param currentUser - Usuario actual autenticado
 * @param targetUserId - ID del usuario a verificar
 * @returns Promise<boolean> - true si está bloqueado
 */
export async function isUserBlocked(currentUser: User, targetUserId: string): Promise<boolean> {
  if (!currentUser || !currentUser.uid) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const bloqueados = userData.bloqueados || [];
      return bloqueados.includes(targetUserId);
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar bloqueo:', error);
    return false;
  }
}