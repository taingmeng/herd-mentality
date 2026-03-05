"use client";

import { ChangeEvent, useState } from "react";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { MainProps } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { shuffle } from "../global/Utils";
import BigButton from "../components/BigButton";
import Navbar from "../components/Navbar";
import Rules from "../components/Rules";

export default function Main({ questions }: MainProps) {
  const [showRules, setShowRules] = useState(false);

  const [playerNames, setPlayerNames] = useLocalStorage<string>(
    `${GAME_PATH}.playerNames`,
    ""
  );
  const [players, setPlayers] = useLocalStorage<string[]>(
    `${GAME_PATH}.players`,
    []
  );
  const [gameState, setGameState] = useLocalStorage(
    `${GAME_PATH}.gameState`,
    "new"
  );
  const [passIndex, setPassIndex] = useLocalStorage(
    `${GAME_PATH}.passIndex`,
    0
  );
  const [chameleonIndex, setChameleonIndex] = useLocalStorage<number>(
    `${GAME_PATH}.chameleonIndex`,
    -1
  );
  const [secretWordIndex, setSecretWordIndex] = useLocalStorage<number>(
    `${GAME_PATH}.secretWordIndex`,
    -1
  );
  const [gridWords, setGridWords] = useLocalStorage<string[]>(
    `${GAME_PATH}.gridWords`,
    []
  );
  const [gridCategory, setGridCategory] = useLocalStorage<string>(
    `${GAME_PATH}.gridCategory`,
    ""
  );
  const [revealedChameleon, setRevealedChameleon] = useLocalStorage(
    `${GAME_PATH}.revealedChameleon`,
    false
  );
  const [revealedWord, setRevealedWord] = useLocalStorage(
    `${GAME_PATH}.revealedWord`,
    false
  );
  const [flipped, setFlipped] = useLocalStorage(
    `${GAME_PATH}.flipped`,
    false
  );

  const playerCount = players.length;
  const isLastPassIndex = passIndex === playerCount - 1;
  const isChameleon = passIndex === chameleonIndex;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setPlayerNames(value);
    setPlayers(
      value
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length)
    );
  };

  const startGame = () => {
    // Group questions by category
    const categoryMap: Record<string, string[]> = {};
    for (const q of questions) {
      if (!categoryMap[q.category]) {
        categoryMap[q.category] = [];
      }
      categoryMap[q.category].push(q.word);
    }

    // Filter to categories with at least 16 words
    const validCategories = Object.entries(categoryMap).filter(
      ([, words]) => words.length >= 16
    );

    // Pick a random category
    const randomCatIndex = Math.floor(Math.random() * validCategories.length);
    const [category, words] = validCategories[randomCatIndex];

    // Shuffle and pick 16 random words for the grid
    const shuffledWords = shuffle([...words]).slice(0, 16);

    // Pick a random secret word index (0-15) and chameleon player
    const secretIdx = Math.floor(Math.random() * 16);
    const chameleonIdx = Math.floor(Math.random() * playerCount);

    setPlayers(shuffle([...players]));
    setGridCategory(category);
    setGridWords(shuffledWords);
    setSecretWordIndex(secretIdx);
    setChameleonIndex(chameleonIdx);
    setPassIndex(0);
    setFlipped(false);
    setGameState("passing");
  };

  const passNext = () => {
    if (isLastPassIndex) {
      setGameState("playing");
    } else {
      setPassIndex(passIndex + 1);
    }
    setFlipped(false);
  };

  const passPrevious = () => {
    if (passIndex === 0) {
      setGameState("new");
    } else {
      setPassIndex(passIndex - 1);
    }
    setFlipped(false);
  };

  const newGame = () => {
    setGameState("new");
    setPassIndex(0);
    setRevealedChameleon(false);
    setRevealedWord(false);
    setFlipped(false);
  };

  const revealChameleon = () => {
    setRevealedChameleon(true);
  };

  const revealTheWord = () => {
    setRevealedWord(true);
  };


  const renderGrid = (highlight: boolean) => (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto">
      {gridWords.map((word, index) => {
        const isSecret = index === secretWordIndex;
        const showHighlight = highlight && isSecret;
        return (
          <div
            key={index}
            className={`border border-pink-600 rounded-lg p-2 text-center text-lg font-semibold flex items-center justify-center min-h-[3.5rem] ${
              showHighlight
                ? "bg-pink-700 text-white"
                : "bg-transparent text-white"
            }`}
          >
            {word}
          </div>
        );
      })}
    </div>
  );

  const NAV_MENU = [
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
  ];

  return (
    <>
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
      />
      <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <main className="flex flex-col min-h-[75vh] items-center justify-center px-4">
        {gameState === "new" && (
          <>
            <h3 className="mb-3 font-semibold text-center">
              Enter player names:
            </h3>
            <textarea
              className="min-w-[75vw] min-h-[50vh] lg:min-h-[25vh] resize p-4 text-center border rounded-lg font-bold text-3xl bg-transparent border-pink-600 placeholder-grey-400 placeholder-opacity-10 text-white"
              placeholder="Example: Alice, Bob, Charlie"
              onChange={handleChange}
              value={playerNames}
            />
            <label className="block mt-2">Player count: {playerCount}</label>
            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton disabled={playerCount < 3} onClick={startGame}>
                  Start Game
                </BigButton>
              </div>
            </div>
          </>
        )}

        {gameState === "passing" && (
          <>
            <div className="flex flex-col justify-between items-center gap-4 w-full">
              {/* Player indicator */}
              <div className="flex flex-row flex-wrap gap-2 justify-center">
                {players.map((name, index) => {
                  const isActive = index === passIndex;
                  return (
                    <span
                      className={isActive ? "font-bold" : "text-gray-500"}
                      key={index}
                    >
                      {name}
                      {index < playerCount - 1 ? " → " : ""}
                    </span>
                  );
                })}
              </div>

              {/* Tap to reveal / Grid */}
              {!flipped ? (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer border-2 border-pink-600 rounded-xl p-8 min-h-[300px] w-full max-w-md"
                  onClick={() => setFlipped(true)}
                >
                  <h2 className="text-white text-2xl font-bold">
                    {players[passIndex]}
                  </h2>
                  <label className="text-gray-400 mt-2">(Tap to reveal)</label>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                  <h2 className="text-2xl font-bold">{gridCategory}</h2>
                  {isChameleon ? (
                    <>
                      {renderGrid(false)}
                      <label className="text-pink-400 font-bold mt-2">
                        (You are the Chameleon!)
                      </label>
                    </>
                  ) : (
                    renderGrid(true)
                  )}
                </div>
              )}

              {/* Pass instructions */}
              <div className="text-center">
                {!isLastPassIndex && (
                  <label className="block text-gray-500">
                    Press Next. Pass to the next player.
                    <br />
                    <span className="text-white font-bold">
                      {players[passIndex + 1]}
                    </span>
                  </label>
                )}
                {isLastPassIndex && (
                  <label className="block text-gray-500">
                    Press Next when ready.
                    <br />
                    <span className="text-white font-bold">Ready?</span>
                  </label>
                )}
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton onClick={passPrevious}>Previous</BigButton>
                  <BigButton onClick={passNext}>Next</BigButton>
                </div>
              </div>
            </div>
          </>
        )}

        {gameState === "playing" && (
          <>
            <div className="flex flex-col items-center gap-4 w-full mt-12">
              <h2 className="text-2xl font-bold">{gridCategory}</h2>
              <label className="text-gray-400">{players[0]} goes first</label>
              {renderGrid(revealedWord)}

              {revealedChameleon && (
                <div className="text-center mt-4">
                  <h3 className="text-pink-400 font-bold text-lg">
                    The Chameleon is {players[chameleonIndex]}!
                  </h3>
                </div>
              )}
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                {!revealedChameleon && (
                  <BigButton onClick={revealChameleon}>
                    Reveal Chameleon
                  </BigButton>
                )}
                {revealedChameleon && !revealedWord && (
                  <BigButton onClick={revealTheWord}>Reveal Word</BigButton>
                )}
                {revealedChameleon && revealedWord && (
                  <BigButton onClick={newGame}>New Game</BigButton>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
