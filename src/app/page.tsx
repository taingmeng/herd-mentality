import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HeroCard from "./components/HeroCard";

export default async function Home() {
  return (
    <>
      <Navbar title="Partyz" />
      <Hero />
      <div className="px-8 container mx-auto grid w-full grid-cols-1 place-items-center gap-4 xl:grid-cols-2">
        <HeroCard
          title="Just Word"
          playerCount="3–7 Players"
          duration="20–60 Min"
          age="Age: 8+"
          playPath="/just-word"
          imagePath="/just-word/just-word.png"
          paragraphs={[
            "Just Word is a cooperative party game in which you play together to discover as many mystery words as possible. Find the best clue to help your teammate. Be unique, as all identical clues will be cancelled!",
            "You have the choice – make the difference!",
          ]}
        />
        <HeroCard
          title="A Fake Artist Goes to Party"
          playerCount="5–10 Players"
          duration="20 Min"
          age="Age: 8+"
          playPath="/fake-artist/local"
          imagePath="/fake-artist/fake-artist.png"
          paragraphs={[
            "While the other players are given a category and its associated secret word, one player will have only a category and ??? written on their card. That person is the fake artist",
            "Each player take turn to draw only 2 strokes. The fake artist tries to blend in and guess the secret word.",
          ]}
        />
        <HeroCard
          title="Party for Neanderthals"
          playerCount="2-12 Players"
          duration="15 Min"
          age="Age: 8+"
          playPath="/poetry"
          imagePath="/poetry/poetry.png"
          paragraphs={[
            "Party for Neanderthals is a competitive word-guessing game where you can only give clues by speaking in single syllables.",
            "So, instead of saying broccoli, you'd say something like green thing you eat for live long and have good health.",
          ]}
        />
      </div>
      <Footer />
    </>
  );
}
