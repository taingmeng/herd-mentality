"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import Image from "next/image";

export default function PlayCount({ gameId }: { gameId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getDoc(doc(firestore, "games", gameId))
      .then((snap) => setCount(snap.exists() ? (snap.data().playCount ?? 0) : 0))
      .catch(() => {});
  }, [gameId]);

  if (count === null) return null;

  return (
    <div className="flex flex-row items-center gap-1 text-gray-500 text-sm">
      <Image src="/icons/global.svg" width={16} height={16} alt="Total plays" className="tint-grey" />
      <span>{count.toLocaleString()} {count === 1 ? "play" : "plays"}</span>
    </div>
  );
}
