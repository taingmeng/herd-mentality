"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

const btnBase =
  "font-bold py-4 px-8 rounded-lg border transition-colors cursor-pointer text-center text-white outline-none select-none";

interface Props {
  gamePath: string;
  playPath: string;
}

export default function GameButtons({ gamePath, playPath }: Props) {
  const [hasData, setHasData] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasData(
      Object.keys(localStorage).some((k) => k.startsWith(`${gamePath}.`))
    );
  }, [gamePath]);

  const clearData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${gamePath}.`))
      .forEach((k) => localStorage.removeItem(k));
    setHasData(false);
  };

  const handleNewGame = () => {
    if (hasData) {
      setShowConfirm(true);
    } else {
      clearData();
      router.push(playPath);
    }
  };

  const confirmNewGame = () => {
    setShowConfirm(false);
    clearData();
    router.push(playPath);
  };

  return (
    <>
      <Modal
        visible={showConfirm}
        title="Start New Game?"
        confirmButtonText="New Game"
        declineButtonText="Cancel"
        onConfirm={confirmNewGame}
        onDecline={() => setShowConfirm(false)}
        onClose={() => setShowConfirm(false)}
      >
        Existing game will be cleared. Are you sure you want to start a new game?
      </Modal>

      <div className="flex flex-wrap gap-3 mt-4">
        {hasData && (
          <button
            onClick={() => router.push(playPath)}
            className={`${btnBase} bg-pink-700 border-transparent active:border-pink-500 active:bg-pink-500`}
          >
            Resume
          </button>
        )}
        <button
          onClick={handleNewGame}
          className={`${btnBase} bg-neutral-800 border-pink-200 active:border-pink-400 active:bg-pink-800/30`}
        >
          New Game
        </button>
      </div>
    </>
  );
}
