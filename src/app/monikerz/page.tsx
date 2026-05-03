import type { Metadata } from "next";
import GameLanding from "../components/GameLanding";
import { games } from "../global/Data";

const gameData = games.find((g) => g.playPath === "/monikerz")!;

export const metadata: Metadata = {
  title: "Monikerz — Partyz",
  description: gameData.paragraphs.join(" "),
};

export default function Page() {
  return <GameLanding game={gameData} />;
}
