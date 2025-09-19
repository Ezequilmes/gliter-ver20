'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import UserCard from './UserCard';
import ProfileModal from './ProfileModal';
import { calculateDistance } from '@/utils/location';
import { useAuth } from '@/hooks/useAuth';
import { addToFavorites, removeFromFavorites, blockUser } from '@/utils/userActions';

interface UserGridProps {
  initialUsers: User[];
  loadMoreUsers: () => Promise<User[]>;
  hasMore: boolean;
}

const UserGrid = ({ initialUsers, loadMoreUsers, hasMore }: UserGridProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser, firebaseUser } = useAuth();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const loadUsers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const moreUsers = await loadMoreUsers();
      setUsers((prevUsers) => [...prevUsers, ...moreUsers]);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMoreUsers]);

  const handleFavorite = useCallback(async (userId: string) => {
    if (!firebaseUser) return;
    
    try {
      // Aquí podrías verificar si ya es favorito y alternar
      await addToFavorites(firebaseUser, userId);
      console.log('Usuario agregado a favoritos:', userId);
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
    }
  }, [firebaseUser]);

  const handleBlock = useCallback(async (userId: string) => {
    if (!firebaseUser) return;
    
    try {
      await blockUser(firebaseUser, userId);
      console.log('Usuario bloqueado:', userId);
      // Remover el usuario de la lista actual
      setUsers(users.filter(user => user.uid !== userId));
    } catch (error) {
      console.error('Error al bloquear usuario:', error);
    }
  }, [firebaseUser, users]);

  const handleChat = useCallback((userId: string) => {
    console.log(`Chat with user ${userId}`);
    window.location.href = `/chat/${userId}`;
  }, []);

  const handleViewProfile = useCallback((userId: string) => {
    const user = users.find((u) => u.uid === userId);
    if (user) {
      setSelectedUser(user);
      setShowProfileModal(true);
    }
  }, [users]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.uid}
            user={user}
            distance={calculateDistance(user.ubicacion) || undefined}
            onFavorite={handleFavorite}
            onBlock={handleBlock}
            onChat={handleChat}
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>

      {/* Botón para cargar más */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      {/* Modal de perfil */}
      {showProfileModal && selectedUser && (
        <ProfileModal
          user={selectedUser}
          onClose={() => setShowProfileModal(false)}
          onChat={() => handleChat(selectedUser.uid)}
          onFavorite={() => handleFavorite(selectedUser.uid)}
          onBlock={() => handleBlock(selectedUser.uid)}
        />
      )}
    </>
  );
};

export default UserGrid;