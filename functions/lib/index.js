"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGamePlayStarted = exports.purgeOldPlays = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
exports.purgeOldPlays = (0, scheduler_1.onSchedule)("every 24 hours", async () => {
    const db = (0, firestore_2.getFirestore)();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    let totalDeleted = 0;
    while (true) {
        const snapshot = await db
            .collectionGroup("plays")
            .where("startedAt", "<", cutoff)
            .limit(500)
            .get();
        if (snapshot.empty)
            break;
        const userPlays = snapshot.docs.filter((d) => d.ref.path.startsWith("users/"));
        if (userPlays.length === 0)
            break;
        const batch = db.batch();
        userPlays.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        totalDeleted += snapshot.docs.length;
        if (snapshot.docs.length < 500)
            break;
    }
    console.log(`Purged ${totalDeleted} old play documents.`);
});
exports.onGamePlayStarted = (0, firestore_1.onDocumentCreated)("users/{userId}/games/{gameId}/plays/{playId}", async (event) => {
    const { userId, gameId } = event.params;
    const db = (0, firestore_2.getFirestore)();
    const increment = { playCount: firestore_2.FieldValue.increment(1) };
    await Promise.all([
        db.doc(`games/${gameId}`).set(increment, { merge: true }),
        db.doc(`users/${userId}/games/${gameId}`).set(increment, { merge: true }),
    ]);
});
//# sourceMappingURL=index.js.map