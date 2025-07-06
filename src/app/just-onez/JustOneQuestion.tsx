"use client";

import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Question } from "../global/Types";


export default function JustOneQuestion({ question }: { question: Question }) {
  const [visible, setVisible] = useState(true);
  const buttonTitle = visible ? "Hide" : "Show";
  useEffect(() => {
    setVisible(true);
  }, [question])
  return (
    <>
      <div className="relative flex flex-col place-items-center mb-24">
        {visible && question && (
          <h2 className="mb-3 text-5xl font-semibold text-center">
            {question.word}
          </h2>
        )}

        {!visible && question && (
          <h2 className="mb-3 text-5xl font-semibold text-center">________</h2>
        )}
      </div>
      <Button className="w-40" onClick={() => setVisible(!visible)}>{buttonTitle}</Button>
    </>
  );
}
