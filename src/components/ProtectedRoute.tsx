'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth',
  requireAuth = true 
}) => {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // Redirigir usuarios autenticados lejos de páginas como /auth
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticacion...</p>
        </div>
      </div>
    );
  }

  // No mostrar contenido si no cumple los requisitos de autenticación
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Hook para usar en componentes que necesitan verificar autenticación
export const useProtectedRoute = (requireAuth: boolean = true) => {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  const checkAuth = () => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/auth');
        return false;
      }
      if (!requireAuth && isAuthenticated) {
        router.push('/');
        return false;
      }
    }
    return true;
  };

  return {
    isAuthenticated,
    loading,
    checkAuth,
    canAccess: requireAuth ? isAuthenticated : !isAuthenticated
  };
};