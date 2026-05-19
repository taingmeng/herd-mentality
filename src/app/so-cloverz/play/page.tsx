import path from "path";
import fs from "fs";
import Main from "../Main";
import { GAME_PATH } from "../Constants";

export const dynamic = "force-dynamic";

function readWordList(filePath: string): string[] {
  const abs = path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readFileSync(abs, "utf8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);
}

export default function Page() {
  const base = `src/app/${GAME_PATH}/data`;
  const easyWords = readWordList(`${base}/easy.csv`);
  const hardWords = readWordList(`${base}/hard.csv`);

  return <Main easyWords={easyWords} hardWords={hardWords} />;
}
