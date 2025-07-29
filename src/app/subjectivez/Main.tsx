"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import BigButton from "../components/BigButton";
import { MainProps, Question } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import { usePopRandomQuestion } from "../global/Utils";

export const dynamic = "force-dynamic";

export default function Main({ questions }: MainProps) {
  
  const { currentQuestion, popRandomQuestion, clearSessionQuestions } = usePopRandomQuestion(
    GAME_PATH,
    questions
  );
  const [showRules, setShowRules] = useState(false);

  function clearCache() {
    clearSessionQuestions;
  }

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
      <Navbar title={GAME_NAME} menus={NAV_MENU} iconFilePath={GAME_ICON_PATH} />
      <Rules gameName={GAME_NAME} gamePath={GAME_PATH} visible={showRules} onClose={() => setShowRules(false)} />
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
            <BigButton onClick={() => popRandomQuestion()}>Next</BigButton>
          </div>
        </div>
      </main>
    </>
  );
}
