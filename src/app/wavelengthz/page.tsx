import path from "path";
import csv from "csvtojson";
import Main from "./Main";
import { Question } from "../global/Types";
import { GAME_PATH } from "./Constants";

export const dynamic = "force-dynamic";

export default async function Poetry() {
  const questionPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/questions.csv`
  );
  const questions: Question[] = await csv().fromFile(questionPath);

  return <Main questions={questions} />;
}
