"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import BigButton from "../components/BigButton";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { Question } from "../global/Types";
import useLocalStorage from "../hooks/useLocalStorage";
import Rules from "../components/Rules";
import { useAuth } from "@/firebase/AuthContext";
import { startGamePlay, endGamePlay } from "@/firebase/firebaseService";

const QUESTIONS_PER_PLAY = 20;

export default function Main({ questions }: { questions: Question[] }) {
  const categories = useMemo(
    () => [...new Set(questions.map((q) => q.category))],
    [questions]
  );

  const [selectedCategories, setSelectedCategories] = useLocalStorage<string[]>(
    `${GAME_PATH}.selectedCategories`,
    categories
  );
  const [showCategorySelect, setShowCategorySelect] = useLocalStorage<boolean>(
    `${GAME_PATH}.showCategorySelect`,
    true
  );
  const [showRules, setShowRules] = useState(false);

  const filteredQuestions = useMemo(
    () => questions.filter((q) => selectedCategories.includes(q.category)),
    [questions, selectedCategories]
  );

  const [sessionQuestions, setSessionQuestions] = useLocalStorage<Question[]>(
    `${GAME_PATH}.questions`,
    filteredQuestions
  );
  const [currentQuestion, setCurrentQuestion] =
    useLocalStorage<Question | null>(`${GAME_PATH}.currentQuestion`, null);

  const { user } = useAuth();
  const playIdRef = useRef<string | null>(null);
  const questionCountRef = useRef(0);

  const popRandomQuestion = useCallback(() => {
    let pool = sessionQuestions.length > 0 ? sessionQuestions : [...filteredQuestions];

    const randomIndex = Math.floor(Math.random() * pool.length);
    let item = pool[randomIndex];
    pool.splice(randomIndex, 1);

    while (currentQuestion && item && item.word === currentQuestion.word && pool.length > 0) {
      const ri = Math.floor(Math.random() * pool.length);
      item = pool[ri];
      pool.splice(ri, 1);
    }

    if (pool.length === 0) {
      setSessionQuestions([...filteredQuestions]);
    } else {
      setSessionQuestions([...pool]);
    }
    setCurrentQuestion(item);

    if (user) {
      questionCountRef.current += 1;
      if (questionCountRef.current >= QUESTIONS_PER_PLAY) {
        const id = playIdRef.current;
        if (id) endGamePlay(user.uid, GAME_PATH, id);
        questionCountRef.current = 0;
        startGamePlay(user.uid, GAME_PATH).then((newId) => {
          playIdRef.current = newId;
        });
      }
    }

    return item;
  }, [
    currentQuestion,
    sessionQuestions,
    filteredQuestions,
    setSessionQuestions,
    setCurrentQuestion,
    user,
  ]);

  useEffect(() => {
    if (
      !showCategorySelect &&
      !window.localStorage.getItem(`${GAME_PATH}.currentQuestion`)
    ) {
      popRandomQuestion();
    }
  }, [showCategorySelect, popRandomQuestion]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const selectAll = () => setSelectedCategories([...categories]);
  const deselectAll = () => setSelectedCategories([]);

  const onStartPlaying = () => {
    if (selectedCategories.length === 0) return;
    const newFiltered = questions.filter((q) =>
      selectedCategories.includes(q.category)
    );
    setSessionQuestions([...newFiltered]);
    setCurrentQuestion(null);
    window.localStorage.removeItem(`${GAME_PATH}.currentQuestion`);
    if (user) {
      questionCountRef.current = 0;
      startGamePlay(user.uid, GAME_PATH).then((id) => {
        playIdRef.current = id;
      });
    }
    setShowCategorySelect(false);
  };

  const onBackToCategories = () => {
    setShowCategorySelect(true);
  };

  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    Object.keys(localStorage).filter(k => k.startsWith(GAME_PATH + '.')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  const NAV_MENU = [
    {
      name: "New Game",
      icon: "/icons/new.svg",
      onClick: onBackToCategories,
    },
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

  const categoryCount = (category: string) =>
    questions.filter((q) => q.category === category).length;

  if (showCategorySelect) {
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
        <main className="flex flex-col pt-24 pb-8 min-h-[75vh] items-center px-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            Select Categories
          </h2>
          <p className="text-gray-400 mb-4 text-sm">
            {selectedCategories.length} of {categories.length} selected
            {" · "}
            {filteredQuestions.length} questions
          </p>

          <div className="flex gap-2 mb-4">
            <button
              className="px-4 py-1.5 text-sm rounded-lg bg-gray-700 text-gray-300 cursor-pointer select-none hover:bg-gray-600"
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              className="px-4 py-1.5 text-sm rounded-lg bg-gray-700 text-gray-300 cursor-pointer select-none hover:bg-gray-600"
              onClick={deselectAll}
            >
              Deselect All
            </button>
          </div>

          <div className="w-full max-w-md grid grid-cols-4 gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg font-medium text-center transition-colors cursor-pointer select-none ${
                    isSelected
                      ? "bg-pink-900 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="text-sm leading-tight">{category}</span>
                  <span className="text-xs opacity-70">
                    {categoryCount(category)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full max-w-md mt-4">
            <BigButton
              onClick={onStartPlaying}
              disabled={selectedCategories.length === 0}
            >
              Play
            </BigButton>
          </div>
        </main>
        </FullScreen>
      </>
    );
  }

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
      </FullScreen>
    </>
  );
}
