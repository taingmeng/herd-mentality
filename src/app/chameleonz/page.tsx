import path from "path";
import csv from "csvtojson";
import Main from "@/app/chameleonz/Main";
import { GAME_PATH } from "./Constants";
import { Question } from "../global/Types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const questionPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/questions.csv`
  );
  const questions: Question[] = await csv().fromFile(questionPath);

  return <Main questions={questions} />;
}
