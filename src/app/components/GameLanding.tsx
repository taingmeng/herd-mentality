import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroCard from "./HeroCard";
import GameButtons from "./GameButtons";
import GameRulesSection from "./GameRulesSection";
import GameplayImageModal from "./GameplayImageModal";
import PlayCount from "./PlayCount";
import MyPlayLogs from "./MyPlayLogs";

interface GameData {
  title: string;
  playerCount: string;
  duration: string;
  age: string;
  paragraphs: string[];
  playPath: string;
  imagePath: string;
  tags: string[];
  gameplayImagePath?: string;
  extraStats?: React.ReactNode;
}

export default function GameLanding({ game }: { game: GameData }) {
  const playPath = `${game.playPath}/play`;
  const gamePath = game.playPath.slice(1);

  return (
    <>
      <Navbar title={game.title} />
      <main className="pt-32 px-8 pb-16 container mx-auto min-h-screen">
        <HeroCard
          title={game.title}
          playerCount={game.playerCount}
          duration={game.duration}
          age={game.age}
          paragraphs={game.paragraphs}
          imagePath={game.imagePath}
          tags={game.tags}
          horizontal={true}
        />
        <div className="flex flex-row items-center gap-4 mt-2">
          <PlayCount gameId={gamePath} />
          <MyPlayLogs gameId={gamePath} />
          {game.extraStats}
        </div>
        <GameButtons gamePath={gamePath} playPath={playPath} />
        {game.gameplayImagePath && (
          <div className="mt-6 flex flex-col items-start">
            <h2 className="text-xl font-bold mb-3 self-start">Screenshot</h2>
            <GameplayImageModal
              src={game.gameplayImagePath}
              alt={`${game.title} gameplay`}
            />
          </div>
        )}

        <GameRulesSection gamePath={gamePath} gameName={game.title} />
      </main>
      <Footer />
    </>
  );
}
