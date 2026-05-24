import path from "path";
import csv from "csvtojson";
import Main, { WitQuestion } from "../Main";
import { GAME_PATH } from "../Constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  const questionPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/questions.csv`
  );
  const questions: WitQuestion[] = await csv().fromFile(questionPath);

  return <Main questions={questions} />;
}
