'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const authState = useAuth();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Durante la hidratación, mostrar estado de loading
  if (!isClient) {
    const loadingValue: AuthContextType = {
      user: null,
      firebaseUser: null,
      loading: true,
      error: null,
      isAuthenticated: false
    };
    
    return (
      <AuthContext.Provider value={loadingValue}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  const value: AuthContextType = {
    ...authState,
    isAuthenticated: !!authState.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Hook para proteger rutas
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  return {
    isAuthenticated,
    loading,
    shouldRedirect: !loading && !isAuthenticated
  };
};