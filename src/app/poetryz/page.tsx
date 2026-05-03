import type { Metadata } from "next";
import GameLanding from "../components/GameLanding";
import { games } from "../global/Data";
import { GAME_PATH, GAME_NAME } from "./Constants";

const gameData = games.find((g) => g.playPath === `/${GAME_PATH}`)!;

export const metadata: Metadata = {
  title: `${GAME_NAME} — Partyz`,
  description: gameData.paragraphs.join(" "),
};

export default function Page() {
  return <GameLanding game={gameData} />;
}
