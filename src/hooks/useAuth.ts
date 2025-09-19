import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado - obtener datos completos de Firestore
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
              fotoPerfil: userData.fotoPerfil || '',
              fotosAdicionales: userData.fotosAdicionales || [],
              ubicacion: userData.ubicacion || { lat: 0, lng: 0 },
              favoritos: userData.favoritos || [],
              bloqueados: userData.bloqueados || [],
              lastOnline: userData.lastOnline?.toDate() || new Date()
            };
            
            setAuthState({
              user,
              firebaseUser,
              loading: false,
              error: null
            });
          } else {
            // Usuario de Firebase existe pero no tiene documento en Firestore
            setAuthState({
              user: null,
              firebaseUser,
              loading: false,
              error: 'Perfil de usuario incompleto'
            });
          }
        } else {
          // Usuario no autenticado
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setAuthState({
          user: null,
          firebaseUser,
          loading: false,
          error: 'Error al cargar perfil de usuario'
        });
      }
    });

    return () => unsubscribe();
  }, [isClient]);

  // Durante la hidratación, mantener el estado de loading
  if (!isClient) {
    return {
      user: null,
      firebaseUser: null,
      loading: true,
      error: null
    };
  }

  return authState;
};

// Hook simplificado para casos donde solo necesitas saber si está autenticado
export const useAuthStatus = () => {
  const { user, loading } = useAuth();
  return {
    isAuthenticated: !!user,
    loading
  };
};