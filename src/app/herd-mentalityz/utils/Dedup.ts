//@ts-nocheck
const fs = require("fs");
const path = require("path");

const dataPath = "src/app/herd-mentalityz/data";
const dir = path.join(process.cwd(), dataPath);
const outputPath = path.join(dir, "questions.csv");

fs.writeFileSync(outputPath, "category,word\n");

const files = fs.readdirSync(dir).sort();

for (const file of files) {
  if (!file.endsWith(".csv") || file === "questions.csv") continue;

  const category = file.replace(".csv", "");
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, "utf8");

  const seen = new Set();
  const unique = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(trimmed);
    }
  }

  unique.sort();

  fs.writeFileSync(filePath, unique.join("\n") + "\n");
  fs.appendFileSync(outputPath, unique.map(line => `${category},${line}`).join("\n") + "\n");
  console.log(`${category}: ${unique.length}`);
}
