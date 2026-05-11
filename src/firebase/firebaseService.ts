import { firestore } from "./firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const startGamePlay = async (userId: string, gameId: string): Promise<string | null> => {
  try {
    const userPlayRef = doc(collection(firestore, "users", userId, "games", gameId, "plays"));
    const gamePlayRef = doc(firestore, "games", gameId, "plays", userPlayRef.id);

    const startTime = serverTimestamp();
    await Promise.all([
      setDoc(userPlayRef, { startTime }),
      setDoc(gamePlayRef, { startTime, userId }),
    ]);

    return userPlayRef.id;
  } catch (e) {
    console.error("Error starting game play:", e);
    return null;
  }
};

export const endGamePlay = async (userId: string, gameId: string, playId: string): Promise<void> => {
  try {
    const userPlayRef = doc(firestore, "users", userId, "games", gameId, "plays", playId);
    const gamePlayRef = doc(firestore, "games", gameId, "plays", playId);

    const endTime = serverTimestamp();
    await Promise.all([
      updateDoc(userPlayRef, { endTime }),
      updateDoc(gamePlayRef, { endTime }),
    ]);
  } catch (e) {
    console.error("Error ending game play:", e);
  }
};