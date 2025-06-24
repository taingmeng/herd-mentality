"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import BigButton from "../components/BigButton";
import { MainProps, Question } from "../global/Types";
import { GAME_NAME, GAME_PATH, ICON_PATH } from "./Constants";
import Rules from "../components/Rules";
import WavelengthSlider from "./WavelengthSlider";
import Loader from "../components/Loader";
import confetti from "canvas-confetti";

export const dynamic = "force-dynamic";

export default function Main({ questions }: MainProps) {
  const WIDTH = 40;
  const [sessionQuestions, setSessionQuestions, clearSessionQuestions] =
    useLocalStorage<Question[]>(`${GAME_PATH}.questions`, questions);

  const [sessionScore, setSessionScore, clearSessionScore] =
    useLocalStorage<number>(`${GAME_PATH}.score`, 0);

  const [roundState, setRoundState, clearRoundState] = useLocalStorage<string>(
    `${GAME_PATH}.roundState`,
    "new"
  );

  const [currentQuestion, setCurrentQuestion, clearCurrentQuestion] =
    useLocalStorage<Question | null>(`${GAME_PATH}.currentQuestion`, null);

  const [hiddenValue, setHiddenValue, clearHiddenValue] =
    useLocalStorage<number>(`${GAME_PATH}.hiddenValue`, 0);
  const [showMarkers, setShowMarkers, clearShowMarkers] =
    useLocalStorage<boolean>(`${GAME_PATH}.showMarkers`, false);
  const [currentRound, setCurrentRound, clearCurrentRound] =
    useLocalStorage<number>(`${GAME_PATH}.currentRound`, 1);

  const [showRules, setShowRules] = useState(false);
  const [currentValue, setCurrentValue] = useLocalStorage<number>(
    `${GAME_PATH}.currentValue`,
    0
  );

  function clearCache() {
    clearSessionQuestions();
    clearSessionScore();
    clearRoundState();
    clearCurrentQuestion();
    clearHiddenValue();
    clearShowMarkers();
  }

  const randomHiddenValue = useCallback(() => {
    const randomValue =
      WIDTH / 2 + Math.floor(Math.random() * (1000 - WIDTH / 2 + 1));
    setHiddenValue(randomValue); // Set a random hidden value between 0 and 1000
  }, [setHiddenValue, hiddenValue]);

  const popRandomItem = useCallback((): Question => {
    const randomIndex = Math.floor(Math.random() * sessionQuestions.length); // Get a random index
    let item = sessionQuestions[randomIndex]; // Get the item at that index
    sessionQuestions.splice(randomIndex, 1); // Remove the item from the array
    if (currentQuestion && item.word === currentQuestion.word) {
      // If the popped item is the same as the current question, pop again
      item = popRandomItem();
    }
    setSessionQuestions([...sessionQuestions]); // Update the session questions in local storage

    if (sessionQuestions.length === 0) {
      // If no more questions are left, reset the session questions
      setSessionQuestions([...questions]); // Reset to the original questions
    }
    setCurrentQuestion(item); // Set the current question to the popped item

    randomHiddenValue(); // Set a random hidden value
    setCurrentValue(500); // Reset current value to a default (e.g., 500)
    setShowMarkers(true); // Hide markers initially
    setRoundState("new"); // Reset round state to "new"
    if (roundState === "revealed") {
      setCurrentRound(currentRound + 1); // Increment current round
    }

    return item;
  }, [
    currentQuestion,
    sessionQuestions,
    questions,
    setSessionQuestions,
    setCurrentQuestion,
    randomHiddenValue,
    setCurrentRound,
    currentRound,
    roundState,
  ]);

  useEffect(() => {
    // Initialize the first question when the component mounts
    if (!window.localStorage.getItem(`${GAME_PATH}.currentQuestion`)) {
      popRandomItem();
    }
  }, [popRandomItem]);

  const startNewGame = useCallback(() => {
    setSessionScore(0);
    setRoundState("new");
    setCurrentRound(1);
    popRandomItem();
  }, [setSessionScore, setRoundState, popRandomItem, setCurrentRound]);

  const NAV_MENU: NavMenu[] = [
    {
      name: "New game",
      icon: "/icons/new.svg",
      onClick: startNewGame,
    },
    {
      name: "Rules",
      icon: "/icons/rules.svg",
      onClick: setShowRules.bind(null, true),
    },
    {
      name: "Clear cache",
      icon: "/icons/clear.svg",
      onClick: clearCache,
    },
  ];

  useEffect(() => {
    // Reset the round state when the component mounts
    if (roundState === "playing") {
      setShowMarkers(false);
      setCurrentValue(500); // Reset current value to a default (e.g., 500)
    }
    if (roundState === "revealed") {
      setShowMarkers(true);
    }
  }, [roundState, setRoundState, setCurrentValue]);

  const reveal = useCallback(() => {
    if (roundState === "new") {
      setRoundState("playing");
      return;
    }
    if (roundState === "playing") {
      setRoundState("revealed");
      if (Math.abs(currentValue - hiddenValue) <= WIDTH / 2) {
        setSessionScore(sessionScore + 4);
        celebration();
      } else if (Math.abs(currentValue - hiddenValue) <= WIDTH / 2 + WIDTH) {
        setSessionScore(sessionScore + 3);
      } else if (
        Math.abs(currentValue - hiddenValue) <=
        WIDTH / 2 + WIDTH * 2
      ) {
        setSessionScore(sessionScore + 2);
      }
    }
  }, [
    roundState,
    setRoundState,
    currentValue,
    hiddenValue,
    sessionScore,
    setSessionScore,
  ]);

  const celebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6,
      },
    });
  }, []);

  return (
    <>
      <Navbar title={GAME_NAME} menus={NAV_MENU} iconFilePath={ICON_PATH} />
      <Rules
        gameName={GAME_NAME}
        gamePath={GAME_PATH}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <main className="flex flex-col min-h-[80vh] items-center justify-center overflow-hidden">
        {!currentQuestion && <Loader />}
        {currentQuestion && (
          <>
            <div>
              <h3>Round {currentRound}</h3>
            </div>
            <h1>{sessionScore}</h1>
            <div className=" w-full max-w-5xl flex flex-row items-center justify-center px-16">
              {currentQuestion.word.split(" - ").map((word, index) => {
                const left = `bg-pink-950 rounded-s-lg text-left`;
                const right = `bg-pink-700 rounded-e-lg text-right`;
                return (
                  <div
                    key={index}
                    className={`${index === 0 ? left : right} w-full h-32 gap-2 p-4 text-2xl font-bold text-white`}
                  >
                    {index === 0 ? <div>←</div> : <div>→</div>}
                    <span>{word.trim()}</span>
                  </div>
                );
              })}
            </div>

            <WavelengthSlider
              disabled={roundState !== "playing"}
              currentValue={currentValue}
              hiddenValue={hiddenValue}
              showMarkers={showMarkers}
              onChange={setCurrentValue}
            />
          </>
        )}

        <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
          <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
            {roundState !== "revealed" && (
              <BigButton onClick={() => reveal()}>
                {roundState === "new" ? "Start" : "Reveal"}
              </BigButton>
            )}
            {roundState !== "playing" && (
              <BigButton onClick={() => popRandomItem()}>Next</BigButton>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
