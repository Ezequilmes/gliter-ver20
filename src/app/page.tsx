import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import UserGrid from '@/components/UserGrid';

export default async function Home() {
  const usersCollectionRef = collection(db, 'users');
  const q = query(usersCollectionRef, limit(10));
  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as User);
  });

  const loadMoreUsers = async () => {
    // Lógica para cargar más usuarios (aún no implementada)
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explorar Usuarios</h1>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay usuarios cerca
            </h3>
            <p className="text-gray-500">
              Intenta ampliar tu área de búsqueda o vuelve más tarde
            </p>
          </div>
        ) : (
          <UserGrid initialUsers={users} loadMoreUsers={loadMoreUsers} hasMore={false} />
        )}
      </main>
    </div>
  );
}