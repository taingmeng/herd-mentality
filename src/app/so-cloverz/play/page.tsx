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
  const entries: { word: string; category: string }[] = await csv().fromFile(questionPath);

  const easyWords = entries.filter((e) => e.category === "easy").map((e) => e.word);
  const hardWords = entries.filter((e) => e.category === "hard").map((e) => e.word);

  return <Main easyWords={easyWords} hardWords={hardWords} />;
}
