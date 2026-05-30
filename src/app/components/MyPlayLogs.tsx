"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, getDoc, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import { useAuth } from "@/firebase/AuthContext";
import Modal from "./Modal";
import Image from "next/image";

interface PlayLog {
  id: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
}

function formatDateTime(ts: Timestamp): string {
  return ts.toDate().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(start: Timestamp, end: Timestamp): string {
  const seconds = Math.round((end.toDate().getTime() - start.toDate().getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

export default function MyPlayLogs({ gameId }: { gameId: string }) {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<PlayLog[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(firestore, "users", user.uid, "games", gameId))
      .then((snap) => setCount(snap.exists() ? (snap.data().playCount ?? 0) : 0))
      .catch(() => {});
  }, [user, gameId]);

  const openModal = async () => {
    setOpen(true);
    if (logs !== null || !user) return;
    try {
      const q = query(
        collection(firestore, "users", user.uid, "games", gameId, "plays"),
        orderBy("startedAt", "desc"),
        limit(30)
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlayLog)));
    } catch (e) {
      console.error("Failed to load play logs:", e);
      setLogs([]);
    }
  };

  if (!user || count === null) return null;

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 transition-colors cursor-pointer"
      >
        <Image src="/icons/player-with-joystick.svg" width={16} height={16} alt="My plays" className="tint-grey" />
        <span>{count.toLocaleString()} {count === 1 ? "play" : "plays"}</span>
      </button>

      <Modal visible={open} onClose={() => setOpen(false)} title="My Play Logs">
        {logs === null ? (
          <p className="text-gray-400 text-center py-4">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No plays yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-600">
            {logs.map((log, i) => (
              <li key={log.id} className="py-3 flex flex-col gap-0.5">
                <span className="text-white text-sm font-medium">Play #{logs.length - i}</span>
                <span className="text-gray-400 text-sm">Started: {formatDateTime(log.startedAt)}</span>
                {log.endedAt ? (
                  <>
                    <span className="text-gray-400 text-sm">Ended: {formatDateTime(log.endedAt)}</span>
                    <span className="text-pink-400 text-sm">Duration: {formatDuration(log.startedAt, log.endedAt)}</span>
                  </>
                ) : (
                  <span className="text-yellow-500 text-sm">Incomplete</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
