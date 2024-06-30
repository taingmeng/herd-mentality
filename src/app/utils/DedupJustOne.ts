//@ts-nocheck
const fs = require("fs");
const path = require("path");

const filePath = "src/data/just-one/questions.csv";
const absolutePath = path.join(process.cwd(), filePath);

fs.readFile(absolutePath, "utf8", (error, data) => {
  const lines = data.split("\n");
  const set = new Set();
  for (let i = 1; i < lines.length; i++) {
    set.add(lines[i]);
  }
  const newLines = Array.from(set).sort();
  newLines.unshift("question");
  fs.writeFile(absolutePath, newLines.join("\n"), (error) => {
    console.log(error || "Success " + (newLines.length - 1));
  });
});