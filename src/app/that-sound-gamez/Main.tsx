"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import BigButton from "../components/BigButton";
import { MainProps } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import useLocalStorage from "../hooks/useLocalStorage";
import CircularTimer, {
  CircularTimerRefProps,
} from "../components/CircularTimer";
import rightSoundFile from "@/assets/right.mp3";
import wrongSoundFile from "@/assets/wrong.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";

type GameMode = "random-category" | "all-categories";
type GameScreen = "setup" | "playing" | "round-end" | "game-over";

interface RoundWord {
  word: string;
  category: string;
  result: "correct" | "skipped";
}

interface GameState {
  screen: GameScreen;
  mode: GameMode;
  targetScore: number;
  totalScore: number;
  previousScore: number;
  roundScore: number;
  roundWords: RoundWord[];
  currentRoundCategory: string;
  usedIndices: number[];
}

const DEFAULT_STATE: GameState = {
  screen: "setup",
  mode: "random-category",
  targetScore: 30,
  totalScore: 0,
  previousScore: 0,
  roundScore: 0,
  roundWords: [],
  currentRoundCategory: "",
  usedIndices: [],
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Main({ questions }: MainProps) {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    DEFAULT_STATE
  );

  const [currentWord, setCurrentWord] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [playRightSound] = useSound(rightSoundFile);
  const [playWrongSound] = useSound(wrongSoundFile);
  const [playTimesUpSound] = useSound(timesUpSoundFile);
  const fullScreenHandle = useFullScreenHandle();
  const timerRef = useRef<CircularTimerRefProps>(null);
  const shouldStartTimer = useRef(false);

  const categories = [...new Set(questions.map((q) => q.category))];

  // Start timer after CircularTimer mounts (it's conditionally rendered)
  useEffect(() => {
    if (gameState.screen === "playing" && shouldStartTimer.current) {
      shouldStartTimer.current = false;
      timerRef.current?.reset();
      timerRef.current?.go();
    }
  }, [gameState.screen]);

  const pickNextWord = useCallback(
    (state: GameState): { word: string; category: string; index: number } | null => {
      let pool: { word: string; category: string; index: number }[];

      if (state.mode === "random-category" && state.currentRoundCategory) {
        pool = questions
          .map((q, i) => ({ ...q, index: i }))
          .filter(
            (q) =>
              q.category === state.currentRoundCategory &&
              !state.usedIndices.includes(q.index)
          );
      } else {
        pool = questions
          .map((q, i) => ({ ...q, index: i }))
          .filter((q) => !state.usedIndices.includes(q.index));
      }

      if (pool.length === 0) {
        // Reset used indices if we run out
        if (state.mode === "random-category" && state.currentRoundCategory) {
          pool = questions
            .map((q, i) => ({ ...q, index: i }))
            .filter((q) => q.category === state.currentRoundCategory);
        } else {
          pool = questions.map((q, i) => ({ ...q, index: i }));
        }
      }

      if (pool.length === 0) return null;
      return getRandomItem(pool);
    },
    [questions]
  );

  const onNewGame = useCallback(() => {
    setGameState(DEFAULT_STATE);
    setCurrentWord("");
    setCurrentCategory("");
    timerRef.current?.reset();
  }, [setGameState]);

  function clearCache() {
    setGameState(DEFAULT_STATE);
    setCurrentWord("");
    setCurrentCategory("");
  }

  const NAV_MENU: NavMenu[] = [
    {
      name: "New game",
      icon: "/icons/new.svg",
      onClick: onNewGame,
    },
    {
      name: "Full screen",
      icon: "/full-screen.svg",
      onClick: fullScreenHandle.enter,
    },
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
    {
      name: "Clear cache",
      icon: "/broom.svg",
      onClick: clearCache,
    },
  ];

  const onStartGame = useCallback(() => {
    const roundCategory =
      gameState.mode === "random-category" ? getRandomItem(categories) : "";
    const newState: GameState = {
      ...DEFAULT_STATE,
      screen: "playing",
      mode: gameState.mode,
      targetScore: gameState.targetScore,
      currentRoundCategory: roundCategory,
      usedIndices: [],
    };
    setGameState(newState);

    const next = pickNextWord({ ...newState, usedIndices: [] });
    if (next) {
      setCurrentWord(next.word);
      setCurrentCategory(next.category);
      setGameState((prev) => ({
        ...prev,
        usedIndices: [next.index],
      }));
    }

    shouldStartTimer.current = true;
  }, [gameState.mode, gameState.targetScore, categories, pickNextWord, setGameState]);

  const onCorrect = useCallback(() => {
    playRightSound();
    setGameState((prev) => {
      const updated = {
        ...prev,
        roundScore: prev.roundScore + 1,
        roundWords: [
          ...prev.roundWords,
          { word: currentWord, category: currentCategory, result: "correct" as const },
        ],
      };
      // Pick next word with updated state
      const next = pickNextWord(updated);
      if (next) {
        setCurrentWord(next.word);
        setCurrentCategory(next.category);
        return { ...updated, usedIndices: [...updated.usedIndices, next.index] };
      }
      return updated;
    });
  }, [currentWord, currentCategory, playRightSound, pickNextWord, setGameState]);

  const onSkip = useCallback(() => {
    playWrongSound();
    setGameState((prev) => {
      const updated = {
        ...prev,
        roundScore: prev.roundScore - 1,
        roundWords: [
          ...prev.roundWords,
          { word: currentWord, category: currentCategory, result: "skipped" as const },
        ],
      };
      const next = pickNextWord(updated);
      if (next) {
        setCurrentWord(next.word);
        setCurrentCategory(next.category);
        return { ...updated, usedIndices: [...updated.usedIndices, next.index] };
      }
      return updated;
    });
  }, [currentWord, currentCategory, playWrongSound, pickNextWord, setGameState]);

  const onTimerEnded = useCallback(() => {
    playTimesUpSound();
    setGameState((prev) => {
      const newTotal = prev.totalScore + prev.roundScore;
      if (newTotal >= prev.targetScore) {
        return {
          ...prev,
          screen: "game-over",
          totalScore: newTotal,
        };
      }
      return {
        ...prev,
        screen: "round-end",
        previousScore: prev.totalScore,
        totalScore: newTotal,
      };
    });
    timerRef.current?.reset();
  }, [playTimesUpSound, setGameState]);

  const onNextRound = useCallback(() => {
    const roundCategory =
      gameState.mode === "random-category" ? getRandomItem(categories) : "";
    setGameState((prev) => {
      const updated = {
        ...prev,
        screen: "playing" as GameScreen,
        roundScore: 0,
        roundWords: [] as RoundWord[],
        currentRoundCategory: roundCategory,
      };
      const next = pickNextWord(updated);
      if (next) {
        setCurrentWord(next.word);
        setCurrentCategory(next.category);
        return { ...updated, usedIndices: [...updated.usedIndices, next.index] };
      }
      return updated;
    });
    shouldStartTimer.current = true;
  }, [gameState.mode, categories, pickNextWord, setGameState]);


  return (
    <>
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
      />
      <Rules
        gameName={GAME_NAME}
        gamePath={GAME_PATH}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <FullScreen handle={fullScreenHandle}>
        <main className="mt-20 flex flex-col min-h-[80vh] items-center px-4">
          {/* Setup Screen */}
          {gameState.screen === "setup" && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md mt-8">
              <h2 className="text-2xl font-bold text-white">Game Setup</h2>

              {/* Mode Selector */}
              <div className="w-full">
                <label className="text-lg text-gray-300 mb-2 block">Mode</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-colors cursor-pointer select-none ${
                      gameState.mode === "random-category"
                        ? "bg-pink-700 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() =>
                      setGameState((prev) => ({ ...prev, mode: "random-category" }))
                    }
                  >
                    Random Category
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-colors cursor-pointer select-none ${
                      gameState.mode === "all-categories"
                        ? "bg-pink-700 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() =>
                      setGameState((prev) => ({ ...prev, mode: "all-categories" }))
                    }
                  >
                    All Categories
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {gameState.mode === "random-category"
                    ? "Each round picks one random category"
                    : "Words come from any category"}
                </p>
              </div>

              {/* Score Selector */}
              <div className="w-full">
                <label className="text-lg text-gray-300 mb-2 block">
                  Target Score
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    className="w-14 h-14 rounded-lg bg-pink-950 text-white text-3xl font-bold cursor-pointer select-none active:bg-pink-800"
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        targetScore: Math.max(10, prev.targetScore - 5),
                      }))
                    }
                  >
                    -
                  </button>
                  <span className="text-5xl font-bold text-white w-24 text-center">
                    {gameState.targetScore}
                  </span>
                  <button
                    className="w-14 h-14 rounded-lg bg-pink-950 text-white text-3xl font-bold cursor-pointer select-none active:bg-pink-800"
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        targetScore: Math.min(300, prev.targetScore + 5),
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Categories Preview */}
              <div className="w-full">
                <label className="text-lg text-gray-300 mb-2 block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-pink-950 text-white rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="w-full mt-4">
                <BigButton onClick={onStartGame}>Start Game</BigButton>
              </div>
            </div>
          )}

          {/* Playing Screen */}
          {gameState.screen === "playing" && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <div className="flex items-center justify-between w-full px-4">
                <div className="text-gray-400 text-sm">
                  Score: {gameState.totalScore + gameState.roundScore} / {gameState.targetScore}
                </div>
                {gameState.mode === "random-category" &&
                  gameState.currentRoundCategory && (
                    <div className="px-3 py-1 bg-pink-950 rounded-full text-white text-sm">
                      {gameState.currentRoundCategory}
                    </div>
                  )}
              </div>

              <CircularTimer
                ref={timerRef}
                duration={60}
                onEnded={onTimerEnded}
                tickSoundStartAt={10}
              />

              {/* Current Word */}
              <div className="w-full bg-pink-950 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  {currentCategory}
                </p>
                <h1 className="text-4xl font-bold text-white select-none">
                  {currentWord}
                </h1>
              </div>

              {/* Skip / Correct Buttons */}
              <div className="fixed flex h-24 bottom-4 pb-4 gap-4 mb-4 left-0 right-0 p-4 justify-center">
                <div className="flex-1">
                  <BigButton onClick={onSkip} className="!bg-red-900">
                    Skip (-1)
                  </BigButton>
                </div>
                <div className="flex-1">
                  <BigButton onClick={onCorrect} className="!bg-green-900">
                    Correct (+1)
                  </BigButton>
                </div>
              </div>
            </div>
          )}

          {/* Round End Screen */}
          {gameState.screen === "round-end" && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md mt-4">
              <h2 className="text-2xl font-bold text-white">Round Summary</h2>

              {/* Score Summary */}
              <div className="w-full bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-gray-300">
                  <span>Previous Score</span>
                  <span>{gameState.previousScore}</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Round Score</span>
                  <span
                    className={
                      gameState.roundScore >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {gameState.roundScore >= 0 ? "+" : ""}
                    {gameState.roundScore}
                  </span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total Score</span>
                  <span>
                    {gameState.totalScore} / {gameState.targetScore}
                  </span>
                </div>
              </div>

              {/* Word List */}
              <div className="w-full max-h-[40vh] overflow-y-auto rounded-xl bg-gray-800 p-4">
                {gameState.roundWords.map((rw, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 ${
                      i < gameState.roundWords.length - 1
                        ? "border-b border-gray-700"
                        : ""
                    }`}
                  >
                    <div>
                      <span className="text-white">{rw.word}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {rw.category}
                      </span>
                    </div>
                    <span
                      className={
                        rw.result === "correct" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {rw.result === "correct" ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
                {gameState.roundWords.length === 0 && (
                  <p className="text-gray-500 text-center">No words this round</p>
                )}
              </div>

              {/* Next Round Button */}
              <div className="fixed flex h-24 bottom-4 pb-4 gap-4 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton onClick={onNextRound}>Next Round</BigButton>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState.screen === "game-over" && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md mt-16">
              <h2 className="text-3xl font-bold text-white">Game Over!</h2>
              <div className="text-6xl font-bold text-pink-400">
                {gameState.totalScore}
              </div>
              <p className="text-gray-400 text-lg">
                Target: {gameState.targetScore}
              </p>

              {/* Final Round Word List */}
              <div className="w-full max-h-[30vh] overflow-y-auto rounded-xl bg-gray-800 p-4">
                <h3 className="text-white font-bold mb-2">Last Round</h3>
                {gameState.roundWords.map((rw, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 ${
                      i < gameState.roundWords.length - 1
                        ? "border-b border-gray-700"
                        : ""
                    }`}
                  >
                    <div>
                      <span className="text-white">{rw.word}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {rw.category}
                      </span>
                    </div>
                    <span
                      className={
                        rw.result === "correct" ? "text-green-400" : "text-red-400"
                      }
                    >
                      {rw.result === "correct" ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="fixed flex h-24 bottom-4 pb-4 gap-4 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton onClick={onNewGame}>New Game</BigButton>
              </div>
            </div>
          )}
        </main>
      </FullScreen>
    </>
  );
}
