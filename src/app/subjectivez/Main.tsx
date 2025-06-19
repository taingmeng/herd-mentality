"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import BigButton from "../components/BigButton";
import Rules from "./Rules";

export const dynamic = "force-dynamic";

interface MainProps {
  questions: Question[];
}

export interface Question {
  category: string;
  word: string;
}

export default function Main({ questions }: MainProps) {
  
  const [sessionQuestions, setSessionQuestions, clearSessionQuestions] =
    useLocalStorage<Question[]>("sujectivez.questions", questions);

  const [currentQuestion, setCurrentQuestion] = useState<Question>();
  const [showRules, setShowRules] = useState(false);

  function clearCache() {
    clearSessionQuestions;
  }

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
    return item;
  }, [
    currentQuestion,
    sessionQuestions,
    questions,
    setSessionQuestions,
    setCurrentQuestion,
  ]);

  useEffect(() => {
    // Initialize the first question when the component mounts
    if (!currentQuestion) {
      popRandomItem();
    }
  }, [currentQuestion, popRandomItem]);

  const NAV_MENU: NavMenu[] = [
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
    {
      name: "Clear cache",
      icon: "/book.svg",
      onClick: clearCache,
    },
  ];

  return (
    <>
      <Navbar title="Subjectivez" menus={NAV_MENU} iconFilePath="/subjectivez/subjectivez-outlined.png" />
      <Rules visible={showRules} onClose={() => setShowRules(false)} />
      <main className="flex flex-col min-h-[80vh] items-center justify-center">
        <div className="flip-card partikers text-center w-160">
          <div className="flip-card-front flex">
            <h3 className="flex-2 flex flex-col rounded mt-4 justify-center text-white">
              {currentQuestion && currentQuestion.category}
            </h3>
            <h1 className="flex-1 flex rounded rounded-2xl bg-pink-950 m-4 items-center justify-center text-white select-none">
              {currentQuestion && currentQuestion.word}
            </h1>
          </div>
        </div>

        <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
          <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
            <BigButton onClick={() => popRandomItem()}>Next</BigButton>
          </div>
        </div>
      </main>
    </>
  );
}
