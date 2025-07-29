import path from "path";
import csv from "csvtojson";
import Main from "./Main";
import { Question } from "../global/Types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const questionPath = path.join(
    process.cwd(),
    "src/app/tapplez/data/questions.csv"
  );
  const questions: Question[] = (await csv().fromFile(questionPath));

  return <Main questions={questions} />;
}
