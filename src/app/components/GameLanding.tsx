import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroCard from "./HeroCard";
import GameButtons from "./GameButtons";
import GameRulesSection from "./GameRulesSection";

interface GameData {
  title: string;
  playerCount: string;
  duration: string;
  age: string;
  paragraphs: string[];
  playPath: string;
  imagePath: string;
  tags: string[];
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
        <GameButtons gamePath={gamePath} playPath={playPath} />
        <GameRulesSection gamePath={gamePath} gameName={game.title} />
      </main>
      <Footer />
    </>
  );
}
