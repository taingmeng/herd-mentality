import type { Metadata } from "next";
import GameLanding from "../components/GameLanding";
import { games } from "../global/Data";

const gameData = games.find((g) => g.playPath === "/monikerz")!;

export const metadata: Metadata = {
  title: "Monikerz — Partyz",
  description: gameData.paragraphs.join(" "),
  keywords: [
    "monikers game",
    "charades party game",
    "one word charades",
    "acting party game",
    "teams party game",
    "free party game online",
  ],
  openGraph: {
    title: "Monikerz — Online Party Board Game | Partyz",
    description: gameData.paragraphs.join(" "),
    url: "https://partyz.vercel.app/monikerz",
    siteName: "Partyz",
    images: [{ url: gameData.imagePath, alt: "Monikerz game icon" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monikerz — Online Party Board Game | Partyz",
    description: gameData.paragraphs.join(" "),
    images: [gameData.imagePath],
  },
};

export default function Page() {
  return <GameLanding game={gameData} />;
}
