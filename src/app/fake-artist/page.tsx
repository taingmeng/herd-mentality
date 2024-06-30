//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import path from "path";
import csv from "csvtojson";
import { doc, onSnapshot } from "firebase/firestore";
import NextButton from "../components/NextButton";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import JustOneQuestion from "./JustOneQuestion";
import { firestore } from "../../firebase/firebase";
import JoinGameModal from "./JoinGameModal";

export const dynamic = "force-dynamic";

const shuffle = (array: any[]) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const NAV_MENU = [
  {
    name: "Rules",
    icon: "/book.svg",
    href: "/just-one/rules",
  },
];

export default function FakeArtist() {
  const [snapShot, setSnapshot] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const q = doc(firestore, "fake-artist", "12345");

    const unsuscribe = onSnapshot(q, (querySnapshot) => {
      setPlayers(Object.values(querySnapshot.data().players[0]));
    });
    return () => {
      unsuscribe();
    };
  }, []);

  return (
    <>
      <Navbar title="Fake Artist" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        {players.map((player, index) => (
          <div key={index}>
            {player.name} {player.clue}
          </div>
        ))}
        <div className="flex flex-row justify-around gap-4">
          <Button>Pass & Play</Button>
          <Button>Sync Devices</Button>
        </div>
        <div className="flex flex-row justify-around gap-4">
          <Button>Join Game</Button>
          <Button>New Game</Button>
        </div>

        {/* <JoinGameModal /> */}
      </main>
    </>
  );
}
