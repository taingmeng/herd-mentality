import path from "path";
import csv from "csvtojson";
import Main from "./Main";
import { Question } from "../global/Types";

export const dynamic = "force-dynamic";

export default async function Poetry() {
  const questionPath = path.join(
    process.cwd(),
    "src/app/subjectivez/data/questions.csv"
  );
  const questions: Question[] = (await csv().fromFile(questionPath));

  return <Main questions={questions} />;
}
