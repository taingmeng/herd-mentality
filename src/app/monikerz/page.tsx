import path from "path";
import csv from "csvtojson";
import Partikers, { PartikersQuestion } from "./PartikersMain";

export const dynamic = "force-dynamic";

export default async function Poetry() {
  const questionPath = path.join(
    process.cwd(),
    "src/app/monikerz/data/questions.csv"
  );
  const questions: PartikersQuestion[] = (await csv().fromFile(questionPath));

  return <Partikers questions={questions} />;
}
