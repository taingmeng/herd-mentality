import { firestore } from "./firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";

export const startGamePlay = async (userId: string, gameId: string): Promise<string | null> => {
  try {
    const userPlayRef = doc(collection(firestore, "users", userId, "games", gameId, "plays"));
    await setDoc(userPlayRef, { startedAt: serverTimestamp() });
    return userPlayRef.id;
  } catch (e) {
    console.error("Error starting game play:", e);
    return null;
  }
};

export const endGamePlay = async (userId: string, gameId: string, playId: string, score?: number): Promise<void> => {
  try {
    const userPlayRef = doc(firestore, "users", userId, "games", gameId, "plays", playId);
    await updateDoc(userPlayRef, {
      endedAt: serverTimestamp(),
      ...(score !== undefined && { score }),
    });
  } catch (e) {
    console.error("Error ending game play:", e);
  }
};

export const incrementGamePlayCount = async (userId: string | null, gameId: string): Promise<void> => {
  try {
    await setDoc(doc(firestore, "games", gameId), { playCount: increment(1) }, { merge: true });
    if (userId) {
      await setDoc(doc(firestore, "users", userId, "games", gameId), { playCount: increment(1) }, { merge: true });
    }
  } catch (e) {
    console.error("Error incrementing play count:", e);
  }
};

export const recordUserHighScore = async (userId: string, gameId: string, score: number): Promise<void> => {
  try {
    const ref = doc(firestore, "users", userId, "games", gameId);
    await setDoc(ref, { highScore: score }, { merge: true });
  } catch (e) {
    console.error("Error recording high score:", e);
  }
};