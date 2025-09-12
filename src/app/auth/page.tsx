'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthFormData } from '@/types';
import AuthForm from '@/components/AuthForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      setError('Error al iniciar sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData: AuthFormData) => {
    setLoading(true);
    setError('');
    
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      const user = userCredential.user;

      // Subir foto de perfil
      let fotoPerfilUrl = '';
      if (formData.fotoPerfil) {
        fotoPerfilUrl = await uploadImage(
          formData.fotoPerfil,
          `users/${user.uid}/profile.jpg`
        );
      }

      // Subir fotos adicionales
      const fotosAdicionalesUrls: string[] = [];
      for (let i = 0; i < formData.fotosAdicionales.length; i++) {
        const file = formData.fotosAdicionales[i];
        const url = await uploadImage(
          file,
          `users/${user.uid}/additional_${i}.jpg`
        );
        fotosAdicionalesUrls.push(url);
      }

      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        nombre: formData.nombre,
        edad: formData.edad,
        genero: formData.genero,
        email: formData.email,
        rolSexual: formData.rolSexual || null,
        fotoPerfil: fotoPerfilUrl,
        fotosAdicionales: fotosAdicionalesUrls,
        ubicacion: formData.ubicacion || { lat: 0, lng: 0 },
        favoritos: [],
        bloqueados: [],
        lastOnline: new Date(),
      });

      router.push('/');
    } catch (error: any) {
      setError('Error al registrarse: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-accent-400">Gliter</span>
          </h1>
          <p className="text-primary-100">
            Encuentra tu match perfecto
          </p>
        </div>

        {/* Formulario */}
        <div className="card">
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <AuthForm
            isLogin={isLogin}
            loading={loading}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-primary-100 text-sm">
          Al continuar, aceptas nuestros términos y condiciones
        </div>
      </div>
    </div>
  );
};

export default AuthPage;