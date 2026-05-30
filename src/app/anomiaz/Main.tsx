"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import useSound from "@/app/hooks/useSound";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { useGamePlayTracking } from "../hooks/useGamePlayTracking";
import { shuffle } from "../global/Utils";
import BigButton from "../components/BigButton";
import Navbar from "../components/Navbar";
import Rules from "../components/Rules";
import rightSoundFile from "@/assets/right.mp3";
import bubblePopSoundFile from "@/assets/bubble-pop.mp3";
import bonusSoundFile from "@/assets/bonus.mp3";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

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

function generateDeck(categorySequence: string[], numCards: number, activeSymbols: string[], wildCount: number): Card[] {
  const categoryCount = numCards - wildCount;

  const deck: Card[] = [];

  for (let i = 0; i < categoryCount; i++) {
    const category = categorySequence[i];
    const symbol = activeSymbols[Math.floor(Math.random() * activeSymbols.length)];
    deck.push({ type: "category", category, symbol });
  }

  for (let i = 0; i < wildCount; i++) {
    const shuffledSymbols = shuffle([...activeSymbols]);
    const symbols: [string, string] = [shuffledSymbols[0], shuffledSymbols[1]];
    deck.push({ type: "wild", symbols });
  }

  return shuffle(deck);
}

function getBaseWordSize(word: string): number {
  const len = word.length;
  if (len <= 8)  return 24;
  if (len <= 13) return 20;
  if (len <= 18) return 16;
  return 12;
}

function SettingsSlider({ label, value, min, max, step, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-pink-400 font-mono font-bold">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-pink-500 cursor-pointer"
      />
    </div>
  );
}

export default function Main({ categories }: MainProps) {
  const [showRules, setShowRules] = useState(false);
  const playFaceOffSound = useSound(rightSoundFile);
  const playDealSound = useSound(bubblePopSoundFile);
  const playBonusSound = useSound(bonusSoundFile);

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

  useGamePlayTracking(GAME_PATH, gameState !== "setup", gameState === "results");

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
  const [categoryPool, setCategoryPool] = useLocalStorage<string[]>(
    `${GAME_PATH}.categoryPool`,
    []
  );

  const [faceOffCursor, setFaceOffCursor] = useState<number | null>(null);

  useEffect(() => {
    if (faceOff) setFaceOffCursor(faceOff.player1Index);
    else setFaceOffCursor(null);
  }, [faceOff?.player1Index, faceOff?.player2Index]);

  // Display settings
  const [showSettings, setShowSettings] = useState(false);
  const [symbolSize, setSymbolSize] = useLocalStorage<number>(`${GAME_PATH}.symbolSize`, 56);
  const [wordFontSize, setWordFontSize] = useLocalStorage<number>(`${GAME_PATH}.wordFontSize`, 100);
  const [cardWidth, setCardWidth] = useLocalStorage<number>(`${GAME_PATH}.cardWidth`, 134);
  const [cardHeight, setCardHeight] = useLocalStorage<number>(`${GAME_PATH}.cardHeight`, 188);
  const [cardGap, setCardGap] = useLocalStorage<number>(`${GAME_PATH}.cardGap`, 4);
  const [arcAngle, setArcAngle] = useLocalStorage<number>(`${GAME_PATH}.arcAngle`, 0);

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
    const isTwoPlayer = parsedNames.length === 2;
    const activeSymbols = isTwoPlayer ? SYMBOLS.slice(0, 4) : SYMBOLS;
    const wildCount = isTwoPlayer ? 0 : Math.floor(numCards * 0.08);
    const categoryCount = numCards - wildCount;

    // Build category sequence by draining the persistent pool, refilling when empty
    const sequence: string[] = [];
    let pool = categoryPool.length > 0 ? [...categoryPool] : shuffle([...categories]);
    while (sequence.length < categoryCount) {
      if (pool.length === 0) pool = shuffle([...categories]);
      sequence.push(pool.pop()!);
    }
    setCategoryPool(pool);

    const deck = generateDeck(sequence, numCards, activeSymbols, wildCount);
    const initialPlayers: Player[] = parsedNames.map((name) => ({
      name,
      cards: [],
      score: 0,
    }));
    setPlayers(initialPlayers);
    setRemainingCards(deck);
    setActiveWildCard(null);
    setCurrentPlayerIndex(Math.floor(Math.random() * parsedNames.length));
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "gameplay") return;
      if (faceOff) {
        const options = [faceOff.player1Index, faceOff.player2Index];
        if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
          e.preventDefault();
          setFaceOffCursor(prev =>
            options[1 - options.indexOf(prev ?? options[0])]
          );
        } else if (e.code === "Space" && faceOffCursor !== null) {
          e.preventDefault();
          playBonusSound();
          resolveFaceOff(faceOffCursor);
        }
      } else if (remainingCards.length > 0 && e.code === "Space") {
        e.preventDefault();
        dealCard();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, faceOff, faceOffCursor, remainingCards, dealCard, resolveFaceOff, playBonusSound]);

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

  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    Object.keys(localStorage).filter(k => k.startsWith(GAME_PATH + '.')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  const NAV_MENU = [
    {
      name: "New Game",
      icon: "/icons/new.svg",
      onClick: newGame,
    },
    {
      name: "Full screen",
      icon: "/icons/full-screen.svg",
      onClick: fullScreenHandle.enter,
    },
    {
      name: "Display",
      icon: "/icons/controller.svg",
      onClick: () => setShowSettings(true),
    },
    {
      name: "Rules",
      icon: "/icons/book.svg",
      onClick: () => setShowRules(true),
    },
    {
      name: "Clear cache",
      icon: "/icons/broom.svg",
      onClick: clearCache,
    },
  ];


  const renderPlayerCard = (
    player: Player,
    index: number,
    position: "top" | "bottom",
    arcIndex: number,
    arcTotal: number,
  ) => {
    const topCard = player.cards.length > 0 ? player.cards[player.cards.length - 1] : null;
    const inFaceOff = isInFaceOff(index);
    const isCurrentPlayer = index === currentPlayerIndex && !faceOff;

    const centerIdx = (arcTotal - 1) / 2;
    const offset = arcIndex - centerIdx;
    const maxAngleRad = centerIdx * arcAngle * Math.PI / 180;
    const cardAngleRad = Math.abs(offset) * arcAngle * Math.PI / 180;
    const yOffset = position === "top"
      ? 200 * (Math.cos(maxAngleRad) - Math.cos(cardAngleRad))
      : 200 * (Math.cos(cardAngleRad) - Math.cos(maxAngleRad));
    const rotationDeg = (position === "bottom" ? -offset : offset) * arcAngle;
    const arcTransform = arcAngle !== 0
      ? `translateY(${yOffset.toFixed(1)}px) rotate(${rotationDeg.toFixed(1)}deg)`
      : undefined;

    const nameEl = (
      <span
        className={`text-sm font-bold truncate max-w-[20vw] ${
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
        style={arcTransform ? { transform: arcTransform } : undefined}
        onClick={() => {
          if (inFaceOff && faceOff) {
            playBonusSound();
            resolveFaceOff(index);
          }
        }}
      >
        {position === "top" && nameEl}

        {topCard && topCard.type === "category" ? (
          <div
            className={`relative flex flex-col items-center justify-between rounded-xl border-2 bg-white p-2 ${
              inFaceOff
                ? "border-yellow-400 animate-[glow_0.8s_ease-in-out_infinite]"
                : isCurrentPlayer
                ? "border-pink-400"
                : "border-gray-300"
            }`}
            style={{ width: cardWidth, height: cardHeight }}
          >
            <span
              className="text-gray-700 font-bold text-center leading-tight w-full rotate-180"
              style={{ fontSize: getBaseWordSize(topCard.category ?? "") * wordFontSize / 100 }}
            >
              {topCard.category}
            </span>
            <span
              className="text-gray-700 font-bold text-center leading-tight w-full"
              style={{ fontSize: getBaseWordSize(topCard.category ?? "") * wordFontSize / 100 }}
            >
              {topCard.category}
            </span>
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold"
              style={{ fontSize: symbolSize, color: SYMBOL_COLORS[topCard.symbol || "@"] }}
            >
              {topCard.symbol}
            </span>
            {player.cards.length > 1 && (
              <span className="absolute -bottom-2 -right-2 bg-gray-700 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {player.cards.length}
              </span>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 ${
              inFaceOff
                ? "border-yellow-400 animate-[glow_0.8s_ease-in-out_infinite]"
                : isCurrentPlayer
                ? "border-pink-400 border-dashed"
                : "border-gray-600 border-dashed"
            }`}
            style={{ width: cardWidth, height: cardHeight }}
          >
            <span className="text-xs text-gray-500">No card</span>
          </div>
        )}

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
        iconHref={"/" + GAME_PATH}
      />
      <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
          <div className="relative w-72 sm:w-80 h-full bg-neutral-900 border-l border-gray-700 flex flex-col p-5 gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-lg">Display</span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <SettingsSlider label="Symbol size" value={symbolSize} min={20} max={100} step={1} unit="px" onChange={setSymbolSize} />
            <SettingsSlider label="Word scale" value={wordFontSize} min={50} max={200} step={5} unit="%" onChange={setWordFontSize} />
            <SettingsSlider label="Card width" value={cardWidth} min={50} max={250} step={4} unit="px" onChange={setCardWidth} />
            <SettingsSlider label="Card height" value={cardHeight} min={80} max={320} step={4} unit="px" onChange={setCardHeight} />
            <SettingsSlider label="Card gap" value={cardGap} min={0} max={120} step={4} unit="px" onChange={setCardGap} />
            <SettingsSlider label="Arc" value={arcAngle} min={0} max={45} step={0.5} unit="°" onChange={setArcAngle} />
            <button
              onClick={() => {
                setSymbolSize(56);
                setWordFontSize(100);
                setCardWidth(134);
                setCardHeight(188);
                setCardGap(4);
                setArcAngle(0);
              }}
              className="mt-2 w-full py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <FullScreen handle={fullScreenHandle}>
      <main className="flex flex-col min-h-screen items-center justify-center px-2">
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
                  {[50, 100, 200, 300, 400, 500].map((n) => (
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
                  disabled={parsedNames.length < 2}
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
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-5xl flex-1">

            {/* Wild card - floating on left, rotated 90deg CCW */}
            <div
              className="fixed z-30"
              style={{
                left: "-212px",
                top: "50%",
                transform: "translateY(-50%) rotate(-90deg)",
              }}
            >
              <div className="relative w-[160px] h-[58px] sm:h-[70px] mt-4">
                {activeWildCard?.symbols ? (
                  <div className="flex flex-row items-center justify-between rounded-xl border-2 border-gray-300 bg-white px-3 py-2 h-full gap-3">
                    <span
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: SYMBOL_COLORS[activeWildCard.symbols[0]] }}
                    >
                      {activeWildCard.symbols[0]}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700 font-bold leading-none text-center">
                      Wild Card
                    </span>
                    <span
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: SYMBOL_COLORS[activeWildCard.symbols[1]] }}
                    >
                      {activeWildCard.symbols[1]}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-600 px-4 h-full">
                    <span className="text-sm text-gray-500">No wild</span>
                  </div>
                )}

                {/* FACE-OFF at bottom of card (appears on the right after rotation) */}
                <div className="absolute top-full left-0 right-0 flex justify-center mt-1">
                  {faceOff && (
                    <span className="text-yellow-300 font-bold text-xs text-center whitespace-nowrap">
                      FACE-OFF! Tap the loser.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top row - upper half */}
            <div className="flex flex-row justify-center w-full" style={{ gap: cardGap }}>
              {topRowPlayers.map((player, i) =>
                renderPlayerCard(player, i, "top", i, topRowPlayers.length)
              )}
            </div>

            {/* Bottom row - lower half */}
            <div className="flex flex-row justify-center w-full" style={{ gap: cardGap }}>
              {bottomRowPlayers.map((player, i) =>
                renderPlayerCard(
                  player,
                  topRowCount + (bottomRowPlayers.length - 1 - i),
                  "bottom",
                  i,
                  bottomRowPlayers.length
                )
              )}
            </div>

            {/* Deal button - fixed to right edge */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
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
      </FullScreen>
    </>
  );
}
