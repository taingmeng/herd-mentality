"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Question {
  category: string;
  question: string;
  options: string | undefined;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(0);
  useEffect(() => {
    fetch("/api/questions")
      .then((response) => response.json())
      .then((response) => {
        setQuestions(response.data);
      });
  }, [setQuestions]);
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setIndex(randomIndex);
  }, [setIndex, questions]);

  const onNextClick = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setIndex(randomIndex);
  }, [questions, setIndex]);
  const currentQuestion = questions[index];
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 py-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center content-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          🐮 Herd Mentality
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative z-[-1] flex flex-col place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        {currentQuestion && (
          <h3 className="mb-3 text-2l font-semibold relative">
            {currentQuestion.category}
          </h3>
        )}
        {currentQuestion && (
          <h2 className="mb-3 text-3xl font-semibold relative text-center">
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
                  className="group rounded-lg border border-transparent px-5 py-4 m-4 bg-gray-300 align-middle"
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

      <div className="mb-32 grid text-center">
        <div
          className="group rounded-lg border border-transparent px-5 py-4 bg-gray-200 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 active:border-blue-400 active:bg-blue-100 cursor-pointer"
          onClick={onNextClick}
        >
          <h2 className="text-2xl font-semibold">
            Next
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </div>
      </div>
    </main>
  );
}