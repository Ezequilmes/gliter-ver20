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
  if (!request.auth || request.auth.token?.admin !== true) {
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
    const data = docSnap.data() as Record<string, unknown>;

    const displayNameCandidate = (data['nombre'] ?? data['displayName']);
    const displayName: string =
      typeof displayNameCandidate === 'string' && displayNameCandidate.trim()
        ? displayNameCandidate
        : 'Usuario';

    const ageCandidate = (data['edad'] ?? data['age']);
    const ageNum =
      typeof ageCandidate === 'number'
        ? ageCandidate
        : typeof ageCandidate === 'string'
        ? Number(ageCandidate)
        : NaN;
    const age: number = Number.isFinite(ageNum) ? Math.max(18, Math.min(100, Math.floor(ageNum))) : 18;

    const genderCandidate = (data['genero'] ?? data['gender']);
    const gender: string | undefined = typeof genderCandidate === 'string' ? genderCandidate : undefined;

    const photoURLCandidate = (data['fotoPerfil'] ?? data['photoURL']);
    const photoURL: string | undefined = typeof photoURLCandidate === 'string' ? photoURLCandidate : undefined;

    const locationCandidate = (data['ubicacion'] ?? data['location']);
    const location = typeof locationCandidate === 'object' && locationCandidate !== null ? locationCandidate : undefined;

    // Build allowed payload according to rules
    const payload: Record<string, unknown> = {
      displayName,
      age,
      lastActive: FieldValue.serverTimestamp(),
    };
    if (gender) payload.gender = gender;
    if (photoURL) payload.photoURL = photoURL;
    if (location) payload.location = location;

    batch.set(db.collection('publicProfiles').doc(uid), payload, { merge: true });
    migrated += 1;
  }

  await batch.commit();

  return { success: true, migrated, lastId };
});