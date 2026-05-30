"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import useSound from "use-sound";
import Navbar from "../components/Navbar";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuth } from "@/firebase/AuthContext";
import { startGamePlay, endGamePlay, incrementGamePlayCount, recordUserHighScore } from "@/firebase/firebaseService";
import confetti from "canvas-confetti";
import diceSoundFile from "@/assets/dice.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";
import bubblePopSoundFile from "@/assets/bubble-pop.mp3";
import tickingSoundFile from "@/assets/ticking.mp3";

const TOTAL_ROUNDS = 12;
const COUNTDOWN_SECONDS = 3;

const DICE_COLORS = [
  { name: "Orange", hex: "#ee4433" },
  { name: "Blue", hex: "#3498db" },
  { name: "Green", hex: "#27ae60" },
  { name: "Pink", hex: "#e91e8c" },
  { name: "Purple", hex: "#8e44ad" },
  { name: "Yellow", hex: "#e67e22" },
];

const SCORING_CRITERIA = [
  { label: "Orange Dice",  shortLabel: "Orange",   description: "Sum of both orange dice",               colorIndex: 0    },
  { label: "Blue Dice",    shortLabel: "Blue",  description: "Sum of both blue dice",                 colorIndex: 1    },
  { label: "Green Dice",   shortLabel: "Green", description: "Sum of both green dice",                colorIndex: 2    },
  { label: "Pink Dice",    shortLabel: "Pink",  description: "Sum of both pink dice",                 colorIndex: 3    },
  { label: "Purple Dice",  shortLabel: "Purple",  description: "Sum of both purple dice",               colorIndex: 4    },
  { label: "Yellow Dice",  shortLabel: "Yellow",   description: "Sum of both yellow dice",               colorIndex: 5    },
  { label: "Perfect Pairs",shortLabel: "Pairs", description: "Same color + same value = 10 pts each", colorIndex: null },
  { label: "Low (1–2–3)",  shortLabel: "123",   description: "Sum of all dice showing 1, 2, or 3",    colorIndex: null },
  { label: "Fours",        shortLabel: "4s",    description: "Sum of all dice showing 4",              colorIndex: null },
  { label: "Fives",        shortLabel: "5s",    description: "Sum of all dice showing 5",              colorIndex: null },
  { label: "Sixes",        shortLabel: "6s",    description: "Sum of all dice showing 6",              colorIndex: null },
  { label: "Pool Partyz!", shortLabel: "All",   description: "Sum of all 12 dice",                    colorIndex: null },
];

interface DieResult {
  colorIndex: number;
  value: number;
}

interface DiceBoxInstance {
  canvas: HTMLCanvasElement;
  init(): Promise<void>;
  roll(
    groups: { qty: number; sides: number | string; theme: string; themeColor: string }[]
  ): Promise<{ groupId: number; value: number }[]>;
  clear(): DiceBoxInstance;
  show(): DiceBoxInstance;
  hide(): DiceBoxInstance;
  resizeWorld(): void;
}

type GameMode = "dice-roll-only" | "roll-and-write";
type GamePhase =
  | "setup"
  | "ready-to-roll"
  | "rolling"
  | "countdown"
  | "roll-results"
  | "choose-criteria"
  | "game-over";

function calculateScore(criteriaIndex: number, dice: DieResult[]): number {
  if (criteriaIndex >= 0 && criteriaIndex <= 5) {
    return dice
      .filter((d) => d.colorIndex === criteriaIndex)
      .reduce((s, d) => s + d.value, 0);
  }
  if (criteriaIndex === 6) {
    let pairs = 0;
    for (let i = 0; i < 6; i++) {
      const pair = dice.filter((d) => d.colorIndex === i);
      if (pair.length === 2 && pair[0].value === pair[1].value) pairs++;
    }
    return pairs * 10;
  }
  if (criteriaIndex === 7)
    return dice.filter((d) => d.value <= 3).reduce((s, d) => s + d.value, 0);
  if (criteriaIndex === 8)
    return dice.filter((d) => d.value === 4).reduce((s, d) => s + d.value, 0);
  if (criteriaIndex === 9)
    return dice.filter((d) => d.value === 5).reduce((s, d) => s + d.value, 0);
  if (criteriaIndex === 10)
    return dice.filter((d) => d.value === 6).reduce((s, d) => s + d.value, 0);
  if (criteriaIndex === 11) return dice.reduce((s, d) => s + d.value, 0);
  return 0;
}

function ColorDot({
  colorIndex,
  size = 12,
}: {
  colorIndex: number | null;
  size?: number;
}) {
  if (colorIndex === null) return null;
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: DICE_COLORS[colorIndex].hex,
        border: "1.5px solid rgba(255,255,255,0.25)",
      }}
    />
  );
}

export default function Main() {
  const [phase, setPhase] = useLocalStorage<GamePhase>(`${GAME_PATH}.phase`, "setup");
  const [gameMode, setGameMode] = useLocalStorage<GameMode | null>(`${GAME_PATH}.gameMode`, null);
  const [selectedCriteria, setSelectedCriteria] = useLocalStorage<number | null>(`${GAME_PATH}.selectedCriteria`, null);
  const [usedCriteriaList, setUsedCriteriaList] = useLocalStorage<number[]>(`${GAME_PATH}.usedCriteria`, []);
  const usedCriteria = new Set(usedCriteriaList);
  const [scores, setScores] = useLocalStorage<(number | null)[]>(`${GAME_PATH}.scores`, Array(12).fill(null));
  const [diceResults, setDiceResults] = useLocalStorage<DieResult[]>(`${GAME_PATH}.diceResults`, []);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [diceVisible, setDiceVisible] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useLocalStorage<boolean>(`${GAME_PATH}.resultsRevealed`, false);
  const [diceBoxReady, setDiceBoxReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [playDiceSound] = useSound(diceSoundFile);
  const [playTimesUpSound] = useSound(timesUpSoundFile);
  const [playBubblePopSound] = useSound(bubblePopSoundFile);
  const [playTickingSound] = useSound(tickingSoundFile);
  const [highScore, setHighScore] = useLocalStorage<number | null>(`${GAME_PATH}.highScore`, null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const { user } = useAuth();
  const diceBoxRef = useRef<DiceBoxInstance | null>(null);
  const diceContainerRef = useRef<HTMLDivElement>(null);
  const playIdRef = useRef<string | null>(null);

  // Normalize transient phases once gameMode hydrates from localStorage
  useEffect(() => {
    if (phase === "rolling" || phase === "countdown") {
      setPhase("ready-to-roll");
      setCountdown(null);
      setDiceVisible(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]); // intentionally only runs on gameMode change (hydration), not on every phase change

  useEffect(() => {
    if (!gameMode || !diceContainerRef.current) return;

    diceContainerRef.current.innerHTML = "";
    let destroyed = false;

    async function initDiceBox() {
      const { default: DiceBox } = await import("@3d-dice/dice-box");

      const box = new DiceBox({
        container: "#dice-box-canvas",
        assetPath: "/dice-box-assets/",
        id: "dice-canvas",
        theme: "smooth-pip",
        scale: 8,
        mass: 6,
        gravity: 8,
        spinForce: 5,
        throwForce: 15,
        startingHeight: 5,
        settleTimeout: 3000,
        offscreen: false,
        enableShadows: true,
        angularDamping: 0.98,
      }) as DiceBoxInstance;

      await box.init();

      if (destroyed) return;

      // Initial canvas size + trigger dice-box's resize handler
      const containerEl = diceContainerRef.current;
      if (containerEl && box.canvas) {
        const w = containerEl.clientWidth || 400;
        const h = containerEl.clientHeight || 260;
        box.canvas.width = w;
        box.canvas.height = h;
        window.dispatchEvent(new Event("resize"));
      }

      diceBoxRef.current = box;
      setDiceBoxReady(true);

      // Re-trigger resize whenever the container changes size (e.g. window resize)
      const ro = new ResizeObserver(() => {
        if (!destroyed) window.dispatchEvent(new Event("resize"));
      });
      if (containerEl) ro.observe(containerEl);
      return () => ro.disconnect();
    }

    let cleanup: (() => void) | undefined;
    initDiceBox()
      .then((fn) => { cleanup = fn; })
      .catch((err: Error) => {
        if (!destroyed) setInitError(err?.message ?? "Failed to load dice engine");
      });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [gameMode]);

  const rollDice = useCallback(async () => {
    if (!diceBoxRef.current || !diceBoxReady) return;

    setPhase("countdown");
    setDiceVisible(true);
    setResultsRevealed(false);
    setCountdown(COUNTDOWN_SECONDS);
    playDiceSound();

    diceBoxRef.current.show();
    diceBoxRef.current.clear();

    const groups = DICE_COLORS.map((color) => ({
      qty: 2,
      sides: "pip",
      theme: "smooth-pip",
      themeColor: color.hex,
    }));

    // Resolve results concurrently with the countdown
    const results = await diceBoxRef.current.roll(groups);

    const parsed: DieResult[] = results.map((die) => ({
      colorIndex: die.groupId,
      value: die.value,
    }));

    setDiceResults(parsed);
  }, [diceBoxReady, playDiceSound, setPhase, setResultsRevealed, setDiceResults]);

  const handleRevealDice = useCallback(() => {
    if (selectedCriteria === null) return;
    const score = calculateScore(selectedCriteria, diceResults);
    setScores((prev) => {
      const next = [...prev];
      next[selectedCriteria] = score;
      return next;
    });
    diceBoxRef.current?.show();
    setDiceVisible(true);
    playBubblePopSound();
    setResultsRevealed(true);
  }, [selectedCriteria, diceResults, playBubblePopSound, setScores, setResultsRevealed]);

  const handleNextRound = useCallback(() => {
    if (selectedCriteria === null) return;
    const nextList = [...usedCriteriaList, selectedCriteria];
    setUsedCriteriaList(nextList);
    setSelectedCriteria(null);
    setResultsRevealed(false);
    if (nextList.length >= TOTAL_ROUNDS) {
      setPhase("game-over");
    } else {
      setPhase("ready-to-roll");
    }
  }, [selectedCriteria, usedCriteriaList, setUsedCriteriaList, setPhase, setSelectedCriteria, setResultsRevealed]);

  // Space to roll / reveal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      if (phase === "ready-to-roll" && diceBoxReady) {
        rollDice();
      } else if (phase === "roll-results" && !resultsRevealed) {
        setResultsRevealed(true);
        diceBoxRef.current?.show();
        setDiceVisible(true);
        playBubblePopSound();
      } else if (phase === "choose-criteria" && !resultsRevealed && selectedCriteria !== null) {
        handleRevealDice();
      } else if (phase === "choose-criteria" && resultsRevealed && diceBoxReady) {
        const isLast = usedCriteriaList.length + 1 >= TOTAL_ROUNDS;
        handleNextRound();
        if (!isLast) rollDice();
      } else if (phase === "roll-results" && resultsRevealed && diceBoxReady) {
        rollDice();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, diceBoxReady, resultsRevealed, selectedCriteria, usedCriteriaList, rollDice, playBubblePopSound, handleRevealDice, handleNextRound, setResultsRevealed]);

  // Countdown tick
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      diceBoxRef.current?.hide();
      setDiceVisible(false);
      setCountdown(null);
      playTimesUpSound();
      setPhase(
        gameMode === "roll-and-write" ? "choose-criteria" : "roll-results"
      );
      return;
    }

    playTickingSound();
    const timer = setTimeout(
      () => setCountdown((c) => (c ?? 1) - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown, gameMode, playTimesUpSound, playTickingSound, setPhase]);

  function startGame(mode: GameMode) {
    setGameMode(mode);
    setPhase("ready-to-roll");
    incrementGamePlayCount(user?.uid ?? null, GAME_PATH);
    if (user) {
      startGamePlay(user.uid, GAME_PATH).then((id) => {
        playIdRef.current = id;
      });
    }
  }

  useEffect(() => {
    if (phase !== "game-over") return;
    if (playIdRef.current && user) {
      endGamePlay(user.uid, GAME_PATH, playIdRef.current, totalScore);
      playIdRef.current = null;
    }
    if (totalScore > (highScore ?? 0)) {
      setHighScore(totalScore);
      setIsNewHighScore(true);
      if (user) recordUserHighScore(user.uid, GAME_PATH, totalScore);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function resetGame() {
    diceBoxRef.current = null;
    setDiceBoxReady(false);
    setInitError(null);
    setPhase("setup");
    setGameMode(null);
    setSelectedCriteria(null);
    setUsedCriteriaList([]);
    setScores(Array(12).fill(null));
    setDiceResults([]);
    setCountdown(null);
    setDiceVisible(false);
    setResultsRevealed(false);
    setIsNewHighScore(false);
  }

  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(GAME_PATH + "."))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  const totalScore = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);

  const NAV_MENU = [
    { name: "New Game", icon: "/icons/new.svg", onClick: resetGame },
    { name: "Full screen", icon: "/icons/full-screen.svg", onClick: fullScreenHandle.enter },
    { name: "Clear cache", icon: "/icons/clear.svg", onClick: clearCache },
  ];

  return (
    <>
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
        iconHref={"/" + GAME_PATH}
      />

      <FullScreen handle={fullScreenHandle}>
      <main className="flex flex-col pt-8 min-h-screen items-center px-4 pb-8">
        {/* ── Setup ── */}
        {phase === "setup" && (
          <div className="w-full max-w-md mt-16 flex flex-col items-center gap-6">
            <h1 className="text-3xl font-black text-white text-center">
              Dice Pool Partyz
            </h1>
            <p className="text-gray-400 text-center">
              Choose your mode to start.
            </p>
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => startGame("dice-roll-only")}
                className="w-full py-5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors text-left px-6"
              >
                <div className="text-white font-bold text-lg">
                  Dice Roll Only
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  Roll 12 colored dice and watch the results.
                </div>
              </button>
              <button
                onClick={() => startGame("roll-and-write")}
                className="w-full py-5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-indigo-500 transition-colors text-left px-6"
              >
                <div className="text-white font-bold text-lg">
                  Roll and Write
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  12 rounds — roll, then pick a scoring category and reveal your
                  score.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Play screen ── */}
        {phase !== "setup" && (
          <div className="w-full max-w-xl mt-4 flex flex-col gap-4">
            {/* Dice tray — hidden during game-over */}
            {phase !== "game-over" && (
              <>
                {/* Tray outer leather frame */}
                <div
                  className="relative w-full"
                  style={{
                    background:
                      "linear-gradient(160deg, #2e2e2e 0%, #1a1a1a 100%)",
                    borderRadius: 18,
                    padding: "16px 16px 20px",
                    boxShadow: [
                      "0 24px 56px rgba(0,0,0,0.95)",
                      "0 8px 0 #0d0d0d",
                      "0 9px 4px rgba(0,0,0,0.6)",
                      "inset 0 1px 0 rgba(255,255,255,0.08)",
                    ].join(", "),
                  }}
                >
                  {/* Stitching detail */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      inset: 7,
                      borderRadius: 12,
                      border: "1.5px dashed rgba(255,255,255,0.07)",
                    }}
                  />

                  {/* Red felt interior */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      height: 280,
                      background:
                        "radial-gradient(ellipse at 40% 35%, #6b0f1a 0%, #3d0610 60%, #1e0308 100%)",
                      boxShadow: [
                        "inset 0 10px 28px rgba(0,0,0,0.75)",
                        "inset 0 0 0 1px rgba(0,0,0,0.6)",
                      ].join(", "),
                    }}
                  >
                    {/* DiceBox canvas */}
                    <div
                      id="dice-box-canvas"
                      ref={diceContainerRef}
                      className="absolute inset-0"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Placeholder when canvas is idle */}
                    {!diceVisible && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {initError ? (
                          <p className="text-red-400 text-xs text-center px-4">
                            {initError}
                          </p>
                        ) : phase === "choose-criteria" && !resultsRevealed ? (
                          <p className="text-white text-sm select-none text-center px-4">
                            Select your scoring category
                          </p>
                        ) : (
                          <p className="text-white text-sm select-none">
                            {diceBoxReady ? "Ready — press Roll!" : "Loading…"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Countdown below tray */}
                {phase === "countdown" && countdown !== null && (
                  <div className="flex items-center justify-center h-16">
                    <span
                      className="font-black text-white tabular-nums"
                      style={{
                        fontSize: "3.5rem",
                        lineHeight: 1,
                        textShadow: "0 2px 16px rgba(0,0,0,0.8)",
                      }}
                    >
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Roll button */}
            {phase === "ready-to-roll" && (
              <button
                onClick={rollDice}
                disabled={!diceBoxReady}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors flex items-center justify-center gap-3"
              >
                <span>{diceResults.length > 0 ? "Roll Again" : "Roll!"}</span>
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-indigo-800 text-indigo-300 text-xs font-mono font-normal">
                  Space
                </kbd>
              </button>
            )}

            {/* Dice-roll-only results */}
            {gameMode === "dice-roll-only" && phase === "roll-results" && (
              <div className="flex flex-col gap-3">
                {!resultsRevealed ? (
                  <button
                    onClick={() => {
                      setResultsRevealed(true);
                      diceBoxRef.current?.show();
                      setDiceVisible(true);
                      playBubblePopSound();
                    }}
                    className="w-full py-4 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <span>Reveal Results</span>
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-green-900 text-green-300 text-xs font-mono font-normal">
                      Space
                    </kbd>
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-6 gap-1.5">
                      {SCORING_CRITERIA.map((c, i) => {
                        const score = calculateScore(i, diceResults);
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1 bg-gray-800 rounded-lg py-2 px-1"
                          >
                            <div className="flex items-center gap-1">
                              {c.colorIndex !== null && (
                                <ColorDot colorIndex={c.colorIndex} size={8} />
                              )}
                              <span className="text-gray-400 text-[10px] leading-tight">
                                {c.shortLabel}
                              </span>
                            </div>
                            <span className="text-white font-black text-xl leading-none">
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={rollDice}
                      disabled={!diceBoxReady}
                      className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors flex items-center justify-center gap-3"
                    >
                      <span>Roll Again</span>
                      <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-indigo-800 text-indigo-300 text-xs font-mono font-normal">
                        Space
                      </kbd>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Roll and Write: select category → reveal dice → next round */}
            {gameMode === "roll-and-write" && phase === "choose-criteria" && (
              <div className="flex flex-col gap-3">
                {/* Step 1: select a category, then reveal */}
                {!resultsRevealed && selectedCriteria !== null && (
                  <button
                    onClick={handleRevealDice}
                    className="w-full py-4 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <span>Reveal Results</span>
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-green-900 text-green-300 text-xs font-mono font-normal">
                      Space
                    </kbd>
                  </button>
                )}

                {/* Step 2: dice shown, score revealed → roll again / final results */}
                {resultsRevealed && (
                  <button
                    onClick={() => {
                      const isLast = usedCriteriaList.length + 1 >= TOTAL_ROUNDS;
                      handleNextRound();
                      if (!isLast) rollDice();
                    }}
                    disabled={!diceBoxReady}
                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors flex items-center justify-center gap-3"
                  >
                    {usedCriteriaList.length + 1 >= TOTAL_ROUNDS ? (
                      <span>Final Results</span>
                    ) : (
                      <>
                        <span>Roll Again</span>
                        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-indigo-800 text-indigo-300 text-xs font-mono font-normal">
                          Space
                        </kbd>
                      </>
                    )}
                  </button>
                )}

                {/* Scorecard */}
                <div className="grid grid-cols-6 gap-1.5">
                  {SCORING_CRITERIA.map((c, i) => {
                    const used = usedCriteria.has(i);
                    const isSelected = selectedCriteria === i;
                    const canSelect = !used && !resultsRevealed;
                    return (
                      <div
                        key={i}
                        onClick={() => canSelect && setSelectedCriteria(i)}
                        className={[
                          "flex flex-col items-center gap-1 rounded-lg py-2 px-1 transition-colors",
                          used
                            ? "bg-gray-900 opacity-50 cursor-default"
                            : isSelected && resultsRevealed
                            ? "bg-green-950 ring-1 ring-green-500 cursor-default"
                            : isSelected
                            ? "bg-indigo-950 ring-1 ring-indigo-400 cursor-pointer"
                            : canSelect
                            ? "bg-gray-800 hover:bg-gray-700 cursor-pointer"
                            : "bg-gray-800 opacity-40 cursor-default",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-1">
                          {c.colorIndex !== null && (
                            <ColorDot colorIndex={c.colorIndex} size={8} />
                          )}
                          <span className="text-gray-400 text-[10px] leading-tight">
                            {c.shortLabel}
                          </span>
                        </div>
                        <span className="text-white font-black text-xl leading-none">
                          {used
                            ? scores[i]
                            : isSelected && resultsRevealed
                            ? scores[i]
                            : isSelected
                            ? "✓"
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-sm font-medium">Total</span>
                  <span className="text-white font-black text-lg">{totalScore}</span>
                </div>

                {/* This roll's scores */}
                {resultsRevealed && (
                  <div className="grid grid-cols-6 gap-1.5">
                    {SCORING_CRITERIA.map((c, i) => {
                      const rollScore = calculateScore(i, diceResults);
                      const isSelected = selectedCriteria === i;
                      return (
                        <div
                          key={i}
                          className={[
                            "flex flex-col items-center gap-1 rounded-lg py-2 px-1",
                            isSelected
                              ? "bg-green-950 ring-1 ring-green-500"
                              : "bg-gray-800 opacity-60",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-1">
                            {c.colorIndex !== null && (
                              <ColorDot colorIndex={c.colorIndex} size={8} />
                            )}
                            <span className="text-gray-400 text-[10px] leading-tight">
                              {c.shortLabel}
                            </span>
                          </div>
                          <span className="text-white font-black text-xl leading-none">
                            {rollScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Game over */}
            {phase === "game-over" && (
              <div className="flex flex-col items-center gap-6 py-4">
                <h2 className="text-3xl font-black text-white">Game Over!</h2>
                <div className="relative">
                  <div
                    className="rounded-2xl px-10 py-7 flex flex-col items-center gap-1"
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                      boxShadow: "0 0 0 2px #6366f1, 0 0 32px rgba(99,102,241,0.4)",
                    }}
                  >
                    <span className="text-indigo-300 text-sm font-semibold uppercase tracking-widest">
                      Final Score
                    </span>
                    <span className="text-7xl font-black text-white leading-none mt-1">
                      {totalScore}
                    </span>
                  </div>
                  {isNewHighScore && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      New high score!
                    </span>
                  )}
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden w-full">
                  <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest">
                      Score Breakdown
                    </span>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {SCORING_CRITERIA.map((criteria, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <ColorDot colorIndex={criteria.colorIndex} />
                        <span className="flex-1 text-sm text-gray-300">
                          {criteria.label}
                        </span>
                        <span className="text-green-400 font-bold text-sm">
                          {scores[i] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
                    <span className="text-white font-bold text-sm">Total</span>
                    <span className="text-white font-black text-lg">
                      {totalScore}
                    </span>
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-colors"
                >
                  New Game
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      </FullScreen>
    </>
  );
}
