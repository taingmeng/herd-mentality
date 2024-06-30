import React from "react";
import path from "path";
import csv from "csvtojson";
import { FaBook } from 'react-icons/fa';
import NextButton from "../components/NextButton";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import JustOneQuestion from "./JustOneQuestion";

interface Question {
  question: string;
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
    href: "/just-one/rules",
  },
];

export default async function JustOne() {
  const questionPath = path.join(process.cwd(), 'src/data/just-one/questions.csv');
  const questions: Question[] = await csv().fromFile(questionPath);
  const randomIndex = Math.floor(Math.random() * questions.length);
  const currentQuestion = questions[randomIndex];

  return (
    <>
      <Navbar title="Just One" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        <JustOneQuestion question={currentQuestion.question} />
      </main>
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <div className="fixed h-24 bottom-0 left-0 right-0 p-4 flex items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
          <NextButton />
        </div>
      </div>
    </>
  );
}
