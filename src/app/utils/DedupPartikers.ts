//@ts-nocheck
const fs = require("fs");
const path = require("path");

const filePath = "src/app/monikerz/data/questions.csv";
const absolutePath = path.join(process.cwd(), filePath);

fs.writeFile(absolutePath, "category,word\n", (error) => {
  if (error) {
    console.error("Error writing file:", error);
  } else {
    console.log("File created successfully:", absolutePath);
  }
});

const fileNames = ["Celebrities", "Et Cetera", "Famous People", "Fictional Characters", "Places"];
fileNames.forEach((fileName) => {
  const absoluteFilePath = path.join(process.cwd(), `src/app/monikerz/data/${fileName}.csv`);
  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`File not found: ${absoluteFilePath}`);
    return;
  }

  fs.readFile(absoluteFilePath, "utf8", (error, data) => {
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
    fs.writeFile(absoluteFilePath, newLines.join("\n"), (error) => {
      console.log(error || fileName + " " + (newLines.length));
    });
    fs.writeFile(absolutePath, newLines.map(line => `${fileName},${line}`).join("\n"), { flag: 'a' }, (error) => {
      if (error) {
        console.error("Error appending to file:", error);
        return;
      }
    });
  });
});