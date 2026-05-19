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

const all = Array.from(new Set([...easyWords, ...hardWords])).sort();
fs.writeFileSync(outPath, ["word", ...all].join("\n") + "\n");
console.log(`easy: ${easyWords.length}, hard: ${hardWords.length}, combined: ${all.length}`);
