import type { Metadata } from "next";
import GameLanding from "../components/GameLanding";
import { games } from "../global/Data";
import { GAME_PATH, GAME_NAME } from "./Constants";

const gameData = games.find((g) => g.playPath === `/${GAME_PATH}`)!;

export const metadata: Metadata = {
  title: `${GAME_NAME} — Partyz`,
  description: gameData.paragraphs.join(" "),
  keywords: [
    "herd mentality game",
    "think like the herd",
    "party game",
    "group party game",
    "family party game",
    "cow game",
    "free party game online",
  ],
  openGraph: {
    title: `${GAME_NAME} — Online Party Board Game | Partyz`,
    description: gameData.paragraphs.join(" "),
    url: `https://partyz.vercel.app/${GAME_PATH}`,
    siteName: "Partyz",
    images: [{ url: gameData.imagePath, alt: `${GAME_NAME} game icon` }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${GAME_NAME} — Online Party Board Game | Partyz`,
    description: gameData.paragraphs.join(" "),
    images: [gameData.imagePath],
  },
};

export default function Page() {
  return <GameLanding game={gameData} />;
}
