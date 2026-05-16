import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

export const purgeOldPlays = onSchedule("every 24 hours", async () => {
  const db = getFirestore();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  let totalDeleted = 0;
  while (true) {
    const snapshot = await db
      .collectionGroup("plays")
      .where("startedAt", "<", cutoff)
      .limit(500)
      .get();

    if (snapshot.empty) break;

    const userPlays = snapshot.docs.filter((d) =>
      d.ref.path.startsWith("users/")
    );
    if (userPlays.length === 0) break;

    const batch = db.batch();
    userPlays.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    totalDeleted += snapshot.docs.length;
    if (snapshot.docs.length < 500) break;
  }

  console.log(`Purged ${totalDeleted} old play documents.`);
});

export const onGamePlayStarted = onDocumentCreated(
  "users/{userId}/games/{gameId}/plays/{playId}",
  async (event) => {
    const { userId, gameId } = event.params;
    const db = getFirestore();
    const increment = { playCount: FieldValue.increment(1) };
    await Promise.all([
      db.doc(`games/${gameId}`).set(increment, { merge: true }),
      db.doc(`users/${userId}/games/${gameId}`).set(increment, { merge: true }),
    ]);
  }
);
