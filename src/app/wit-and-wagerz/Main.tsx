"use client";

import { useState, useCallback, useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import useLocalStorage from "../hooks/useLocalStorage";
import { useGamePlayTracking } from "../hooks/useGamePlayTracking";

export interface WitQuestion {
  answer: string;
  question: string;
  funFact?: string;
}

const ROUNDS_PER_GAME = 7;
const BET_ODDS = ["6 to 1", "5 to 1", "4 to 1", "3 to 1", "2 to 1", "3 to 1", "4 to 1", "5 to 1"];

interface GameState {
  round: number;
  answerRevealed: boolean;
  gameOver: boolean;
}

const DEFAULT_STATE: GameState = {
  round: 1,
  answerRevealed: false,
  gameOver: false,
};

function BettingBoard() {
  return (
    <div className="bg-green-900 rounded-2xl p-3 w-full shadow-xl border-2 border-green-700">
      <div className="flex gap-1 items-stretch" style={{ height: "120px" }}>
        {BET_ODDS.map((odds, i) => (
          <div
            key={i}
            className="flex-1 border-2 border-white rounded-lg bg-green-800 flex flex-col items-center justify-between py-1"
          >
            <span className="text-white font-bold text-center" style={{ fontSize: "0.6rem" }}>
              {odds}
            </span>
            {i === 0 && (
              <span
                className="text-white font-bold text-center leading-tight px-0.5"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: "0.42rem",
                  letterSpacing: "0.05em",
                }}
              >
                SMALLER THAN THE SMALLEST GUESS
              </span>
            )}
            <div className="flex-1" />
            <span className="text-white font-bold text-center" style={{ fontSize: "0.6rem" }}>
              {odds}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex items-center gap-1 text-green-400" style={{ fontSize: "0.65rem" }}>
          <span>←</span>
          <span className="font-semibold">Smaller Answers</span>
        </div>
        <div className="flex items-center gap-1 text-green-400" style={{ fontSize: "0.65rem" }}>
          <span className="font-semibold">Larger Answers</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

export default function Main({ questions }: { questions: WitQuestion[] }) {
  const [sessionQuestions, setSessionQuestions, clearSessionQuestions] =
    useLocalStorage<WitQuestion[]>(`${GAME_PATH}.questions`, questions);
  const [currentQuestion, setCurrentQuestion] = useLocalStorage<WitQuestion | null>(
    `${GAME_PATH}.currentQuestion`,
    null
  );
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    DEFAULT_STATE
  );
  const [showRules, setShowRules] = useState(false);
  const [showBoard, setShowBoard] = useLocalStorage<boolean>(`${GAME_PATH}.showBoard`, true);
  const fullScreenHandle = useFullScreenHandle();

  useGamePlayTracking(GAME_PATH, currentQuestion !== null, gameState.gameOver);

  function clearCache() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(GAME_PATH + "."))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  // Clear stale cache if stored data uses the old column format (word/category)
  useEffect(() => {
    const stored = window.localStorage.getItem(`${GAME_PATH}.currentQuestion`);
    if (!stored) return;
    try {
      const q = JSON.parse(stored) as Record<string, unknown>;
      if (!("answer" in q)) clearCache();
    } catch {
      clearCache();
    }
  }, []);

  const popRandomQuestion = useCallback(() => {
    let pool = sessionQuestions.length > 0 ? [...sessionQuestions] : [...questions];
    const randomIndex = Math.floor(Math.random() * pool.length);
    let item = pool[randomIndex];
    pool.splice(randomIndex, 1);

    while (currentQuestion && item.question === currentQuestion.question && pool.length > 0) {
      const ri = Math.floor(Math.random() * pool.length);
      item = pool[ri];
      pool.splice(ri, 1);
    }

    setSessionQuestions(pool.length === 0 ? [...questions] : pool);
    setCurrentQuestion(item);
    return item;
  }, [currentQuestion, sessionQuestions, questions, setSessionQuestions, setCurrentQuestion]);

  useEffect(() => {
    if (!window.localStorage.getItem(`${GAME_PATH}.currentQuestion`)) {
      popRandomQuestion();
    }
  }, [popRandomQuestion]);

  const NAV_MENU = [
    { name: "New Game", icon: "/icons/new.svg", onClick: clearCache },
    { name: showBoard ? "Hide Board" : "Show Board", icon: "/icons/board.svg", onClick: () => setShowBoard((v) => !v) },
    { name: "Full screen", icon: "/icons/full-screen.svg", onClick: fullScreenHandle.enter },
    { name: "Rules", icon: "/icons/book.svg", onClick: () => setShowRules(true) },
    { name: "Clear cache", icon: "/icons/broom.svg", onClick: clearCache },
  ];

  const onReveal = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      answerRevealed: true,
      gameOver: prev.round >= ROUNDS_PER_GAME,
    }));
  }, [setGameState]);

  const onNext = useCallback(() => {
    popRandomQuestion();
    setGameState((prev) => ({ ...prev, round: prev.round + 1, answerRevealed: false }));
  }, [popRandomQuestion, setGameState]);

  const onChangeQuestion = useCallback(() => {
    popRandomQuestion();
    setGameState((prev) => ({ ...prev, answerRevealed: false, gameOver: false }));
  }, [popRandomQuestion, setGameState]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      if (gameState.gameOver) {
        clearCache();
      } else if (!gameState.answerRevealed) {
        onReveal();
      } else {
        onNext();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState.answerRevealed, gameState.gameOver, onReveal, onNext]);

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
      <FullScreen handle={fullScreenHandle}>
        <main className="flex flex-col pt-16 min-h-screen items-center px-4 pb-8">
          <div className="w-full max-w-2xl mt-4 flex flex-col gap-4">
            <p className="text-gray-400 text-sm font-medium">
              Round {gameState.round} of {ROUNDS_PER_GAME}
            </p>
            <div className="bg-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Question</p>
              <h2 className="text-xl font-bold text-white leading-snug">
                {currentQuestion?.question}
              </h2>
              <button
                onClick={onChangeQuestion}
                className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Change question
              </button>
            </div>
            {!gameState.answerRevealed && (
              <Button onClick={onReveal} className="text-lg py-3 px-6 w-fit self-start">
                Reveal Answer
              </Button>
            )}
            {gameState.answerRevealed && (
              <>
                <div className="bg-green-950 border border-green-700 rounded-xl p-5">
                  <p className="text-green-500 text-xs uppercase tracking-widest mb-1">Answer</p>
                  <h3 className="text-3xl font-black text-green-300">{currentQuestion?.answer}</h3>
                  {currentQuestion?.funFact && (
                    <p className="text-green-600 text-sm mt-2">{currentQuestion.funFact}</p>
                  )}
                </div>
                {gameState.gameOver ? (
                  <>
                    <p className="text-white font-medium">
                      That&apos;s the end of 7 rounds. Whoever has the most chips wins!
                    </p>
                    <Button onClick={clearCache} className="text-lg py-3 px-6 w-fit self-start">
                      New Game
                    </Button>
                  </>
                ) : (
                  <Button onClick={onNext} className="text-lg py-3 px-6 w-fit self-start">
                    Next Round
                  </Button>
                )}
              </>
            )}
            {showBoard && (
              <div className="flex flex-col items-center gap-2">
                <BettingBoard />
                <button
                  onClick={() => setShowBoard(false)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Hide board
                </button>
              </div>
            )}
            {!showBoard && (
              <button
                onClick={() => setShowBoard(true)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors self-start"
              >
                Show board
              </button>
            )}
          </div>
        </main>
      </FullScreen>
    </>
  );
}
