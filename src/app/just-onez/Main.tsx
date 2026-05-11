"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import JustOneQuestion from "./JustOneQuestion";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { MainProps } from "../global/Types";
import { usePopRandomQuestion } from "../global/Utils";
import BigButton from "../components/BigButton";
import Rules from "../components/Rules";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useAuth } from "@/firebase/AuthContext";
import { startGamePlay, endGamePlay } from "@/firebase/firebaseService";

const QUESTIONS_PER_PLAY = 10;

export default function Main({ questions }: MainProps) {
  const { currentQuestion, popRandomQuestion, clearSessionQuestions } = usePopRandomQuestion(
    GAME_PATH,
    questions
  );
  const [showRules, setShowRules] = useState(false);
  const fullScreenHandle = useFullScreenHandle();

  const { user } = useAuth();
  const playIdRef = useRef<string | null>(null);
  const questionCountRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    questionCountRef.current = 0;
    startGamePlay(user.uid, GAME_PATH).then((id) => {
      playIdRef.current = id;
    });
  }, [user]);

  const handleNext = useCallback(() => {
    popRandomQuestion();
    if (!user) return;
    questionCountRef.current += 1;
    if (questionCountRef.current >= QUESTIONS_PER_PLAY) {
      const id = playIdRef.current;
      if (id) endGamePlay(user.uid, GAME_PATH, id);
      questionCountRef.current = 0;
      startGamePlay(user.uid, GAME_PATH).then((newId) => {
        playIdRef.current = newId;
      });
    }
  }, [popRandomQuestion, user]);

  function clearCache() {
    clearSessionQuestions();
  }

  const NAV_MENU = [
    {
      name: "Full screen",
      icon: "/icons/full-screen.svg",
      onClick: fullScreenHandle.enter,
    },
    {
      name: "Rules",
      icon: "/icons/book.svg",
      onClick: setShowRules.bind(null, true),
    },
    {
      name: "Clear cache",
      icon: "/icons/broom.svg",
      onClick: clearCache,
    },
  ];

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
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        {currentQuestion && <JustOneQuestion question={currentQuestion} />}
      </main>
      </FullScreen>
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
        <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
          <BigButton onClick={handleNext}>Next</BigButton>
        </div>
      </div>
    </>
  );
}
