"use client";

import { useCallback, useRef, useState, ChangeEvent, useEffect } from "react";
import useSound from "use-sound";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import { MainProps } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import useLocalStorage from "../hooks/useLocalStorage";
import bubblePopSoundFile from "@/assets/bubble-pop.mp3";
import bonusSoundFile from "@/assets/bonus.mp3";
import wrongSoundFile from "@/assets/wrong.mp3";
import confetti from "canvas-confetti";
import {
  generateRandom7x7Grid,
  countUniqueClusterShapes,
  allClustersConnected,
} from "./utils/ClusterUtil";
import Button from "../components/Button";

enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

interface GameState {
  gameState: string;
  grid: number[][];
  moves: number;
  uniqueShapes: number;
  score: number;
  centerEmpty: boolean;
  uniqueShapeMultiplier: number;
  difficulty: Difficulty;
  logs: string[];
  continuePlaying: boolean;
}

const defaultGameState = {
  gameState: "new",
  grid: Array.from({ length: 7 }, () => Array(7).fill(0)),
  moves: 0,
  uniqueShapes: 0,
  score: 0,
  centerEmpty: true,
  uniqueShapeMultiplier: 6,
  difficulty: Difficulty.Easy,
  logs: ["3,3"],
  continuePlaying: false,
};

const difficultyLevels = {
  [Difficulty.Easy]: { multiplier: 6, name: "Easy" },
  [Difficulty.Medium]: { multiplier: 5, name: "Medium" },
  [Difficulty.Hard]: { multiplier: 4, name: "Hard" },
};
const colors = [
  "bg-gray-950",
  "bg-red-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-pink-300",
  "bg-purple-500",
  "bg-white",
  "bg-gray-500",
];

const MAX_MOVES = 50;
export default function Main() {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    defaultGameState
  );

  const [showRules, setShowRules] = useState(false);
  const [playBubblePopSound] = useSound(bubblePopSoundFile);
  const [playBonusSound] = useSound(bonusSoundFile);
  const [playWrongSound] = useSound(wrongSoundFile);
  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    setGameState({ ...defaultGameState, grid: generateRandom7x7Grid() });
  }

  const newGame = useCallback(() => {
    setGameState({
      ...defaultGameState,
      grid: generateRandom7x7Grid(),
      gameState: "playing",
    });
  }, [setGameState]);

  const onSwap = useCallback(
    (rowIndex: number, colIndex: number) => {
      playBubblePopSound();
      let zeroRowIndex = -1;
      let zeroColIndex = -1;
      const grid = gameState.grid;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] === 0) {
            zeroRowIndex = i;
            zeroColIndex = j;
            break;
          }
        }
      }
      if (zeroRowIndex === -1 || zeroColIndex === -1) {
        return; // No empty space found
      }
      // Swap the clicked cell with the empty space
      const newGrid = [...gameState.grid];
      const currentValue = newGrid[rowIndex][colIndex];
      newGrid[rowIndex][colIndex] = 0;
      newGrid[zeroRowIndex][zeroColIndex] = currentValue; // Move the empty space

      const logs = [...gameState.logs, `${rowIndex},${colIndex}`];

      const isValid = allClustersConnected(newGrid);
      if (isValid) {
        const uniqueShapes = countUniqueClusterShapes(newGrid);
        const centerEmpty = rowIndex === 3 && colIndex === 3;
        setGameState({
          ...gameState,
          gameState: "ended",
          grid: newGrid,
          moves: gameState.moves + 1,
          uniqueShapes,
          centerEmpty,
          score:
            uniqueShapes * difficultyLevels[gameState.difficulty].multiplier +
            (centerEmpty ? 5 : 0) -
            (gameState.moves + 1),
          logs,
          continuePlaying: false,
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            y: 0.6,
          },
        });
        playBonusSound();
        return;
      }

      if (gameState.moves + 1 >= MAX_MOVES && !gameState.continuePlaying) {
        setGameState({
          ...gameState,
          gameState: "failed",
          grid: newGrid,
          moves: gameState.moves + 1,
          logs,
        });
        playWrongSound();
        return;
      }

      setGameState({
        ...gameState,
        gameState: "playing",
        grid: newGrid,
        moves: gameState.moves + 1,
        logs,
      });
    },
    [
      gameState,
      setGameState,
      playBubblePopSound,
      playWrongSound,
      playBonusSound,
    ]
  );

  const onUndo = useCallback(() => {
    playBubblePopSound();
    if (gameState.moves > 0) {
      const newLogs = gameState.logs.slice(0, -1); // Remove the last move
      const newGrid = [...gameState.grid];
      const lastMove = newLogs[newLogs.length - 1];
      const [rowIndex, colIndex] = lastMove.split(",").map(Number);
      let zeroRowIndex = -1;
      let zeroColIndex = -1;
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
          if (newGrid[i][j] === 0) {
            zeroRowIndex = i;
            zeroColIndex = j;
            break;
          }
        }
      }
      if (zeroRowIndex === -1 || zeroColIndex === -1) {
        return; // No empty space found
      }
      // Swap the clicked cell with the empty space
      newGrid[zeroRowIndex][zeroColIndex] = newGrid[rowIndex][colIndex]; // Move the empty space back
      newGrid[rowIndex][colIndex] = 0;

      setGameState({
        ...gameState,
        gameState: "playing",
        grid: newGrid,
        moves: gameState.moves - 1,
        logs: newLogs,
      });
      if (gameState.moves - 1 === 0) {
        setGameState({
          ...gameState,
          gameState: "playing",
          moves: 0,
          logs: ["3,3"],
        });
      }
    }
  }, [gameState, playBubblePopSound]);

  const onSwitchDifficulty = useCallback(() => {
    playBubblePopSound();
    const levels = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
    const index = levels.indexOf(gameState.difficulty);
    const nextIndex = (index + 1) % levels.length;
    if (gameState.gameState === "ended") {
      setGameState({
        ...gameState,
        difficulty: levels[nextIndex],
        score:
          gameState.uniqueShapes *
            difficultyLevels[levels[nextIndex]].multiplier +
          (gameState.centerEmpty ? 5 : 0) -
          gameState.moves,
      });
    }
  }, [gameState, setGameState, playBubblePopSound]);

  const onContinuePlaying = useCallback(() => {
    playBubblePopSound();
    setGameState({
      ...gameState,
      continuePlaying: true,
    });
  }, [gameState, setGameState, playBubblePopSound]);

  const NAV_MENU: NavMenu[] = [
    {
      name: "Full screen",
      icon: "/full-screen.svg",
      onClick: fullScreenHandle.enter,
    },
    {
      name: "New Game",
      icon: "/icons/new.svg",
      onClick: newGame,
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
      <FullScreen className="fullscreen-enabled-body" handle={fullScreenHandle}>
        <main className="mt-12 flex flex-col min-h-[80vh] items-center">
          <div className="flex flex-col items-center w-full max-w-5xl items-center justify-center overflow-y-auto p-4">
            <div className="flex items-between items-center justify-between gap-4">
              {(gameState.gameState === "failed" ||
                gameState.gameState === "playing") && (
                <h3>
                  Moves: {gameState.moves} / {gameState.continuePlaying ? "∞" : MAX_MOVES}
                </h3>
              )}
              {gameState.gameState === "ended" && (
                <>
                  <h3>
                    Unique: {gameState.uniqueShapes} x{" "}
                    {difficultyLevels[gameState.difficulty].multiplier}
                  </h3>
                  <h3> + </h3>
                  <h3>Center bonus: {gameState.centerEmpty ? "5" : "0"}</h3>
                  <h3>-</h3>
                  <h3>Moves: {gameState.moves}</h3>
                  <h3>=</h3>
                  <h3>Score: {gameState.score}</h3>
                  <h3>{gameState.score > 0 ? "You win!" : "You lose!"}</h3>
                </>
              )}
            </div>
            {gameState.grid.length > 0 && (
              <div className="flex flex-col gap-2 p-4">
                {gameState.grid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-20 h-20 flex items-center justify-center border bg-gray-900"
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${colors[cell]} flex items-center justify-center`}
                          onClick={() =>
                            gameState.gameState === "playing" ||
                            gameState.continuePlaying
                              ? onSwap(rowIndex, colIndex)
                              : undefined
                          }
                        >
                          {}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              {gameState.moves > 0 && (
                <Button onClick={() => onUndo()}>Undo</Button>
              )}
              {gameState.gameState === "ended" && (
                <Button onClick={() => onSwitchDifficulty()}>
                  Scoring: {difficultyLevels[gameState.difficulty].name}
                </Button>
              )}
              {gameState.gameState === "failed" && !gameState.continuePlaying && (
                <Button onClick={() => onContinuePlaying()}>
                  Continue Playing
                </Button>
              )}
              {(gameState.gameState === "new" ||
                gameState.gameState === "ended" ||
                gameState.gameState === "failed") && (
                <Button onClick={() => newGame()}>New Game</Button>
              )}
            </div>
          </div>
        </main>
      </FullScreen>
    </>
  );
}
