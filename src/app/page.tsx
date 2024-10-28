import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HeroCard from "./components/HeroCard";

export default async function Home() {
  return (
    <>
      <Navbar title="Partyz" />
      <div className="px-8 container mx-auto grid w-full grid-cols-1 place-items-center gap-4 xl:grid-cols-2">
      <HeroCard
          title="Herd Party"
          playerCount="4-20 Players"
          duration="20–30 Min"
          age="Age: 10+"
          playPath="/herd-party"
          imagePath="/herd-party/herd-party.png"
          paragraphs={[
            "This is a party game for families, friends and cow rustlers. The aim of the game is simple: think like the herd and write down the same answers as your friends.",
            "If your answer is part of the majority, you all win cows. Yeehaw! If everyone else writes an answer that is matched by at least one other person, but yours is the odd one out, then you land the angry Pink Cow, and your herd of cows is worthless until you can offload it onto someone else.",
            "The first player to collect eight cows wins."
          ]}
        />
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
        <HeroCard
          title="Partikers"
          playerCount="4-16 Players"
          duration="30-60 Min"
          age="Age: 17+"
          playPath="/partikers"
          imagePath="/partikers/partikers.jpeg"
          paragraphs={[
            "Players take turns attempting to get their teammates to guess names by describing or imitating well-known people.",
            "In the first round, clue givers can say anything they want, except for the name itself. For the second round, clue givers can only say one word. And in the final round, clue givers can’t say anything at all: they can only use gestures and charades."
          ]}
        />
      </div>
      <Footer />
    </>
  );
}
