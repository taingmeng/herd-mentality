import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroCard from "./components/HeroCard";
import { games } from "./global/Data";

export default async function Home() {
  return (
    <>
      <Navbar title="Partyz" />
      <div className="pt-32 px-8 container mx-auto grid w-full grid-cols-1 place-items-center gap-4 xl:grid-cols-2">
        {games.map((game) => (
          <HeroCard
            key={game.title}
            title={game.title}
            playerCount={game.playerCount}
            duration={game.duration}
            age={game.age}
            playPath={game.playPath}
            imagePath={game.imagePath}
            paragraphs={game.paragraphs}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
