"use client";

import { useState } from "react";
import Button from "../components/Button";

interface JustOneQuestionProps {
  question: string;
}

export default function JustOneQuestion({ question }: JustOneQuestionProps) {
  const [visible, setVisible] = useState(true);
  const buttonTitle = visible ? "Hide" : "Show";
  return (
    <>
      <div className="relative flex flex-col place-items-center mb-24">
        {visible && question && (
          <h2 className="mb-3 text-3xl font-semibold text-center">
            {question}
          </h2>
        )}

        {!visible && question && (
          <h2 className="mb-3 text-3xl font-semibold text-center">________</h2>
        )}
      </div>
      <Button onClick={() => setVisible(!visible)}>{buttonTitle}</Button>
    </>
  );
}
