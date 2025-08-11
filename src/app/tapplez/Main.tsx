"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import BigButton from "../components/BigButton";
import { MainProps } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import { usePopRandomQuestion } from "../global/Utils";
import useLocalStorage from "../hooks/useLocalStorage";
import Round from "../components/Round";
import CircularTimer, {
  CircularTimerRefProps,
} from "../components/CircularTimer";
import rightSoundFile from "@/assets/right.mp3";
import bubblePopSoundFile from "@/assets/bubble-pop.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";

export const dynamic = "force-dynamic";

const ALPHABETS = "ABCDEFGHIJKLMNOPRSTW";

interface GameState {
  currentRound: number;
  usedAlphabets: string;
  correctCount: number;
  gameState: string;
}

export default function Main({ questions }: MainProps) {
  const { currentQuestion, popRandomQuestion, clearSessionQuestions } =
    usePopRandomQuestion(GAME_PATH, questions);
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    {
      currentRound: 1,
      usedAlphabets: "",
      correctCount: 0,
      gameState: "new",
    }
  );

  const [showRules, setShowRules] = useState(false);
  const [playRightSound] = useSound(rightSoundFile);
  const [playBubblePopSound] = useSound(bubblePopSoundFile);
  const [playTimesUpSound] = useSound(timesUpSoundFile);
  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    clearSessionQuestions();
  }
  const timerRef = useRef<CircularTimerRefProps>(null);

  const NAV_MENU: NavMenu[] = [
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

  useEffect(() => {
    if (gameState.usedAlphabets.length >= ALPHABETS.length) {
      setGameState((prevState) => ({
        ...prevState,
        usedAlphabets: "",
        gameState: "paused",
        correctCount: 0,
        currentRound: prevState.currentRound + 1,
      }));
      timerRef.current?.reset();
      playTimesUpSound();
    }
  }, [gameState, setGameState]);

  const alphabetClicked = useCallback(
    (letter: string) => {
      if (gameState.usedAlphabets.includes(letter)) {
        return;
      }

      if (gameState.correctCount + 1 >= gameState.currentRound) {
        setGameState((prevState) => ({
          ...prevState,
          correctCount: 0,
          usedAlphabets: prevState.usedAlphabets + letter,
        }));
        timerRef.current?.reset();
        timerRef.current?.go();
        playRightSound();
      } else {
        setGameState((prevState) => ({
          ...prevState,
          correctCount: prevState.correctCount + 1,
          usedAlphabets: prevState.usedAlphabets + letter,
        }));
        playBubblePopSound();
      }
    },
    [playRightSound, setGameState, gameState]
  );

  const resetRound = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      currentRound: 1,
      usedAlphabets: "",
      gameState: "new",
    }));
  }, [setGameState]);

  const onNext = useCallback(() => {
    popRandomQuestion();
    resetRound();
    timerRef.current?.go();
    timerRef.current?.reset();
  }, []);

  const onStart = useCallback(() => {
    timerRef.current?.go();
    setGameState((prevState) => ({
      ...prevState,
      currentRound: 1,
      usedAlphabets: "",
      gameState: "playing",
    }));
  }, [resetRound, setGameState]);

  const onPause = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gameState: "paused",
    }));
    timerRef.current?.pause();
  }, [setGameState]);

  const onUndo = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      usedAlphabets: prevState.usedAlphabets.slice(0, -1),
    }));
  }, [setGameState]);

  const onResume = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gameState: "playing",
    }));
    timerRef.current?.go();
  }, [setGameState]);

  const onTimerEnded = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      correctCount: 0,
      gameState: "paused",
    }));
    timerRef.current?.reset();
  }, [setGameState]);

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
        <main className="mt-20 flex flex-col min-h-[80vh] items-center">
          <div className="flex items-between w-full max-w-4xl items-center justify-between px-16">
            <div className="px-8">
              <CircularTimer
                ref={timerRef}
                duration={10}
                onEnded={onTimerEnded}
                tickSoundStartAt={5}
              />
            </div>
            <div className="flip-card text-center w-40 h-40">
              <div className="flip-card-front flex">
                <h3 className="flex-1 flex rounded rounded-2xl bg-pink-950 m-4 items-center justify-center text-white text-2xl select-none">
                  {currentQuestion && currentQuestion.word}
                </h3>
              </div>
            </div>
            <Round round={gameState.currentRound} />
          </div>
          <div className="w-full grid grid-cols-4 md:grid-cols-5 gap-4 justify-center items-center mt-4 px-8">
            {ALPHABETS.split("").map((letter, index) => (
              <div
                key={index}
                className="w-full h-[10vh] bg-pink-700 rounded-lg text-white flex items-center justify-center text-5xl font-bold  select-none"
                onClick={() => alphabetClicked(letter)}
                style={{
                  color: gameState.usedAlphabets.includes(letter)
                    ? "#a30049"
                    : "#fff",
                  backgroundColor: gameState.usedAlphabets.includes(letter)
                    ? gameState.gameState == "playing"
                      ? "#400020"
                      : "#240213"
                    : gameState.gameState == "playing"
                      ? "#7d0147"
                      : "#420528",
                  cursor: gameState.usedAlphabets.includes(letter)
                    ? "not-allowed"
                    : "pointer",
                  pointerEvents:
                    gameState.gameState === "playing" ? "auto" : "none",
                }}
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
            <div className="fixed flex h-24 bottom-4 pb-4 gap-4 mb-4 left-0 right-0 p-4 justify-center">
              {gameState.gameState === "new" && (
                <>
                  <BigButton onClick={() => onStart()}>Start</BigButton>
                  <BigButton onClick={() => onNext()}>New</BigButton>
                </>
              )}
              {gameState.gameState === "playing" && (
                <BigButton onClick={() => onPause()}>Pause</BigButton>
              )}
              {gameState.gameState === "paused" && (
                <>
                  <div className="flex-1">
                    <BigButton onClick={() => onUndo()}>Undo</BigButton>
                  </div>
                  <div className="flex-auto">
                    <BigButton onClick={() => onResume()}>Resume</BigButton>
                  </div>
                  <div className="flex-1">
                    <BigButton onClick={() => onNext()}>New</BigButton>
                  </div>
                </>
              )}
              {gameState.gameState === "end" && (
                <BigButton onClick={() => onNext()}>Next</BigButton>
              )}
            </div>
          </div>
        </main>
      </FullScreen>
    </>
  );
}
