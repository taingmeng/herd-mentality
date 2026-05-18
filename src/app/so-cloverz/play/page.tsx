import path from "path";
import csv from "csvtojson";
import Main from "../Main";
import { GAME_PATH } from "../Constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  const questionPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/questions.csv`
  );
  const entries: { word: string }[] = await csv().fromFile(questionPath);
  const words = entries.map((e) => e.word);

  return <Main words={words} />;
}
