"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import JustOneQuestion from "./JustOneQuestion";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { MainProps } from "../global/Types";
import { usePopRandomQuestion } from "../global/Utils";
import BigButton from "../components/BigButton";
import Rules from "../components/Rules";

export default function Main({ questions }: MainProps) {
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
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
      />
      <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        {currentQuestion && <JustOneQuestion question={currentQuestion} />}
      </main>
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
        <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
          <BigButton onClick={() => popRandomQuestion()}>Next</BigButton>
        </div>
      </div>
    </>
  );
}
