"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import BigButton from "../components/BigButton";
import Rules from "../components/Rules";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { useGamePlayTracking } from "../hooks/useGamePlayTracking";
import { shuffle } from "../global/Utils";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

interface CloverCardData {
  words: [string, string, string, string]; // top, right, bottom, left
}

interface PlacedCard extends CloverCardData {
  rotation: number; // 0, 90, 180, 270
}

type Phase = "setup" | "playing" | "shuffled";

const ROTATIONS = [0, 90, 180, 270];

// Returns which word indices to highlight based on grid position and card rotation.
// Physical outer edges: top if row=0, right if col=1, bottom if row=1, left if col=0.
// Rotation maps physical edges back to word indices: index = (edgeIdx - rotSteps + 4) % 4
function getHighlightedWordIndices(row: number, col: number, rotation: number): number[] {
  const outerEdges: number[] = [];
  if (row === 0) outerEdges.push(0); // top
  if (col === 1) outerEdges.push(1); // right
  if (row === 1) outerEdges.push(2); // bottom
  if (col === 0) outerEdges.push(3); // left

  const rotSteps = rotation / 90;
  return outerEdges.map((e) => ((e - rotSteps) % 4 + 4) % 4);
}

// Renders text inside a container, shrinking the font size until the text fits.
// useLayoutEffect adjusts the DOM before paint so there is no visible flash.
function FitText({
  text,
  vertical = false,
  color,
  shadow,
}: {
  text: string;
  vertical?: boolean;
  color: string;
  shadow: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(64);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    // Derive max from the container's constraining dimension so it scales with
    // card size (screen density / resolution) rather than using a fixed cap.
    const constrainingDim = vertical ? container.clientWidth : container.clientHeight;
    let size = Math.max(Math.round(constrainingDim * 0.70), 8);
    textEl.style.fontSize = `${size}px`;

    while (size > 8) {
      const overflows =
        textEl.scrollWidth > container.clientWidth ||
        textEl.scrollHeight > container.clientHeight;
      if (!overflows) break;
      size -= 1;
      textEl.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [text, vertical]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <span
        ref={textRef}
        style={{
          fontSize,
          color,
          textShadow: shadow,
          fontWeight: 700,
          whiteSpace: "nowrap",
          writingMode: vertical ? "vertical-rl" : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function CloverCard({
  words,
  rotation = 0,
  highlightedIndices = [],
}: {
  words: [string, string, string, string];
  rotation?: number;
  highlightedIndices?: number[];
}) {
  const hl = (i: number) => highlightedIndices.includes(i);
  const color = (i: number) => (hl(i) ? "#fbbf24" : "#d1fae5");
  const shadow = (i: number) =>
    hl(i) ? "0 0 6px rgba(251,191,36,0.7)" : "none";

  return (
    <div
      className="relative w-full aspect-square bg-emerald-800 rounded-lg border-2 border-emerald-600 overflow-hidden select-none"
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    >
      {/* Top strip — full width, 22% height */}
      <div className="absolute top-0 left-0 right-0" style={{ height: "22%" }}>
        <FitText text={words[0]} color={color(0)} shadow={shadow(0)} />
      </div>

      {/* Right strip — 22% width, middle 56% height, reads top-to-bottom */}
      <div
        className="absolute right-0"
        style={{ top: "22%", bottom: "22%", width: "22%" }}
      >
        <FitText text={words[1]} vertical color={color(1)} shadow={shadow(1)} />
      </div>

      {/* Bottom strip — full width, 22% height, rotated so text reads from below */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "22%", transform: "rotate(180deg)" }}
      >
        <FitText text={words[2]} color={color(2)} shadow={shadow(2)} />
      </div>

      {/* Left strip — 22% width, middle 56% height, rotated so text reads bottom-to-top */}
      <div
        className="absolute left-0"
        style={{ top: "22%", bottom: "22%", width: "22%", transform: "rotate(180deg)" }}
      >
        <FitText text={words[3]} vertical color={color(3)} shadow={shadow(3)} />
      </div>

      {/* Center clover decoration */}
      <div className="absolute inset-[22%] bg-emerald-900 rounded flex items-center justify-center">
        <span className="text-base" style={{ opacity: 0.5 }}>
          🍀
        </span>
      </div>
    </div>
  );
}

function DifficultyToggle({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center px-6 py-3 rounded-xl border-2 transition-colors cursor-pointer ${
        active
          ? "bg-emerald-700 border-emerald-400 text-white"
          : "bg-neutral-800 border-neutral-600 text-neutral-400"
      }`}
    >
      <span className="text-lg font-bold">{label}</span>
      <span className="text-xs mt-0.5 opacity-70">{count} words</span>
    </button>
  );
}

function SetupScreen({
  additionalTiles,
  onAdditionalTilesChange,
  useEasy,
  useHard,
  easyCount,
  hardCount,
  onToggleEasy,
  onToggleHard,
  onStart,
}: {
  additionalTiles: number;
  onAdditionalTilesChange: (n: number) => void;
  useEasy: boolean;
  useHard: boolean;
  easyCount: number;
  hardCount: number;
  onToggleEasy: () => void;
  onToggleHard: () => void;
  onStart: () => void;
}) {
  const canStart = useEasy || useHard;
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mt-8">
      <h1 className="text-3xl font-bold">{GAME_NAME}</h1>
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg text-neutral-300">Difficulty</p>
        <div className="flex gap-4">
          <DifficultyToggle label="Easy" count={easyCount} active={useEasy} onClick={onToggleEasy} />
          <DifficultyToggle label="Hard" count={hardCount} active={useHard} onClick={onToggleHard} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg text-neutral-300">Additional random tiles</p>
        <div className="flex gap-4">
          {[1, 2].map((n) => (
            <button
              key={n}
              className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 transition-colors cursor-pointer ${
                additionalTiles === n
                  ? "bg-emerald-600 border-emerald-300 text-white"
                  : "bg-neutral-700 border-neutral-500 text-neutral-300"
              }`}
              onClick={() => onAdditionalTilesChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-sm text-neutral-400">
          {4 + additionalTiles} cards will be dealt
        </p>
      </div>
      <BigButton onClick={onStart} disabled={!canStart}>Start Game</BigButton>
    </div>
  );
}

function PlayingScreen({
  displayedCards,
  onShuffle,
  onNewCards,
}: {
  displayedCards: CloverCardData[];
  onShuffle: () => void;
  onNewCards: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl lg:max-w-5xl">
      {/* landscape: 3 columns (3×2), portrait: 2 columns (2×3) */}
      <div className="grid grid-cols-2 landscape:grid-cols-3 gap-3 w-full">
        {displayedCards.map((card, i) => (
          <CloverCard key={i} words={card.words} />
        ))}
      </div>
      <BigButton onClick={onShuffle} className="mt-2">
        Shuffle
      </BigButton>
      <BigButton onClick={onNewCards}>
        New Cards
      </BigButton>
    </div>
  );
}

function getWordAtPhysicalEdge(card: PlacedCard, physicalEdge: number): string {
  const rotSteps = card.rotation / 90;
  const wordIndex = ((physicalEdge - rotSteps) % 4 + 4) % 4;
  return card.words[wordIndex];
}

function EdgeLabel({ a, b, vertical = false, flip = false }: { a: string; b: string; vertical?: boolean; flip?: boolean }) {
  const base: React.CSSProperties = {
    background: "rgba(10, 15, 30, 0.92)",
    border: "1px solid rgba(251,191,36,0.5)",
    borderRadius: "0.5rem",
    padding: vertical ? "8px 2px" : "2px 8px",
    textAlign: "center",
    whiteSpace: "nowrap",
    writingMode: vertical ? "vertical-rl" : undefined,
    transform: flip ? "rotate(180deg)" : undefined,
  };
  if (vertical) {
    return (
      <div style={base}>
        <span style={{ color: "#94a3b8", fontSize: "9px" }}>Write a one-word clue for </span>
        <span style={{ color: "#fbbf24", fontSize: "11px", fontWeight: 700 }}>{a}</span>
        <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}> & </span>
        <span style={{ color: "#fbbf24", fontSize: "11px", fontWeight: 700 }}>{b}</span>
      </div>
    );
  }
  return (
    <div style={base}>
      <div style={{ color: "#94a3b8", fontSize: "9px", lineHeight: 1.2 }}>Write a one-word clue for</div>
      <div style={{ fontSize: "11px", fontWeight: 700 }}>
        <span style={{ color: "#fbbf24" }}>{a}</span>
        <span style={{ color: "#94a3b8" }}> & </span>
        <span style={{ color: "#fbbf24" }}>{b}</span>
      </div>
    </div>
  );
}

function ShuffledScreen({
  placedCards,
  leftoverCards,
  onShuffle,
  onNewGame,
}: {
  placedCards: PlacedCard[];
  leftoverCards: CloverCardData[];
  onShuffle: () => void;
  onNewGame: () => void;
}) {
  // Physical edges: 0=top, 1=right, 2=bottom, 3=left
  // Grid layout: card[0]=top-left, card[1]=top-right, card[2]=bottom-left, card[3]=bottom-right
  const outerEdges =
    placedCards.length === 4
      ? {
          top:    { a: getWordAtPhysicalEdge(placedCards[0], 0), b: getWordAtPhysicalEdge(placedCards[1], 0) },
          left:   { a: getWordAtPhysicalEdge(placedCards[0], 3), b: getWordAtPhysicalEdge(placedCards[2], 3) },
          right:  { a: getWordAtPhysicalEdge(placedCards[1], 1), b: getWordAtPhysicalEdge(placedCards[3], 1) },
          bottom: { a: getWordAtPhysicalEdge(placedCards[2], 2), b: getWordAtPhysicalEdge(placedCards[3], 2) },
        }
      : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm lg:max-w-2xl">
      <div className="flex flex-col items-center gap-1 w-full">
        {outerEdges && <EdgeLabel a={outerEdges.top.a} b={outerEdges.top.b} />}
        <div className="flex items-center gap-1 w-full">
          {outerEdges && <EdgeLabel a={outerEdges.left.a} b={outerEdges.left.b} vertical flip />}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {placedCards.map((card, i) => {
              const row = Math.floor(i / 2);
              const col = i % 2;
              return (
                <CloverCard
                  key={i}
                  words={card.words}
                  rotation={card.rotation}
                  highlightedIndices={getHighlightedWordIndices(row, col, card.rotation)}
                />
              );
            })}
          </div>
          {outerEdges && <EdgeLabel a={outerEdges.right.a} b={outerEdges.right.b} vertical />}
        </div>
        {outerEdges && <EdgeLabel a={outerEdges.bottom.a} b={outerEdges.bottom.b} />}
      </div>

      <div className="flex flex-col gap-3 w-full mt-2">
        <BigButton onClick={onShuffle}>Shuffle</BigButton>
        <BigButton onClick={onNewGame}>New Game</BigButton>
      </div>
    </div>
  );
}

export default function Main({ easyWords, hardWords }: { easyWords: string[]; hardWords: string[] }) {
  const [showRules, setShowRules] = useState(false);
  const fullScreenHandle = useFullScreenHandle();
  const [phase, setPhase] = useLocalStorage<Phase>(`${GAME_PATH}.phase`, "setup");
  useGamePlayTracking(GAME_PATH, phase !== "setup", false);
  const [useEasy, setUseEasy] = useLocalStorage<boolean>(`${GAME_PATH}.useEasy`, true);
  const [useHard, setUseHard] = useLocalStorage<boolean>(`${GAME_PATH}.useHard`, false);
  const [additionalTiles, setAdditionalTiles] = useLocalStorage<number>(
    `${GAME_PATH}.additionalTiles`,
    1
  );
  const [displayedCards, setDisplayedCards] = useLocalStorage<CloverCardData[]>(
    `${GAME_PATH}.displayedCards`,
    []
  );
  const [placedCards, setPlacedCards] = useLocalStorage<PlacedCard[]>(
    `${GAME_PATH}.placedCards`,
    []
  );
  const [leftoverCards, setLeftoverCards] = useLocalStorage<CloverCardData[]>(
    `${GAME_PATH}.leftoverCards`,
    []
  );

  const activeWords = [
    ...(useEasy ? easyWords : []),
    ...(useHard ? hardWords : []),
  ];

  const startGame = useCallback(() => {
    const cardCount = 4 + additionalTiles;
    const shuffledWords = shuffle([...activeWords]);
    const cards: CloverCardData[] = Array.from({ length: cardCount }, (_, i) => ({
      words: shuffledWords.slice(i * 4, i * 4 + 4) as [string, string, string, string],
    }));
    setDisplayedCards(cards);
    setPlacedCards([]);
    setPhase("playing");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalTiles, useEasy, useHard, setDisplayedCards, setPlacedCards, setPhase]);

  const handleShuffle = useCallback(() => {
    const shuffled = shuffle([...displayedCards]);
    const four = shuffled.slice(0, 4);
    const leftovers = shuffled.slice(4);
    const withRotations: PlacedCard[] = four.map((card) => ({
      ...card,
      rotation: ROTATIONS[Math.floor(Math.random() * 4)],
    }));
    setPlacedCards(withRotations);
    setLeftoverCards(leftovers);
    setPhase("shuffled");
  }, [displayedCards, setPlacedCards, setLeftoverCards, setPhase]);

  const handleNewGame = useCallback(() => {
    setPhase("setup");
  }, [setPhase]);

  function clearCache() {
    Object.keys(localStorage).filter(k => k.startsWith(GAME_PATH + '.')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  const NAV_MENU = [
    {
      name: "New Game",
      icon: "/icons/new.svg",
      onClick: handleNewGame,
    },
    {
      name: "Full screen",
      icon: "/icons/full-screen.svg",
      onClick: fullScreenHandle.enter,
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

  return (
    <div className="min-h-screen text-white">
      <Navbar title={GAME_NAME} menus={NAV_MENU} iconFilePath={GAME_ICON_PATH} iconHref={"/" + GAME_PATH} />
      <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <FullScreen handle={fullScreenHandle}>
        <main className="flex flex-col items-center pt-20 px-4 pb-8 min-h-screen">
          {phase === "setup" && (
            <SetupScreen
              additionalTiles={additionalTiles}
              onAdditionalTilesChange={setAdditionalTiles}
              useEasy={useEasy}
              useHard={useHard}
              easyCount={easyWords.length}
              hardCount={hardWords.length}
              onToggleEasy={() => setUseEasy(!useEasy)}
              onToggleHard={() => setUseHard(!useHard)}
              onStart={startGame}
            />
          )}

          {phase === "playing" && (
            <PlayingScreen
              displayedCards={displayedCards}
              onShuffle={handleShuffle}
              onNewCards={startGame}
            />
          )}

          {phase === "shuffled" && (
            <ShuffledScreen
              placedCards={placedCards}
              leftoverCards={leftoverCards}
              onShuffle={handleShuffle}
              onNewGame={handleNewGame}
            />
          )}
        </main>
      </FullScreen>
    </div>
  );
}
