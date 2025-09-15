"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateUsersToPublicProfiles = exports.updateUserLocation = exports.getNearbyUsers = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../admin");
const firestore_1 = require("firebase-admin/firestore");
// Placeholder for user management functions
exports.getNearbyUsers = (0, https_1.onCall)(async (request) => {
    console.log('Getting nearby users:', request.data);
    return { success: true, message: 'Nearby users placeholder', users: [] };
});
exports.updateUserLocation = (0, https_1.onCall)(async (request) => {
    console.log('Updating user location:', request.data);
    return { success: true, message: 'Location update placeholder' };
});
// Callable function: migrateUsersToPublicProfiles
// Admin-only: requires request.auth.token.admin === true
// Migrates a batch of users documents into publicProfiles with the allowed fields
exports.migrateUsersToPublicProfiles = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    if (!request.auth || request.auth.token.admin !== true) {
        throw new Error('unauthorized');
    }
    const pageSize = Math.min(Math.max(Number(((_a = request.data) === null || _a === void 0 ? void 0 : _a.pageSize) || 50), 1), 200);
    const startAfterId = (_b = request.data) === null || _b === void 0 ? void 0 : _b.startAfterId;
    let q = admin_1.db.collection('users').orderBy('__name__').limit(pageSize);
    if (startAfterId) {
        q = q.startAfter(startAfterId);
    }
    const snap = await q.get();
    const batch = admin_1.db.batch();
    let migrated = 0;
    const lastId = snap.docs.length ? snap.docs[snap.docs.length - 1].id : undefined;
    for (const docSnap of snap.docs) {
        const uid = docSnap.id;
        const data = docSnap.data();
        const displayName = String(data.nombre || data.displayName || 'Usuario');
        const ageNum = Number((_c = data.edad) !== null && _c !== void 0 ? _c : data.age);
        const age = Number.isFinite(ageNum) ? Math.max(18, Math.min(100, Math.floor(ageNum))) : 18;
        const gender = data.genero || data.gender || undefined;
        const photoURL = data.fotoPerfil || data.photoURL || undefined;
        const location = data.ubicacion || data.location || undefined;
        // Build allowed payload according to rules
        const payload = {
            displayName,
            age,
            lastActive: firestore_1.FieldValue.serverTimestamp(),
        };
        if (gender && typeof gender === 'string')
            payload.gender = gender;
        if (photoURL && typeof photoURL === 'string')
            payload.photoURL = photoURL;
        if (location && typeof location === 'object')
            payload.location = location;
        batch.set(admin_1.db.collection('publicProfiles').doc(uid), payload, { merge: true });
        migrated += 1;
    }
    await batch.commit();
    return { success: true, migrated, lastId };
});
//# sourceMappingURL=index.js.map