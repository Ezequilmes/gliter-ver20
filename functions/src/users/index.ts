import { onCall } from 'firebase-functions/v2/https';
import { db } from '../admin';
import { FieldValue } from 'firebase-admin/firestore';

// Placeholder for user management functions
export const getNearbyUsers = onCall(async (request) => {
  console.log('Getting nearby users:', request.data);
  return { success: true, message: 'Nearby users placeholder', users: [] };
});

export const updateUserLocation = onCall(async (request) => {
  console.log('Updating user location:', request.data);
  return { success: true, message: 'Location update placeholder' };
});

// Callable function: migrateUsersToPublicProfiles
// Admin-only: requires request.auth.token.admin === true
// Migrates a batch of users documents into publicProfiles with the allowed fields
export const migrateUsersToPublicProfiles = onCall<{ pageSize?: number; startAfterId?: string }>(async (request) => {
  if (!request.auth || (request.auth.token as any).admin !== true) {
    throw new Error('unauthorized');
  }

  const pageSize = Math.min(Math.max(Number(request.data?.pageSize || 50), 1), 200);
  const startAfterId = request.data?.startAfterId as string | undefined;

  let q = db.collection('users').orderBy('__name__').limit(pageSize);
  if (startAfterId) {
    q = q.startAfter(startAfterId);
  }

  const snap = await q.get();
  const batch = db.batch();
  let migrated = 0;
  const lastId = snap.docs.length ? snap.docs[snap.docs.length - 1].id : undefined;

  for (const docSnap of snap.docs) {
    const uid = docSnap.id;
    const data = docSnap.data() as any;

    const displayName: string = String(data.nombre || data.displayName || 'Usuario');
    const ageNum = Number(data.edad ?? data.age);
    const age: number = Number.isFinite(ageNum) ? Math.max(18, Math.min(100, Math.floor(ageNum))) : 18;

    const gender: string | undefined = data.genero || data.gender || undefined;
    const photoURL: string | undefined = data.fotoPerfil || data.photoURL || undefined;
    const location = data.ubicacion || data.location || undefined;

    // Build allowed payload according to rules
    const payload: Record<string, unknown> = {
      displayName,
      age,
      lastActive: FieldValue.serverTimestamp(),
    };
    if (gender && typeof gender === 'string') payload.gender = gender;
    if (photoURL && typeof photoURL === 'string') payload.photoURL = photoURL;
    if (location && typeof location === 'object') payload.location = location;

    batch.set(db.collection('publicProfiles').doc(uid), payload, { merge: true });
    migrated += 1;
  }

  await batch.commit();

  return { success: true, migrated, lastId };
});