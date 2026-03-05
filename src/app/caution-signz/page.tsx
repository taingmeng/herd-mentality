import path from "path";
import csv from "csvtojson";
import Main from "@/app/caution-signz/Main";
import { GAME_PATH } from "./Constants";

export const dynamic = "force-dynamic";

interface WordEntry {
  word: string;
}

export default async function Page() {
  const descriptorsPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/descriptors.csv`
  );
  const subjectsPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/subjects.csv`
  );

  const descriptors: WordEntry[] = await csv().fromFile(descriptorsPath);
  const subjects: WordEntry[] = await csv().fromFile(subjectsPath);

  return (
    <Main
      descriptors={descriptors.map((d) => d.word)}
      subjects={subjects.map((s) => s.word)}
    />
  );
}
