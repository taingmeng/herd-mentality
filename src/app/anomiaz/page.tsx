import path from "path";
import csv from "csvtojson";
import Main from "./Main";
import { GAME_PATH } from "./Constants";

export const dynamic = "force-dynamic";

interface CategoryEntry {
  category: string;
}

export default async function Page() {
  const questionPath = path.join(
    process.cwd(),
    `src/app/${GAME_PATH}/data/questions.csv`
  );
  const entries: CategoryEntry[] = await csv().fromFile(questionPath);
  const categories = entries.map((e) => e.category);

  return <Main categories={categories} />;
}
