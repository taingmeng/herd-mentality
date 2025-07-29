"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BigButton from "../components/BigButton";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { Question } from "../global/Types";
import { usePopRandomQuestion } from "../global/Utils";
import Rules from "../components/Rules";

export default function Main({ questions }: { questions: Question[] }) {
  const { currentQuestion, popRandomQuestion } = usePopRandomQuestion(
    GAME_PATH,
    questions
  );
  const [showRules, setShowRules] = useState(false);

    const NAV_MENU = [
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
  ];

  return (
    <>
      <Navbar title={GAME_NAME} menus={NAV_MENU} iconFilePath={GAME_ICON_PATH} />
       <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <main className="flex flex-col pt-32 min-h-[75vh] items-center justify-center">
        <div className="relative flex flex-col place-items-center mb-24">
          {currentQuestion && (
            <h3 className="mb-3 text-2l font-semibold relative">
              {currentQuestion.category}
            </h3>
          )}
          {currentQuestion && (
            <h2 className="mb-3 text-3xl font-semibold text-center">
              {currentQuestion.word}
            </h2>
          )}
        </div>
        <div></div>
      </main>
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
        <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
          <BigButton onClick={() => popRandomQuestion()}>Next</BigButton>
        </div>
      </div>
    </>
  );
}
