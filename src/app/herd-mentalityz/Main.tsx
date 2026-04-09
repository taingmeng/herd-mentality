"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import BigButton from "../components/BigButton";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { Question } from "../global/Types";
import useLocalStorage from "../hooks/useLocalStorage";
import Rules from "../components/Rules";

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
    return item;
  }, [
    currentQuestion,
    sessionQuestions,
    filteredQuestions,
    setSessionQuestions,
    setCurrentQuestion,
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
    setShowCategorySelect(false);
  };

  const onBackToCategories = () => {
    setShowCategorySelect(true);
  };

  const NAV_MENU = [
    {
      name: "Categories",
      icon: "/icons/new.svg",
      onClick: onBackToCategories,
    },
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
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
        />
        <Rules
          gamePath={GAME_PATH}
          gameName={GAME_NAME}
          visible={showRules}
          onClose={() => setShowRules(false)}
        />
        <main className="flex flex-col pt-24 pb-32 min-h-[75vh] items-center px-4">
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

          <div className="w-full max-w-md flex flex-col gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-left transition-colors cursor-pointer select-none ${
                    isSelected
                      ? "bg-pink-900 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  <span className="text-sm opacity-70">
                    {categoryCount(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </main>
        <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
          <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
            <BigButton
              onClick={onStartPlaying}
              disabled={selectedCategories.length === 0}
            >
              Play ({filteredQuestions.length} questions)
            </BigButton>
          </div>
        </div>
      </>
    );
  }

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
