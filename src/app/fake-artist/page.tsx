import React from "react";
import path from "path";
import csv from "csvtojson";
import { FaBook } from 'react-icons/fa';
import { doc, onSnapshot } from "firebase/firestore";
import NextButton from "../components/NextButton";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import JustOneQuestion from "./JustOneQuestion";
import { getData } from "../../firebase/firebaseService";

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

export default function FakeArtist() {
  const unsub = onSnapshot(getData("12345"),   { includeMetadataChanges: true }, 
  (doc) => {
    
  });
  const questionPath = path.join(process.cwd(), 'src/data/just-one/questions.csv');
  const questions: Question[] = await csv().fromFile(questionPath);
  
  const map: { [key: string]: number} = {};
  for (const q of questions) {
    map[q.question] = (map[q.question] || 0) + 1;
  }
  // console.log(map)
  for (const entry of Object.entries(map)) {
    if (entry[1] > 1) {
      console.log(entry[0], entry[1]);
    }
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  const currentQuestion = questions[randomIndex];

  return (
    <>
      <Navbar title="Fake Artist" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        
        <JustOneQuestion question={currentQuestion.question} />
      </main>
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <div className="fixed h-24 bottom-0 left-0 right-0 flex items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
          <NextButton />
        </div>
      </div>
    </>
  );
}