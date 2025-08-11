//@ts-nocheck
const fs = require("fs");
const path = require("path");

const dataPath = `src/app/insiderz/data`;
const filePath = dataPath + "/questions.csv";
const absolutePath = path.join(process.cwd(), filePath);

fs.writeFile(absolutePath, "category,word\n", (error) => {
  if (error) {
    console.error("Error writing file:", error);
  } else {
    console.log("File created successfully:", absolutePath);
  }
});

fs.readdir(path.join(process.cwd(), dataPath), (err, files) => {
  files.forEach(file => {
    console.log("Processing file:", file);
    if (file === "questions.csv" || file === "questions_test.csv") {
      return;
    }
    const fileName = file.replace(".csv", "");
    const absoluteFilePath = path.join(process.cwd(), `${dataPath}/${fileName}.csv`);
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
      fs.writeFile(absolutePath, newLines.map(line => `${fileName},${line}`).join("\n") + "\n", { flag: 'a' }, (error) => {
        if (error) {
          console.error("Error appending to file:", error);
          return;
        }
      });
    });
  });
});