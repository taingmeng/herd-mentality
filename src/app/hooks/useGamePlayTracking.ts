"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/firebase/AuthContext";
import { startGamePlay, endGamePlay } from "@/firebase/firebaseService";

export function useGamePlayTracking(gameId: string, hasStarted: boolean, isOver: boolean) {
  const { user } = useAuth();
  const playIdRef = useRef<string | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    if (hasStarted && !trackedRef.current) {
      trackedRef.current = true;
      startGamePlay(user.uid, gameId).then((id) => {
        playIdRef.current = id;
      });
    }

    if (!hasStarted) {
      trackedRef.current = false;
      playIdRef.current = null;
    }
  }, [hasStarted, user, gameId]);

  useEffect(() => {
    if (!user || !isOver || !playIdRef.current) return;

    const playId = playIdRef.current;
    playIdRef.current = null;
    trackedRef.current = false;
    endGamePlay(user.uid, gameId, playId);
  }, [isOver, user, gameId]);
}
