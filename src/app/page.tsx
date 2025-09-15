'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, type Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { User } from '@/types';
import UserGrid from '@/components/UserGrid';

// Tipo para documentos de la colección publicProfiles
type PublicProfileDoc = {
  displayName?: string;
  nombre?: string;
  age?: number;
  edad?: number;
  gender?: string;
  genero?: string;
  location?: { lat: number; lng: number };
  ubicacion?: { lat: number; lng: number };
  rolSexual?: User['rolSexual'];
  photoURL?: string;
  fotoPerfil?: string;
  fotosAdicionales?: string[];
  favoritos?: string[];
  bloqueados?: string[];
  lastActive?: Timestamp | number | string | Date;
  email?: string;
};

function isTimestamp(val: unknown): val is Timestamp {
  return typeof val === 'object' && val !== null && typeof (val as { toMillis?: unknown }).toMillis === 'function';
}

// Codificador base64 seguro para UTF-8
function toBase64Utf8(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    // Fallback por si el entorno no soporta unescape/encodeURIComponent correctamente
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'utf-8').toString('base64');
    }
    return btoa(input.replace(/[^\x20-\x7E]/g, '?'));
  }
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, loadingAuth] = useAuthState(auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!firebaseUser) {
          // No autenticado: respetar reglas (no leer) y mostrar CTA
          setUsers([]);
          return;
        }
        const profilesRef = collection(db, 'publicProfiles');
        const q = query(profilesRef, limit(10));
        const querySnapshot = await getDocs(q);
        const fetched: User[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<PublicProfileDoc>;
          const nombre = data.displayName ?? data.nombre ?? 'Usuario';
          const edad = data.age ?? data.edad ?? 18;
          const genero = data.gender ?? data.genero ?? 'no especificado';
          const ubicacion = data.location ?? data.ubicacion ?? { lat: 0, lng: 0 };
          const rolSexual = (data.rolSexual ?? null) as User['rolSexual'];
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
                <rect width='400' height='300' fill='#e5e7eb'/>
                <text x='200' y='160' text-anchor='middle' fill='#6b7280' font-size='48' font-family='Arial, sans-serif'>${
                  (nombre as string).charAt(0).toUpperCase() || 'U'
                }</text>
              </svg>`;
          const fotoPerfil =
            data.photoURL ??
            data.fotoPerfil ??
            `data:image/svg+xml;base64,${toBase64Utf8(svg)}`;
          const fotosAdicionales = Array.isArray(data.fotosAdicionales) ? data.fotosAdicionales : [];
          const favoritos: string[] = Array.isArray(data.favoritos) ? data.favoritos : [];
          const bloqueados: string[] = Array.isArray(data.bloqueados) ? data.bloqueados : [];

          const la = data.lastActive;
          let lastOnline: Date;
          if (isTimestamp(la)) {
            lastOnline = new Date(la.toMillis());
          } else if (typeof la === 'string' || typeof la === 'number') {
            lastOnline = new Date(la);
          } else if (la instanceof Date) {
            lastOnline = la;
          } else {
            lastOnline = new Date();
          }

          const email = data.email ?? '';

          fetched.push({
            uid: docSnap.id,
            nombre,
            edad,
            genero,
            ubicacion,
            rolSexual,
            fotoPerfil,
            fotosAdicionales,
            favoritos,
            bloqueados,
            lastOnline,
            email,
          });
        });
        setUsers(fetched);
      } catch (err) {
        console.warn('No se pudieron cargar usuarios en Home():', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar al estar resuelto el estado de autenticación
    if (!loadingAuth) {
      setLoading(true);
      fetchUsers();
    }
  }, [firebaseUser, loadingAuth]);

  const loadMoreUsers = async () => {
    // Lógica para cargar más usuarios (no implementada aún)
    return [] as User[];
  };

  // Estados de autenticación/carga
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto p-4">
          <div className="text-center py-12 text-gray-500">Cargando sesión…</div>
        </main>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explorar Usuarios</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver perfiles públicos.</p>
          <Link
            href="/auth"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ir a Iniciar Sesión
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explorar Usuarios</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios cerca</h3>
            <p className="text-gray-500">Intenta ampliar tu área de búsqueda o vuelve más tarde</p>
          </div>
        ) : (
          <UserGrid initialUsers={users} loadMoreUsers={loadMoreUsers} hasMore={false} />
        )}
      </main>
    </div>
  );
}