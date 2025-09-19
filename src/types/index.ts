export interface User {
  uid: string;
  nombre: string;
  edad: number;
  genero: string;
  ubicacion: {
    lat: number;
    lng: number;
  };
  rolSexual?: 'pasivo' | 'activo' | 'versatil' | null;
  fotoPerfil: string;
  fotosAdicionales: string[];
  photos?: any[]; // Para las fotos de galería
  favoritos: string[];
  bloqueados: string[];
  lastOnline: Date;
  email: string;
}

export interface Chat {
  id: string;
  participants: [string, string];
  lastMessage: string;
  lastTimestamp: Date;
}

export interface Message {
  id: string;
  senderId: string;
  message: string;
  tipo: 'texto' | 'foto';
  urlFoto?: string;
  timestamp: Date;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface AuthFormData {
  nombre: string;
  edad: number;
  genero: string;
  email: string;
  password: string;
  rolSexual?: 'pasivo' | 'activo' | 'versatil';
  fotoPerfil: File | null;
  fotosAdicionales: File[];
  ubicacion?: UserLocation;
}

export interface QueryDocumentSnapshot<T> {
  id: string;
  data(): T;
}