"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GAME_PATH } from "./Constants";

export default function HighScore() {
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`${GAME_PATH}.highScore`);
    if (stored !== null) setHighScore(JSON.parse(stored));
  }, []);

  if (highScore === null) return null;

  return (
    <div className="flex items-center gap-1 text-gray-500 text-sm">
      <Image src="/icons/crown.svg" width={16} height={16} alt="High score" className="tint-grey" />
      <span>Best: {highScore}</span>
    </div>
  );
}
