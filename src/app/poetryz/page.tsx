import path from "path";
import csv from "csvtojson";
import Main, { PoetryQuestion } from "./Main";

export const dynamic = "force-dynamic";

const capitalize = (words: string) => {
  return words
    .split(" ")
    .filter((word) => word.length)
    .map((word) => {
      if (word.length === 1) {
        return word.toUpperCase();
      }
      return word[0].toUpperCase() + word.substring(1);
    })
    .join(" ");
};

export default async function Poetry() {
  const questionPath = path.join(
    process.cwd(),
    "src/data/poetry/questions.csv"
  );
  const questions: PoetryQuestion[] = (await csv().fromFile(questionPath))
  .map(question => ({
    word: capitalize(question.word),
    long: capitalize(question.long),
  }));

  return <Main questions={questions} />;
}
