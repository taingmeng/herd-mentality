"use client";

import { useState, useCallback, useMemo } from "react";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import useSound from "@/app/hooks/useSound";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { shuffle } from "../global/Utils";
import BigButton from "../components/BigButton";
import Navbar from "../components/Navbar";
import Rules from "../components/Rules";
import rightSoundFile from "@/assets/right.mp3";
import bubblePopSoundFile from "@/assets/bubble-pop.mp3";

interface MainProps {
  categories: string[];
}

interface Card {
  type: "category" | "wild";
  category?: string;
  symbol?: string;
  symbols?: [string, string];
}

interface Player {
  name: string;
  cards: Card[];
  score: number;
}

interface FaceOff {
  player1Index: number;
  player2Index: number;
  isWildCard: boolean;
}

type GameState = "setup" | "gameplay" | "results";

const SYMBOLS = ["@", "#", "$", "%", "&", "\u00A3", "\u00A5", "\u00A7"];
const SYMBOL_COLORS: Record<string, string> = {
  "@": "#ef4444",
  "#": "#3b82f6",
  $: "#22c55e",
  "%": "#a855f7",
  "&": "#f97316",
  "\u00A3": "#14b8a6",
  "\u00A5": "#eab308",
  "\u00A7": "#ec4899",
};

function generateDeck(categories: string[], numCards: number): Card[] {
  const wildCount = Math.floor(numCards * 0.08);
  const categoryCount = numCards - wildCount;

  const deck: Card[] = [];

  // Generate category cards
  for (let i = 0; i < categoryCount; i++) {
    const category = categories[i % categories.length];
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    deck.push({ type: "category", category, symbol });
  }

  // Generate wild cards
  for (let i = 0; i < wildCount; i++) {
    const shuffledSymbols = shuffle([...SYMBOLS]);
    const symbols: [string, string] = [shuffledSymbols[0], shuffledSymbols[1]];
    deck.push({ type: "wild", symbols });
  }

  return shuffle(deck);
}

export default function Main({ categories }: MainProps) {
  const [showRules, setShowRules] = useState(false);
  const playFaceOffSound = useSound(rightSoundFile);
  const playDealSound = useSound(bubblePopSoundFile);

  // Setup state
  const [topRowNames, setTopRowNames] = useLocalStorage<string>(
    `${GAME_PATH}.topRowNames`,
    ""
  );
  const [bottomRowNames, setBottomRowNames] = useLocalStorage<string>(
    `${GAME_PATH}.bottomRowNames`,
    ""
  );
  const [numCards, setNumCards] = useLocalStorage<number>(
    `${GAME_PATH}.numCards`,
    100
  );

  // Game state
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    "setup"
  );
  const [players, setPlayers] = useLocalStorage<Player[]>(
    `${GAME_PATH}.players`,
    []
  );
  const [remainingCards, setRemainingCards] = useLocalStorage<Card[]>(
    `${GAME_PATH}.remainingCards`,
    []
  );
  const [activeWildCard, setActiveWildCard] = useLocalStorage<Card | null>(
    `${GAME_PATH}.activeWildCard`,
    null
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useLocalStorage<number>(
    `${GAME_PATH}.currentPlayerIndex`,
    0
  );
  const [faceOff, setFaceOff] = useLocalStorage<FaceOff | null>(
    `${GAME_PATH}.faceOff`,
    null
  );

  const parsedTopNames = useMemo(
    () =>
      topRowNames
        .split(",")
        .map((name: string) => name.trim())
        .filter((name: string) => name.length > 0),
    [topRowNames]
  );

  const parsedBottomNames = useMemo(
    () =>
      bottomRowNames
        .split(",")
        .map((name: string) => name.trim())
        .filter((name: string) => name.length > 0),
    [bottomRowNames]
  );

  // Turn order: top L→R, then bottom R→L
  const parsedNames = useMemo(
    () => [...parsedTopNames, ...[...parsedBottomNames].reverse()],
    [parsedTopNames, parsedBottomNames]
  );

  const startGame = () => {
    const deck = generateDeck(categories, numCards);
    const initialPlayers: Player[] = parsedNames.map((name) => ({
      name,
      cards: [],
      score: 0,
    }));
    setPlayers(initialPlayers);
    setRemainingCards(deck);
    setActiveWildCard(null);
    setCurrentPlayerIndex(0);
    setFaceOff(null);
    setGameState("gameplay");
  };

  const checkForFaceOff = useCallback(
    (
      updatedPlayers: Player[],
      currentWild: Card | null
    ): FaceOff | null => {
      // Check direct symbol matches between top cards
      const topCards = updatedPlayers.map((p) =>
        p.cards.length > 0 ? p.cards[p.cards.length - 1] : null
      );

      // Direct match: two players have same symbol on their top category card
      for (let i = 0; i < topCards.length; i++) {
        const cardI = topCards[i];
        if (!cardI || cardI.type !== "category") continue;
        for (let j = i + 1; j < topCards.length; j++) {
          const cardJ = topCards[j];
          if (!cardJ || cardJ.type !== "category") continue;
          if (cardI.symbol === cardJ.symbol) {
            return { player1Index: i, player2Index: j, isWildCard: false };
          }
        }
      }

      // Wild match: activeWildCard has symbols [A, B], one player has A on top, another has B
      if (currentWild && currentWild.symbols) {
        const [symA, symB] = currentWild.symbols;
        let playerWithA = -1;
        let playerWithB = -1;

        for (let i = 0; i < topCards.length; i++) {
          const card = topCards[i];
          if (!card || card.type !== "category") continue;
          if (card.symbol === symA && playerWithA === -1) playerWithA = i;
          if (card.symbol === symB && playerWithB === -1) playerWithB = i;
        }

        if (playerWithA !== -1 && playerWithB !== -1 && playerWithA !== playerWithB) {
          return {
            player1Index: playerWithA,
            player2Index: playerWithB,
            isWildCard: true,
          };
        }
      }

      return null;
    },
    []
  );

  const dealCard = () => {
    if (remainingCards.length === 0) return;

    const newRemaining = [...remainingCards];
    const card = newRemaining.pop()!;
    setRemainingCards(newRemaining);
    playDealSound();

    let updatedPlayers = [...players];
    let updatedWild = activeWildCard;

    if (card.type === "wild") {
      updatedWild = card;
      setActiveWildCard(card);
    } else {
      updatedPlayers = updatedPlayers.map((p, i) =>
        i === currentPlayerIndex ? { ...p, cards: [...p.cards, card] } : p
      );
      setPlayers(updatedPlayers);
    }

    // Check for face-off
    const detectedFaceOff = checkForFaceOff(updatedPlayers, updatedWild);
    if (detectedFaceOff) {
      setFaceOff(detectedFaceOff);
      playFaceOffSound();
    } else if (card.type === "wild") {
      // Wild card dealt to center — same player gets next turn
      if (newRemaining.length === 0) {
        setGameState("results");
      }
    } else {
      // Advance to next player
      const nextIndex = (currentPlayerIndex + 1) % updatedPlayers.length;
      setCurrentPlayerIndex(nextIndex);

      // Check if game is over
      if (newRemaining.length === 0) {
        setGameState("results");
      }
    }
  };

  const resolveFaceOff = (loserIndex: number) => {
    if (!faceOff) return;

    const winnerIndex =
      loserIndex === faceOff.player1Index
        ? faceOff.player2Index
        : faceOff.player1Index;

    const updatedPlayers = [...players];

    // Remove loser's top card
    const loserCards = [...updatedPlayers[loserIndex].cards];
    loserCards.pop();
    updatedPlayers[loserIndex] = {
      ...updatedPlayers[loserIndex],
      cards: loserCards,
    };

    // Give winner +1 score
    updatedPlayers[winnerIndex] = {
      ...updatedPlayers[winnerIndex],
      score: updatedPlayers[winnerIndex].score + 1,
    };

    setPlayers(updatedPlayers);
    setFaceOff(null);

    // Check for cascade
    const cascadeFaceOff = checkForFaceOff(updatedPlayers, activeWildCard);
    if (cascadeFaceOff) {
      setFaceOff(cascadeFaceOff);
      playFaceOffSound();
    } else {
      // Advance to next player, skipping the loser
      let nextIndex = (currentPlayerIndex + 1) % updatedPlayers.length;
      if (nextIndex === loserIndex) {
        nextIndex = (nextIndex + 1) % updatedPlayers.length;
      }
      setCurrentPlayerIndex(nextIndex);

      // Check if game is over
      if (remainingCards.length === 0) {
        setGameState("results");
      }
    }
  };

  const newGame = () => {
    setGameState("setup");
    setPlayers([]);
    setRemainingCards([]);
    setActiveWildCard(null);
    setCurrentPlayerIndex(0);
    setFaceOff(null);
  };

  const isInFaceOff = (playerIndex: number): boolean => {
    if (!faceOff) return false;
    return (
      playerIndex === faceOff.player1Index ||
      playerIndex === faceOff.player2Index
    );
  };

  const sortedResults = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  const topRowCount = parsedTopNames.length;
  const topRowPlayers = players.slice(0, topRowCount);
  // Bottom row: stored in deal order (R→L), reverse for display (L→R)
  const bottomRowPlayers = [...players.slice(topRowCount)].reverse();

  const NAV_MENU = [
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: () => setShowRules(true),
    },
    ...(gameState === "gameplay"
      ? [
          {
            name: "New Game",
            icon: "/arrow-circle-left.svg",
            onClick: () => newGame(),
          },
        ]
      : []),
  ];

  const maxPerRow = Math.max(topRowCount, bottomRowPlayers.length);
  // Width: fill horizontal space (subtract deal button ~60px, padding, gaps)
  const cardWidth = `calc((100vw - 6rem) / ${maxPerRow} - 0.75rem)`;
  // Height constraint: two rows + wild card + names must fit viewport
  const cardMaxHeight = `calc((100vh - 14rem) / 2)`;
  const cardMaxWidth = `min(220px, calc(${cardMaxHeight} * 5 / 7))`;

  const renderPlayerCard = (
    player: Player,
    index: number,
    position: "top" | "bottom"
  ) => {
    const topCard =
      player.cards.length > 0 ? player.cards[player.cards.length - 1] : null;
    const inFaceOff = isInFaceOff(index);
    const isCurrentPlayer = index === currentPlayerIndex && !faceOff;

    const nameEl = (
      <span
        className={`text-sm sm:text-base font-bold truncate max-w-[20vw] ${
          isCurrentPlayer ? "text-pink-400" : "text-white"
        }`}
      >
        {player.name} ({player.score})
      </span>
    );

    return (
      <div
        key={player.name}
        className="flex flex-col items-center gap-1 cursor-pointer"
        onClick={() => {
          if (inFaceOff && faceOff) {
            resolveFaceOff(index);
          }
        }}
      >
        {/* Player name above card for top row */}
        {position === "top" && nameEl}

        {/* Card */}
        {topCard && topCard.type === "category" ? (
          <div
            style={{ width: cardWidth, maxWidth: cardMaxWidth }}
            className={`relative flex flex-col items-center justify-between rounded-xl border-2 bg-white p-2 sm:p-3 aspect-[5/7] ${
              inFaceOff
                ? "border-yellow-400 animate-[glow_0.8s_ease-in-out_infinite]"
                : isCurrentPlayer
                ? "border-pink-400"
                : "border-gray-300"
            }`}
          >
            {/* Category at top (upside down) */}
            <span className="text-xl sm:text-2xl text-gray-700 font-bold text-center leading-tight w-full rotate-180">
              {topCard.category}
            </span>

            {/* Symbol in center */}
            <span
              className="text-6xl sm:text-8xl font-bold"
              style={{ color: SYMBOL_COLORS[topCard.symbol || "@"] }}
            >
              {topCard.symbol}
            </span>

            {/* Category at bottom (right-side up) */}
            <span className="text-xl sm:text-2xl text-gray-700 font-bold text-center leading-tight w-full">
              {topCard.category}
            </span>

            {/* Card count badge */}
            {player.cards.length > 1 && (
              <span className="absolute -bottom-2 -right-2 bg-gray-700 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {player.cards.length}
              </span>
            )}
          </div>
        ) : (
          <div
            style={{ width: cardWidth, maxWidth: cardMaxWidth }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 aspect-[5/7] ${
              inFaceOff
                ? "border-yellow-400 animate-[glow_0.8s_ease-in-out_infinite]"
                : isCurrentPlayer
                ? "border-pink-400 border-dashed"
                : "border-gray-600 border-dashed"
            }`}
          >
            <span className="text-xs text-gray-500">No card</span>
          </div>
        )}

        {/* Player name below card for bottom row */}
        {position === "bottom" && nameEl}
      </div>
    );
  };

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
      <main className="flex flex-col min-h-[75vh] items-center justify-center px-2 pt-20">
        {/* SETUP */}
        {gameState === "setup" && (
          <>
            <div className="flex flex-col gap-4 w-full max-w-lg">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Top row (comma separated):
                </label>
                <input
                  type="text"
                  className="w-full p-3 text-center border rounded-lg font-bold text-lg bg-transparent border-pink-600 text-white placeholder-gray-500"
                  placeholder="Alice, Bob, Charlie"
                  onChange={(e) => setTopRowNames(e.target.value)}
                  value={topRowNames}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Bottom row (comma separated):
                </label>
                <input
                  type="text"
                  className="w-full p-3 text-center border rounded-lg font-bold text-lg bg-transparent border-pink-600 text-white placeholder-gray-500"
                  placeholder="Dave, Eve, Frank"
                  onChange={(e) => setBottomRowNames(e.target.value)}
                  value={bottomRowNames}
                />
              </div>

              <label className="block text-center text-sm text-gray-400">
                Players: {parsedNames.length}
              </label>

              <div className="flex items-center justify-center gap-4">
                <label className="text-gray-400">Cards:</label>
                <select
                  className="bg-transparent border border-pink-600 rounded-lg px-3 py-2 text-white text-lg"
                  value={numCards}
                  onChange={(e) => setNumCards(Number(e.target.value))}
                >
                  {[100, 200, 300, 400, 500].map((n) => (
                    <option key={n} value={n} className="bg-neutral-800">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton
                  disabled={parsedNames.length < 3}
                  onClick={startGame}
                >
                  Start Game
                </BigButton>
              </div>
            </div>
          </>
        )}

        {/* GAMEPLAY */}
        {gameState === "gameplay" && (
          <div className="flex flex-row items-center w-full max-w-5xl">
            {/* Cards area */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1">

            {/* Top row of players */}
            <div className="flex flex-row gap-1 sm:gap-2 justify-center w-full">
              {topRowPlayers.map((player, i) =>
                renderPlayerCard(player, i, "top")
              )}
            </div>

            {/* Center: Face-off warning (upside down) + wild card + face-off warning */}
            <div className="flex flex-col items-center gap-1">
              {/* Face-off indicator above wild card (upside down, always reserves space) */}
              <div className="h-6 flex items-center justify-center">
                {faceOff && (
                  <span className="text-yellow-300 font-bold text-xs sm:text-sm rotate-180">
                    FACE-OFF! Tap the loser.
                  </span>
                )}
              </div>

              {activeWildCard && activeWildCard.symbols ? (
                <div
                  className="flex flex-row items-center justify-between rounded-xl border-2 border-gray-300 bg-white px-4 py-2 h-[72px] sm:h-[88px] gap-4"
                >
                  {/* First symbol */}
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: SYMBOL_COLORS[activeWildCard.symbols[0]] }}
                  >
                    {activeWildCard.symbols[0]}
                  </span>

                  {/* Wild Card text */}
                  <div className="flex flex-col items-center">
                    <span className="text-sm sm:text-base text-gray-700 font-bold leading-none">
                      Wild Card
                    </span>
                  </div>

                  {/* Second symbol */}
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: SYMBOL_COLORS[activeWildCard.symbols[1]] }}
                  >
                    {activeWildCard.symbols[1]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-600 px-6 h-[72px] sm:h-[88px]">
                  <span className="text-sm text-gray-500">No wild card</span>
                </div>
              )}

              {/* Face-off indicator below wild card (always reserves space) */}
              <div className="h-6 flex items-center justify-center">
                {faceOff && (
                  <span className="text-yellow-300 font-bold text-xs sm:text-sm">
                    FACE-OFF! Tap the loser.
                  </span>
                )}
              </div>
            </div>

            {/* Bottom row of players */}
            <div className="flex flex-row gap-1 sm:gap-2 justify-center w-full">
              {bottomRowPlayers.map((player, i) =>
                renderPlayerCard(
                  player,
                  topRowCount + (bottomRowPlayers.length - 1 - i),
                  "bottom"
                )
              )}
            </div>

            </div>

            {/* Deal button - right side, vertical, centered */}
            <div className="flex flex-col items-center justify-center gap-3 pl-2 sm:pl-4">
              <span className="text-[10px] sm:text-xs text-gray-400 text-center">
                {remainingCards.length} left
              </span>
              <button
                disabled={!!faceOff || remainingCards.length === 0}
                onClick={dealCard}
                className="bg-pink-600 hover:bg-pink-500 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-3 py-3 sm:px-4 sm:py-4 rounded-xl transition-colors [writing-mode:vertical-rl]"
              >
                Deal → {players[currentPlayerIndex]?.name}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {gameState === "results" && (
          <div className="flex flex-col items-center gap-6 w-full mt-4">
            <h2 className="text-3xl font-bold">Final Scores</h2>

            <div className="w-full max-w-md flex flex-col gap-3">
              {sortedResults.map((player, index) => (
                <div
                  key={player.name}
                  className={`flex flex-row items-center justify-between rounded-lg p-4 ${
                    index === 0
                      ? "border-2 border-pink-400 bg-pink-950"
                      : "border border-pink-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold text-lg">
                      #{index + 1}
                    </span>
                    <span className="text-white font-bold text-xl">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-pink-400 font-bold text-2xl">
                    {player.score} pts
                  </span>
                </div>
              ))}
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton onClick={newGame}>Play Again</BigButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
