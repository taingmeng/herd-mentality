//@ts-nocheck
const fs = require("fs");
const path = require("path");

const filePath = "src/data/partikers/questions.csv";
const absolutePath = path.join(process.cwd(), filePath);

fs.readFile(absolutePath, "utf8", (error, data) => {
  const lines = data.split("\n");
  const set = new Set();
  const lowercaseSet = new Set();
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      if (!lowercaseSet.has(lines[i].toLowerCase())) {
        lowercaseSet.add(lines[i].toLowerCase())
        set.add(lines[i]);
      }
    }
  }
  const newLines = Array.from(set).sort();
  newLines.unshift("category,word");
  fs.writeFile(absolutePath, newLines.join("\n"), (error) => {
    console.log(error || "Success " + (newLines.length - 1));
  });
});