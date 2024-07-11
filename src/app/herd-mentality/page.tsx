import React from "react";
import path from "path";
import csv from "csvtojson";
import { FaBook } from 'react-icons/fa';
import NextButton from "../components/NextButton";
import Navbar from "../components/Navbar";

interface Question {
  category: string;
  question: string;
  options: string | undefined;
}

export const dynamic = "force-dynamic";

const shuffle = (array: any[]) => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const NAV_MENU = [
  {
    name: "Rules",
    icon: "/book.svg",
    href: "/herd-mentality/rules",
  },
];

export default async function Home() {
  const questionPath = path.join(process.cwd(), 'src/data/herd-mentality/questions.csv');
  const questions: Question[] = await csv().fromFile(questionPath);
  const randomIndex = Math.floor(Math.random() * questions.length);
  const currentQuestion = questions[randomIndex];

  return (
    <>
      <Navbar title="Herd Party" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        <div className="relative flex flex-col place-items-center mb-24">
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
              {shuffle(currentQuestion.options
                .split(" - ")
                .filter((option) => option.trim().length > 0))
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
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
          <div className="fixed h-24 bottom-0 left-0 right-0 p-4 flex items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
            <NextButton />
          </div>
        </div>
    </>
  );
}
