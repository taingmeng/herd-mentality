import { useCallback, useEffect } from "react";
import { Question } from "./Types";
import useLocalStorage from "../hooks/useLocalStorage";

export const usePopRandomQuestion = (
  gamePath: string,
  questions: Question[]
) => {
  const [sessionQuestions, setSessionQuestions, clearSessionQuestions] =
    useLocalStorage<Question[]>(`${gamePath}.questions`, questions);
  const [currentQuestion, setCurrentQuestion] = useLocalStorage<Question | null>(
    `${gamePath}.currentQuestion`,
    null
  );

  const popRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * sessionQuestions.length); // Get a random index
    let item = sessionQuestions[randomIndex]; // Get the item at that index
    sessionQuestions.splice(randomIndex, 1); // Remove the item from the array

    while (currentQuestion && item.word === currentQuestion.word) {
      // If the popped item is the same as the current question, pop again
      const randomIndex = Math.floor(Math.random() * sessionQuestions.length); // Get a random index
      item = sessionQuestions[randomIndex]; // Get the item at that index
      sessionQuestions.splice(randomIndex, 1); // Remove the item from the array
    }
    setSessionQuestions([...sessionQuestions]); // Update the session questions in local storage

    if (sessionQuestions.length === 0) {
      // If no more questions are left, reset the session questions
      setSessionQuestions([...questions]); // Reset to the original questions
    }
    setCurrentQuestion(item); // Set the current question to the popped item
    return item;
  }, [
    currentQuestion,
    sessionQuestions,
    questions,
    setSessionQuestions,
    setCurrentQuestion,
  ]);

  useEffect(() => {
    // Initialize the first question when the component mounts
    if (!window.localStorage.getItem(`${gamePath}.currentQuestion`)) {
      popRandomQuestion();
    }
  }, [popRandomQuestion]);

  return { currentQuestion, popRandomQuestion, clearSessionQuestions, setCurrentQuestion };
};

export const shuffle = (array: any[]) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};
