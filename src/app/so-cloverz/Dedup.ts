//@ts-nocheck
const fs = require("fs");
const path = require("path");

const dir = "src/app/so-cloverz/data";
const easyPath = path.join(process.cwd(), dir, "easy.csv");
const hardPath = path.join(process.cwd(), dir, "hard.csv");
const outPath = path.join(process.cwd(), dir, "questions.csv");

const read = (p) =>
  fs.readFileSync(p, "utf8").split("\n").map((w) => w.trim()).filter(Boolean);

const easyWords = read(easyPath);
const hardWords = read(hardPath);

const easySet = new Set(easyWords);
const hardSet = new Set(hardWords);
const allWords = Array.from(new Set([...easyWords, ...hardWords])).sort();

const rows = ["word,category"];
for (const word of allWords) {
  if (easySet.has(word) && hardSet.has(word)) {
    rows.push(`${word},easy`); // prefer easy if somehow in both
  } else if (easySet.has(word)) {
    rows.push(`${word},easy`);
  } else {
    rows.push(`${word},hard`);
  }
}

fs.writeFileSync(outPath, rows.join("\n") + "\n");
console.log(`easy: ${easyWords.length}, hard: ${hardWords.length}, combined: ${allWords.length}`);
