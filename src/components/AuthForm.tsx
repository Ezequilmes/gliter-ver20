'use client';

import { useState, useRef } from 'react';
import { Upload, X, MapPin } from 'lucide-react';
import { AuthFormData } from '@/types';
import { useUserLocation } from '@/hooks/useUserLocation';
import Image from 'next/image';

interface AuthFormProps {
  isLogin: boolean;
  loading: boolean;
  onLogin: (email: string, password: string) => void;
  onRegister: (formData: AuthFormData) => void;
}

const AuthForm = ({ isLogin, loading, onLogin, onRegister }: AuthFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    nombre: '',
    edad: 18,
    genero: '',
    email: '',
    password: '',
    rolSexual: undefined,
    fotoPerfil: null,
    fotosAdicionales: [],
    ubicacion: undefined,
  });
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [useLocation, setUseLocation] = useState(false);
  const { location, loading: locationLoading, error: locationError } = useUserLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value) : value;
    
    if (isLogin) {
      setLoginData(prev => ({ ...prev, [name]: finalValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fotoPerfil: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImages(prev => [result, ...prev.slice(1)]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.slice(0, 2 - formData.fotosAdicionales.length);
      setFormData(prev => ({
        ...prev,
        fotosAdicionales: [...prev.fotosAdicionales, ...newFiles]
      }));

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    if (index === 0) {
      setFormData(prev => ({ ...prev, fotoPerfil: null }));
    } else {
      const newAdditional = [...formData.fotosAdicionales];
      newAdditional.splice(index - 1, 1);
      setFormData(prev => ({ ...prev, fotosAdicionales: newAdditional }));
    }
    
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleLocationToggle = () => {
    setUseLocation(!useLocation);
    if (!useLocation && location) {
      setFormData(prev => ({ ...prev, ubicacion: location }));
    } else {
      setFormData(prev => ({ ...prev, ubicacion: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      onLogin(loginData.email, loginData.password);
    } else {
      if (!formData.fotoPerfil) {
        alert('La foto de perfil es obligatoria');
        return;
      }
      onRegister(formData);
    }
  };

  if (isLogin) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email-login"
            name="email"
            value={loginData.email}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password-login"
            name="password"
            value={loginData.password}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
            Edad
          </label>
          <input
            type="number"
            id="edad"
            name="edad"
            value={formData.edad}
            onChange={handleInputChange}
            min="18"
            max="100"
            className="input-field"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
          Género
        </label>
        <select
          id="genero"
          name="genero"
          value={formData.genero}
          onChange={handleInputChange}
          className="input-field"
          required
        >
          <option value="">Selecciona tu género</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="No binario">No binario</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="rolSexual" className="block text-sm font-medium text-gray-700 mb-1">
          Rol Sexual (Opcional)
        </label>
        <select
          id="rolSexual"
          name="rolSexual"
          value={formData.rolSexual || ''}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">No especificar</option>
          <option value="activo">Activo</option>
          <option value="pasivo">Pasivo</option>
          <option value="versátil">Versátil</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="email-register" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email-register"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="input-field"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          id="password-register"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="input-field"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useLocation"
          checked={useLocation}
          onChange={handleLocationToggle}
          className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
        />
        <label htmlFor="useLocation" className="text-sm font-medium text-gray-700">
          Usar mi ubicación actual
        </label>
      </div>

      {useLocation && locationLoading && (
        <p className="text-sm text-gray-500 flex items-center">
          <MapPin className="w-4 h-4 mr-1" /> Obteniendo ubicación...
        </p>
      )}
      {useLocation && locationError && (
        <p className="text-sm text-red-500 flex items-center">
          <X className="w-4 h-4 mr-1" /> Error al obtener ubicación: {locationError}
        </p>
      )}
      {useLocation && location && (
        <p className="text-sm text-green-600 flex items-center">
          <MapPin className="w-4 h-4 mr-1" /> Ubicación obtenida: {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
        </p>
      )}

      <div>
        <label htmlFor="profile-photo" className="block text-sm font-medium text-gray-700 mb-1">
          Foto de Perfil (Obligatoria)
        </label>
        <input
          type="file"
          id="profile-photo"
          accept="image/*"
          onChange={handleProfileImageChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full flex items-center justify-center"
        >
          <Upload className="w-5 h-5 mr-2" /> Subir Foto de Perfil
        </button>
        {formData.fotoPerfil && (
          <div className="mt-2 relative w-24 h-24 rounded-full overflow-hidden mx-auto">
            <Image
              src={previewImages[0]}
              alt="Foto de Perfil"
              layout="fill"
              objectFit="cover"
            />
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="additional-photos" className="block text-sm font-medium text-gray-700 mb-1">
          Fotos Adicionales (Máx. 2)
        </label>
        <input
          type="file"
          id="additional-photos"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesChange}
          ref={additionalFilesRef}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => additionalFilesRef.current?.click()}
          className="btn-secondary w-full flex items-center justify-center"
          disabled={formData.fotosAdicionales.length >= 2}
        >
          <Upload className="w-5 h-5 mr-2" /> Subir Fotos Adicionales
        </button>
        <div className="mt-2 flex space-x-2 justify-center">
          {previewImages.slice(1).map((src, index) => (
            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={src}
                alt={`Foto adicional ${index + 1}`}
                layout="fill"
                objectFit="cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index + 1)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
};

export default AuthForm;