import csv from "csvtojson";

interface Question {
  category: string;
  question: string;
  options: string[] | undefined;
}

let questions: Question[] = [];

csv()
  .fromFile("src/data/questions.csv")
  .then((jsonObj) => {
    questions = jsonObj;
  });

export async function GET() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const data = questions[randomIndex];
  return Response.json({ data });
}
