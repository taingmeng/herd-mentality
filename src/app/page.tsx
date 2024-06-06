"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Question {
  category: string;
  question: string;
  options: string | undefined;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(-1);

  const nextOneQuestion = useCallback(() => {
    fetch("/api/questions/next")
      .then((response) => response.text())
      .then((response) => {
        console.log("================", response);
      })
      .catch((error) => {
        console.error("Error loading next question", error);
      });
  }, []);

  const nextQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setIndex(randomIndex);
  }, [questions, setIndex]);

  useEffect(() => {
    fetch("/api/questions")
      .then((response) => response.json())
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error loading all questions", error);
      });
  }, []);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  const currentQuestion = questions[index];
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-24 justify-between overflow-hidden">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <p className="font-mono fixed left-0 top-0 flex w-full justify-center content-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          🐮 Herd Mentality
        </p>
        <div
          className="fixed h-48 bottom-4 left-4 right-4 flex lg:flex items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none"
          onClick={nextQuestion}
        >
          <div className="group w-full rounded-lg border border-transparent px-5 py-4 bg-gray-200 dark:bg-neutral-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 active:border-blue-400 active:bg-blue-100 active:dark:border-blue-400 active:dark:bg-blue-800/30 cursor-pointer text-center">
            Next
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-[-1] flex flex-col place-items-center before:absolute before:h-[300px] before:-translate-x-1/2 before:rounded-full before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:translate-x-1/3  after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        {currentQuestion && (
          <h3 className="mb-3 text-2l font-semibold relative">
            {currentQuestion.category}
          </h3>
        )}
        {currentQuestion && (
          <h2 className="mb-3 text-3xl font-semibold text-center">
            {currentQuestion.question}
          </h2>
        )}
        {currentQuestion && currentQuestion.options && (
          <div className="grid text-center grid-cols-2 lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4">
            {currentQuestion.options
              .split(" - ")
              .filter((option) => option.trim().length > 0)
              .map((option) => (
                <div
                  className="group rounded-lg border border-transparent px-5 py-4 m-4 bg-gray-300 dark:bg-neutral-800"
                  key={option}
                >
                  <h2 className="text-lg lg:text-2xl font-semibold relative text-center align-middle">
                    {option.replace("- ", "")}
                  </h2>
                </div>
              ))}
          </div>
        )}
      </div>
      <div></div>
    </main>
  );
}
