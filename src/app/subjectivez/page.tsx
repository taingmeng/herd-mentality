import path from "path";
import csv from "csvtojson";
import Main, { Question } from "./Main";

export const dynamic = "force-dynamic";

export default async function Poetry() {
  const questionPath = path.join(
    process.cwd(),
    "src/app/subjectivez/data/questions.csv"
  );
  const questions: Question[] = (await csv().fromFile(questionPath));

  return <Main questions={questions} />;
}
