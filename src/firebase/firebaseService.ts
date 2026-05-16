import { firestore } from "./firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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

export const endGamePlay = async (userId: string, gameId: string, playId: string): Promise<void> => {
  try {
    const userPlayRef = doc(firestore, "users", userId, "games", gameId, "plays", playId);
    await updateDoc(userPlayRef, { endedAt: serverTimestamp() });
  } catch (e) {
    console.error("Error ending game play:", e);
  }
};